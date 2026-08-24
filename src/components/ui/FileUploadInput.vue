<script setup lang="ts">
import type { FileWithStatus } from '@/composables/useFileUpload'
import {
  CancelCircleIcon,
  EyeIcon,
  File01Icon,
  Loading01Icon,
  RefreshIcon,
  Upload01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { cva } from 'class-variance-authority'
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button as Btn } from '@/components/uic/button'
import { useFileUpload } from '@/composables/useFileUpload'
import { useSonarStore } from '@/stores/sonar'
import { cn } from '@/utils/cn'

interface Props {
  accept?: string[]
  maxSize?: number
  minSize?: number
  maxFiles?: number
  multiple?: boolean
  validate?: (file: File) => boolean | Promise<boolean>
  uploadUrl?: string
  headers?: Record<string, string>
  autoUpload?: boolean
  disabled?: boolean
  fileTypeIcons?: Record<string, any>
}
const props = withDefaults(defineProps<Props>(), {
  accept: () => [],
  maxSize: Infinity,
  minSize: 0,
  maxFiles: 10,
  multiple: false,
  uploadUrl: '',
  headers: () => ({}),
  autoUpload: false,
  disabled: false,
  fileTypeIcons: () => ({}),
  validate: () => true,
})
const emit = defineEmits<{
  fileChange: [files: File[]]
  uploadStart: []
  uploadProgress: [progress: number]
  uploadSuccess: [file: any]
  uploadError: [error: any]
  validationError: [errors: string[]]
}>()
const { t } = useI18n()
const fileUpload = useFileUpload({
  accept: props.accept,
  maxSize: props.maxSize,
  minSize: props.minSize,
  maxFiles: props.maxFiles,
  multiple: props.multiple,
  validate: props.validate,
  uploadUrl: props.uploadUrl,
  headers: props.headers,
  autoUpload: props.autoUpload,
})
const {
  files,
  isOverDropZone,
  openFileDialog,
  uploadFile,
  uploadAll,
  removeFile,
  clearFiles,
  totalProgress,
  isUploading,
  validFiles,
  invalidFiles,
  uploadedFiles,
  errorFiles,
  dropZoneRef: _dropZoneRef,
} = fileUpload
const sonarStore = useSonarStore()
const acceptedFormats = computed(() => {
  if (!props.accept || props.accept.length === 0)
    return t('common.all_formats')
  return props.accept.join(', ')
})
function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
function getFileIcon(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, any> = {
    'jpg': File01Icon,
    'jpeg': File01Icon,
    'png': File01Icon,
    'gif': File01Icon,
    'svg': File01Icon,
    'webp': File01Icon,
    'pdf': File01Icon,
    'doc': File01Icon,
    'docx': File01Icon,
    'txt': File01Icon,
    'rtf': File01Icon,
    'xls': File01Icon,
    'xlsx': File01Icon,
    'csv': File01Icon,
    'ppt': File01Icon,
    'pptx': File01Icon,
    'zip': File01Icon,
    'rar': File01Icon,
    '7z': File01Icon,
    'default': File01Icon,
  }
  return (
    props.fileTypeIcons[extension || 'default'] || iconMap[extension || 'default'] || File01Icon
  )
}
async function retryUpload(file: FileWithStatus) {
  const fileIndex = files.value.findIndex(f => f.id === file.id)
  if (fileIndex !== -1 && files.value[fileIndex]) {
    files.value[fileIndex].status = 'valid'
    files.value[fileIndex].error = undefined
    await uploadFile(files.value[fileIndex])
  }
}
function openFile(url: string) {
  window.open(url, '_blank')
}
watch(
  files,
  (newFiles) => {
    emit(
      'fileChange',
      newFiles.map(f => f as File),
    )
  },
  { deep: true },
)
watch(totalProgress, (progress) => {
  emit('uploadProgress', progress)
})
watch(
  uploadedFiles,
  (newUploaded) => {
    if (newUploaded.length > 0) {
      sonarStore.success(
        t('common.upload_success_title'),
        t('common.upload_success_message', { count: newUploaded.length }),
      )
      emit('uploadSuccess', newUploaded.at(-1))
    }
  },
  { deep: true },
)
watch(
  errorFiles,
  (newErrors) => {
    if (newErrors.length > 0) {
      sonarStore.error(
        t('common.upload_error_title'),
        t('common.upload_error_message', { count: newErrors.length }),
      )
      const lastError = newErrors.at(-1)
      emit('uploadError', lastError?.error)
    }
  },
  { deep: true },
)
watch(
  invalidFiles,
  (newInvalid) => {
    if (newInvalid.length > 0) {
      const errors = newInvalid.map(f => f?.error).filter(Boolean) as string[]
      if (errors.length > 0) {
        sonarStore.warning(t('common.validation_error_title'), errors.join('; '))
        emit('validationError', errors)
      }
    }
  },
  { deep: true },
)
watch(
  isUploading,
  (uploading) => {
    if (uploading) {
      sonarStore.info(t('common.upload_started_title'), t('common.upload_started_message'))
      emit('uploadStart')
    }
  },
  { immediate: true },
)
const dropZoneVariants = cva('w-full border-2 border-dashed rounded-lg p-6 transition-colors', {
  variants: {
    state: {
      default: 'border-gray-300',
      active: 'border-blue-500 bg-blue-50',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: '',
    },
  },
  defaultVariants: {
    state: 'default',
    disabled: false,
  },
})
const fileItemVariants = cva('flex items-center justify-between p-3 bg-white rounded-lg border', {
  variants: {
    status: {
      valid: 'border-gray-200',
      idle: 'border-gray-200',
      uploading: 'border-gray-200',
      invalid: 'border-red-200 bg-red-50',
      error: 'border-red-300 bg-red-50',
      uploaded: 'border-green-200 bg-green-50',
    },
  },
  defaultVariants: {
    status: 'idle',
  },
})
</script>

