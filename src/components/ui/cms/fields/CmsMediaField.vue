<script setup lang="ts">
import type { InjectionKey } from 'vue'
import { computed, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Label } from '@/components/uic/label'
import { cn } from '@/lib/utils'
import { tempUploadsService } from '@/services/tempUploadsService'

const props = defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  multiple?: boolean
  allowedTypes?: string[]
  placeholder?: string
  error?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void
}>()

/** Injection key for form context (incrementUploads/decrementUploads) */
const FormContextKey: InjectionKey<any> = Symbol('FormContext')

const { t } = useI18n()
const injectedForm = inject(FormContextKey as any, null) as any
const fileInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const sizeError = ref('')
const uploading = ref(false)

const maxFileSize = 10 * 1024 * 1024 // 10MB

// ── Multi-file local state ──────────────────────────────────────────────────
interface LocalFile {
  id: string
  name: string
  preview: string
  uploading: boolean
  token?: string
  error?: string
}

const localFiles = ref<LocalFile[]>([])

// ── Single-file local state (non-multiple mode) ─────────────────────────────
const localPreview = ref('')
const localFileName = ref('')

// Map CMS media types to mime/extensions
const acceptMapping: Record<string, string[]> = {
  images: ['image/*'],
  videos: ['video/*'],
  documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
  audio: ['audio/*'],
  all: ['*/*'],
}

const acceptList = computed(() => {
  if (!props.allowedTypes || props.allowedTypes.length === 0)
    return '*/*'
  if (props.allowedTypes.includes('all'))
    return '*/*'
  return props.allowedTypes.flatMap(type => acceptMapping[type] || []).join(',')
})

const videoExtensions = /\.(?:mp4|webm|ogg|mov|avi|mkv|m4v|3gp|wmv)$/i

function isVideoFile(name: string, url?: string): boolean {
  if (name && videoExtensions.test(name))
    return true
  if (url && videoExtensions.test(url))
    return true
  return false
}

function formatSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes}B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function validateFile(file: File): boolean {
  sizeError.value = ''
  if (maxFileSize && file.size > maxFileSize) {
    sizeError.value = `File size (${formatSize(file.size)}) exceeds the limit of ${formatSize(maxFileSize)}`
    return false
  }
  return true
}

// ── Existing files from CMS (server data) ───────────────────────────────────
interface CmsMediaItem {
  url: string
  thumb?: string
  name: string
  id?: number | string
}

const existingFiles = computed<CmsMediaItem[]>(() => {
  const val = props.modelValue
  if (!val)
    return []

  // Already an array of objects
  if (Array.isArray(val)) {
    return val
      .filter(item => typeof item === 'object' && item !== null && (item.url || item.thumb))
      .map(item => ({
        url: item.url || item.thumb || '',
        thumb: item.thumb || item.url || '',
        name: item.file_name || item.name || item.url?.split('/').pop() || 'file',
        id: item.id,
      }))
  }

  // Single object
  if (typeof val === 'object' && !Array.isArray(val) && (val.url || val.thumb)) {
    return [{
      url: val.url || val.thumb || '',
      thumb: val.thumb || val.url || '',
      name: val.file_name || val.name || 'file',
      id: val.id,
    }]
  }

  return []
})

// ── Single mode computeds ───────────────────────────────────────────────────
const singleDisplayUrl = computed(() => {
  if (localPreview.value)
    return localPreview.value
  const val = props.modelValue
  if (!val)
    return ''
  if (typeof val === 'object' && !Array.isArray(val))
    return val.url || val.thumb || ''
  if (Array.isArray(val) && val.length > 0) {
    const first = val[0]
    if (typeof first === 'object')
      return first.url || first.thumb || ''
    return typeof first === 'string' ? first : ''
  }
  if (typeof val === 'string')
    return val
  return ''
})

const singleFileName = computed(() => {
  if (uploading.value)
    return t('common.uploading', 'Uploading...')
  if (localFileName.value)
    return localFileName.value
  const val = props.modelValue
  if (typeof val === 'object' && !Array.isArray(val))
    return val.file_name || val.name || ''
  if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object')
    return val[0].file_name || val[0].name || ''
  if (singleDisplayUrl.value)
    return singleDisplayUrl.value.split('/').pop() || t('common.media_file', 'Media File')
  return ''
})

const hasSinglePreview = computed(() => singleDisplayUrl.value.length > 0)

const singleIsVideo = computed(() => {
  return isVideoFile(localFileName.value || singleFileName.value, singleDisplayUrl.value)
})

// ── Upload logic ────────────────────────────────────────────────────────────
async function uploadSingleFile(file: File) {
  if (!validateFile(file))
    return

  localPreview.value = URL.createObjectURL(file)
  localFileName.value = file.name
  uploading.value = true

  if (injectedForm?.incrementUploads)
    injectedForm.incrementUploads()

  try {
    const result = await tempUploadsService.upload(file, 'default')
    emit('update:modelValue', [result.token])
  }
  catch (err: any) {
    sizeError.value = err?.response?.data?.message || err?.message || 'Upload failed'
    localPreview.value = ''
    localFileName.value = ''
  }
  finally {
    uploading.value = false
    if (injectedForm?.decrementUploads)
      injectedForm.decrementUploads()
  }
}

