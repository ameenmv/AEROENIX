<script setup lang="ts">
/**
 * FileItem — a single file row/card with icon, name, size, and action buttons.
 * Composes shadcn Badge + Tooltip for consistent design system integration.
 */
import type { HTMLAttributes } from 'vue'
import type { FileItemVariants } from './variants'
import { Download, File, FileImage, FileText, FileVideo, Trash2 } from 'lucide-vue-next'
import { computed } from 'vue'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/uic/tooltip'
import { cn } from '@/utils/cn'
import { fileItemVariants } from './variants'

export interface FileInfo {
  /** File name */
  name: string
  /** File size in bytes */
  size?: number
  /** MIME type or file extension */
  type?: string
  /** URL for download/preview */
  url?: string
  /** Any extra metadata */
  [key: string]: unknown
}

const props = withDefaults(
  defineProps<{
    file: FileInfo
    layout?: FileItemVariants['layout']
    removable?: boolean
    downloadable?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    layout: 'list',
    removable: true,
    downloadable: true,
  },
)

const emit = defineEmits<{
  remove: [file: FileInfo]
  download: [file: FileInfo]
}>()

const fileIcon = computed(() => {
  const t = (props.file.type || props.file.name || '').toLowerCase()
  if (t.includes('image') || /\.(?:png|jpg|jpeg|gif|svg|webp)$/.test(t))
    return FileImage
  if (t.includes('video') || /\.(?:mp4|webm|mov|avi)$/.test(t))
    return FileVideo
  if (t.includes('text') || t.includes('pdf') || /\.(?:txt|pdf|doc|docx|xls|xlsx|csv)$/.test(t))
    return FileText
  return File
})

const fileExt = computed(() => {
  const parts = props.file.name.split('.')
  return parts.length > 1 ? parts.pop()!.toUpperCase() : ''
})

function formatSize(bytes?: number): string {
  if (!bytes)
    return ''
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div
    data-slot="file-item"
    :class="cn(fileItemVariants({ layout }), props.class)"
  >
    <!-- Icon -->
    <div class="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
      <component :is="fileIcon" :size="18" />
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <p class="font-medium text-foreground truncate m-0 leading-tight">
        {{ file.name }}
      </p>
      <div class="flex items-center gap-1.5 mt-0.5">
        <span v-if="file.size" class="text-xs text-muted-foreground">
          {{ formatSize(file.size) }}
        </span>
        <Badge v-if="fileExt" variant="secondary" class="text-[10px] px-1 py-0 font-mono">
          {{ fileExt }}
        </Badge>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-0.5 shrink-0">
      <TooltipProvider v-if="downloadable && file.url">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon-sm" @click="emit('download', file)">
              <Download :size="14" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{{ $t('common.download', 'Download') }}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider v-if="removable">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon-sm" class="text-destructive hover:bg-destructive/10" @click="emit('remove', file)">
              <Trash2 :size="14" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{{ $t('common.remove', 'Remove') }}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>