<template>
  <div
    ref="_dropZoneRef"
    :class="cn(dropZoneVariants({ state: isOverDropZone ? 'active' : 'default', disabled }))"
  >
    <div
      class="cursor-pointer flex flex-col items-center justify-center transition-colors"
      :class="files.length > 0 ? 'min-h-[300px]' : 'min-h-[200px]'"
      @click="!disabled && openFileDialog()"
    >
      <div v-if="files.length === 0" class="flex flex-col items-center justify-center text-center">
        <div class="mb-4 text-gray-400">
          <HugeiconsIcon :icon="Upload01Icon" :size="24" />
        </div>
        <p class="text-gray-600 mb-2">
          <span class="text-blue-600 font-medium hover:underline">{{
            t('common.click_to_upload')
          }}</span>
          {{ t('common.or_drag_drop') }}
        </p>
        <p class="text-sm text-gray-500">
          {{ t('common.supported_formats', { formats: acceptedFormats }) }}
          <span v-if="maxSize">{{ $t('common.•') }}{{ t('common.max_size', { size: formatFileSize(maxSize) }) }}</span>
          <span v-if="maxFiles">{{ $t('common.•') }}{{ t('common.max_files', { count: maxFiles }) }}</span>
        </p>
      </div>
      <div v-else class="w-full space-y-3">
        <div
          v-for="file in files"
          :key="file.id"
          :class="cn(fileItemVariants({ status: file.status }))"
        >
          <div class="flex items-center flex-1 min-w-0">
            <HugeiconsIcon
              :icon="getFileIcon(file)"
              :size="16"
              class="mr-3 text-gray-500 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 truncate">
                {{ file.name }}
              </div>
              <div class="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <span v-if="file.status === 'uploading'" class="text-blue-600 font-medium">{{ file.progress }}%</span>
                <span v-if="file.status === 'error'" class="text-red-600 font-medium">{{
                  file.error
                }}</span>
                <span v-if="file.status === 'uploaded'" class="text-green-600 font-medium">{{
                  t('common.uploaded')
                }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <div
              v-if="file.status === 'uploading'"
              class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden"
            >
              <div
                class="h-full bg-blue-500 transition-all duration-300"
                :style="{ width: `${file.progress}%` }"
              />
            </div>
            <Btn
              v-if="file.status === 'valid' || file.status === 'idle'"
              variant="ghost"
              size="icon"
              class="w-fit! h-fit! p-1.5! focus:ring-2! focus:ring-blue-500! text-red-500! hover:bg-red-100! rounded-full!"
              :aria-label="t('common.remove_file')"
              @click.stop="removeFile(file.id)"
            >
              <HugeiconsIcon :icon="CancelCircleIcon" :size="16" />
            </Btn>
            <Btn
              v-else-if="file.status === 'error'"
              variant="ghost"
              size="icon"
              class="w-fit! h-fit! p-1.5! focus:ring-2! focus:ring-blue-500! text-blue-500! hover:bg-blue-100! rounded-full!"
              :aria-label="t('common.retry_upload')"
              @click.stop="retryUpload(file)"
            >
              <HugeiconsIcon :icon="RefreshIcon" :size="16" />
            </Btn>
            <Btn
              v-else-if="file.status === 'uploaded' && file.uploadedUrl"
              variant="ghost"
              size="icon"
              class="w-fit! h-fit! p-1.5! focus:ring-2! focus:ring-blue-500! text-green-500! hover:bg-green-100! rounded-full!"
              :aria-label="t('common.view_file')"
              @click.stop="openFile(file.uploadedUrl)"
            >
              <HugeiconsIcon :icon="EyeIcon" :size="16" />
            </Btn>
            <Btn
              v-if="file.status !== 'uploading'"
              variant="ghost"
              size="icon"
              class="w-fit! h-fit! p-1.5! focus:ring-2! focus:ring-blue-500! text-red-500! hover:bg-red-100! rounded-full!"
              :aria-label="t('common.remove_file')"
              @click.stop="removeFile(file.id)"
            >
              <HugeiconsIcon :icon="CancelCircleIcon" :size="16" />
            </Btn>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="files.length > 0"
      class="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200"
    >
      <Btn
        variant="secondary"
        class="flex! items-center! space-x-2!"
        :disabled="isUploading"
        @click="clearFiles"
      >
        {{ t('common.clear_all') }}
      </Btn>
      <Btn
        variant="default"
        class="flex! items-center! space-x-2!"
        :disabled="isUploading || validFiles.length === 0"
        @click="uploadAll"
      >
        <HugeiconsIcon v-if="isUploading" :icon="Loading01Icon" :size="16" class="animate-spin" />
        <HugeiconsIcon v-else :icon="Upload01Icon" :size="16" />
        <span>{{ isUploading ? t('common.uploading') : t('common.upload_files') }}</span>
        <span v-if="totalProgress > 0 && totalProgress < 100" class="ml-2">({{ totalProgress }}%)</span>
      </Btn>
    </div>
  </div>
</template>