async function uploadMultiFile(file: File) {
  if (!validateFile(file))
    return

  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const entry: LocalFile = {
    id,
    name: file.name,
    preview: URL.createObjectURL(file),
    uploading: true,
  }
  localFiles.value.push(entry)

  if (injectedForm?.incrementUploads)
    injectedForm.incrementUploads()

  try {
    const result = await tempUploadsService.upload(file, 'default')
    const idx = localFiles.value.findIndex(f => f.id === id)
    if (idx !== -1) {
      localFiles.value[idx]!.uploading = false
      localFiles.value[idx]!.token = result.token
    }
    // Emit updated tokens: existing IDs + all uploaded tokens
    emitMultiValue()
  }
  catch (err: any) {
    const idx = localFiles.value.findIndex(f => f.id === id)
    if (idx !== -1) {
      localFiles.value[idx]!.uploading = false
      localFiles.value[idx]!.error = err?.response?.data?.message || err?.message || 'Upload failed'
    }
  }
  finally {
    if (injectedForm?.decrementUploads)
      injectedForm.decrementUploads()
  }
}

function emitMultiValue() {
  // Backend expects only upload tokens — existing files are already stored server-side
  const newTokens = localFiles.value.filter(f => f.token && !f.error).map(f => f.token)
  // If there are existing server files, keep their IDs so the backend knows not to delete them
  const existingIds = existingFiles.value.map(f => f.id).filter(Boolean)
  emit('update:modelValue', [...existingIds, ...newTokens])
}

function removeExistingFile(index: number) {
  const remaining = [...existingFiles.value]
  remaining.splice(index, 1)
  // Re-emit: remaining existing IDs + local tokens
  const ids = remaining.map(f => f.id).filter(Boolean)
  const newTokens = localFiles.value.filter(f => f.token && !f.error).map(f => f.token)
  emit('update:modelValue', [...ids, ...newTokens])
}

function removeLocalFile(index: number) {
  if (localFiles.value[index]?.preview) {
    URL.revokeObjectURL(localFiles.value[index].preview)
  }
  localFiles.value.splice(index, 1)
  emitMultiValue()
}

// ── File handlers ───────────────────────────────────────────────────────────
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files)
    return

  if (props.multiple) {
    Array.from(target.files).forEach(file => uploadMultiFile(file))
  }
  else if (target.files[0]) {
    uploadSingleFile(target.files[0])
  }
  // Reset input so same file can be selected again
  target.value = ''
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
  if (!event.dataTransfer?.files)
    return

  if (props.multiple) {
    Array.from(event.dataTransfer.files).forEach(file => uploadMultiFile(file))
  }
  else if (event.dataTransfer.files[0]) {
    uploadSingleFile(event.dataTransfer.files[0])
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  dragOver.value = true
}

function handleDragLeave() {
  dragOver.value = false
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function clearSingle() {
  localPreview.value = ''
  localFileName.value = ''
  emit('update:modelValue', [])
  if (fileInputRef.value)
    fileInputRef.value.value = ''
}

const anyUploading = computed(() => {
  return uploading.value || localFiles.value.some(f => f.uploading)
})

const hasMultiFiles = computed(() => {
  return existingFiles.value.length > 0 || localFiles.value.length > 0
})
</script>

<template>
  <div class="space-y-1.5 w-full">
    <Label
      v-if="label"
      :class="cn('text-sm font-semibold tracking-tight', error ? 'text-destructive' : '')"
    >
      {{ label }}
      <span v-if="required" class="text-destructive ml-0.5">*</span>
    </Label>

    <!-- ══════════ SINGLE MODE ══════════ -->
    <template v-if="!multiple">
      <div
        :class="cn(
          'image-input-zone relative rounded-md border border-dashed border-input transition-all cursor-pointer overflow-hidden',
          dragOver ? 'border-primary bg-primary/5' : 'hover:border-primary/50',
          error ? 'border-destructive' : '',
          disabled || uploading ? 'opacity-50 pointer-events-none' : '',
        )"
        @click="triggerFileInput"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <div v-if="hasSinglePreview" class="relative group">
          <img
            v-if="!singleIsVideo"
            :src="singleDisplayUrl"
            :alt="singleFileName"
            class="w-full h-48 object-contain bg-black/20"
          >
          <video
            v-else
            :src="singleDisplayUrl"
            class="w-full h-48 object-contain bg-black/20"
            controls
          />

          <div
            v-if="uploading"
            class="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <div class="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div v-if="!uploading" class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              class="image-input-action"
              :title="$t('common.image_change', 'Change file')"
              @click.stop="triggerFileInput"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
            </button>
            <button
              type="button"
              class="image-input-action text-destructive"
              :title="$t('common.image_remove', 'Remove file')"
              @click.stop="clearSingle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            </button>
          </div>
          <div class="px-3 py-1.5 bg-card border-t border-border">
            <p class="text-[11px] text-muted-foreground truncate">
              {{ singleFileName }}
            </p>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-10 px-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/40 mb-3"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
          <p class="text-sm font-medium text-muted-foreground mb-1">
            {{ $t('common.image_click_to_upload', 'Click to upload or drag & drop') }}
          </p>
          <p class="text-xs text-muted-foreground/60">
            {{ allowedTypes?.length ? allowedTypes.join(', ') : $t('common.allowed_file_types', 'PNG, JPG, SVG, WebP, Video') }}
          </p>
        </div>
      </div>
    </template>

    <!-- ══════════ MULTIPLE MODE ══════════ -->
    <template v-else>
      <!-- Files Grid -->
      <div v-if="hasMultiFiles" class="space-y-2">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <!-- Existing server files -->
          <div
            v-for="(file, idx) in existingFiles"
            :key="`existing-${file.id || idx}`"
            class="relative group rounded-lg border border-border overflow-hidden bg-card"
          >
            <img
              v-if="!isVideoFile(file.name, file.url)"
              :src="file.thumb || file.url"
              :alt="file.name"
              class="w-full h-28 object-cover bg-black/10"
            >
            <video
              v-else
              :src="file.url"
              class="w-full h-28 object-cover bg-black/10"
            />
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                class="image-input-action text-destructive !w-8 !h-8"
                :title="$t('actions.remove', 'Remove')"
                @click="removeExistingFile(idx)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
              </button>
            </div>
            <div class="px-2 py-1 border-t border-border">
              <p class="text-[10px] text-muted-foreground truncate">
                {{ file.name }}
              </p>
            </div>
          </div>

          <!-- Locally uploaded files -->
          <div
            v-for="(file, idx) in localFiles"
            :key="file.id"
            class="relative group rounded-lg border border-border overflow-hidden bg-card"
          >
            <img
              v-if="!isVideoFile(file.name, file.preview)"
              :src="file.preview"
              :alt="file.name"
              class="w-full h-28 object-cover bg-black/10"
            >
            <video
              v-else
              :src="file.preview"
              class="w-full h-28 object-cover bg-black/10"
            />
            <!-- Upload spinner -->
            <div
              v-if="file.uploading"
              class="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div class="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <!-- Error overlay -->
            <div
              v-else-if="file.error"
              class="absolute inset-0 bg-destructive/20 flex items-center justify-center p-2"
            >
              <p class="text-[10px] text-destructive text-center font-medium">
                {{ file.error }}
              </p>
            </div>
            <!-- Hover remove -->
            <div v-else class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                class="image-input-action text-destructive !w-8 !h-8"
                :title="$t('actions.remove', 'Remove')"
                @click="removeLocalFile(idx)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
              </button>
            </div>
            <div class="px-2 py-1 border-t border-border">
              <p class="text-[10px] text-muted-foreground truncate">
                {{ file.name }}
              </p>
            </div>
          </div>

          <!-- Add more button -->
          <button
            type="button"
            class="flex flex-col items-center justify-center h-28 rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-card hover:bg-muted/20 transition-all cursor-pointer"
            :class="disabled || anyUploading ? 'opacity-50 pointer-events-none' : ''"
            @click.stop="triggerFileInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/50 mb-1"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
            <span class="text-[10px] text-muted-foreground">
              {{ $t('cms.add_more', 'Add more') }}
            </span>
          </button>
        </div>
      </div>

      <!-- Empty drop zone (no files yet) -->
      <div
        v-else
        :class="cn(
          'image-input-zone relative rounded-md border border-dashed border-input transition-all cursor-pointer overflow-hidden',
          dragOver ? 'border-primary bg-primary/5' : 'hover:border-primary/50',
          error ? 'border-destructive' : '',
          disabled ? 'opacity-50 pointer-events-none' : '',
        )"
        @click="triggerFileInput"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <div class="flex flex-col items-center justify-center py-10 px-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/40 mb-3"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
          <p class="text-sm font-medium text-muted-foreground mb-1">
            {{ $t('common.image_click_to_upload', 'Click to upload or drag & drop') }}
          </p>
          <p class="text-xs text-muted-foreground/60">
            {{ $t('cms.upload_multiple_hint', 'You can select multiple files') }}
          </p>
        </div>
      </div>
    </template>

    <input
      ref="fileInputRef"
      type="file"
      :accept="acceptList"
      :multiple="multiple"
      class="hidden"
      :disabled="disabled || anyUploading"
      @change="handleFileSelect"
    >

    <p v-if="sizeError" class="text-[0.8rem] text-destructive font-medium">
      {{ sizeError }}
    </p>
    <p v-else-if="error" class="text-[0.8rem] text-destructive font-medium">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.image-input-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: hsl(var(--card));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
  cursor: pointer;
  transition: all 0.15s;
}
.image-input-action:hover {
  background: hsl(var(--accent));
}
</style>
