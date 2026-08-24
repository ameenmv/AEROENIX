<script setup lang="ts">
/**
 * FileList — displays a list/grid of uploaded files with icons, names, sizes, and actions.
 */
import type { HTMLAttributes } from 'vue'
import type { FileInfo } from './FileItem.vue'
import type { FileListVariants } from './variants'
import { cn } from '@/utils/cn'
import FileItem from './FileItem.vue'
import { fileListVariants } from './variants'

const props = withDefaults(
  defineProps<{
    files: FileInfo[]
    layout?: FileListVariants['layout']
    size?: FileListVariants['size']
    removable?: boolean
    downloadable?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    layout: 'list',
    size: 'default',
    removable: true,
    downloadable: true,
  },
)

const emit = defineEmits<{
  remove: [file: FileInfo]
  download: [file: FileInfo]
}>()
</script>

<template>
  <div data-slot="file-list" :class="cn(fileListVariants({ layout, size }), props.class)">
    <FileItem
      v-for="(file, i) in files"
      :key="`${file.name}-${i}`"
      :file="file"
      :layout="layout"
      :removable="removable"
      :downloadable="downloadable"
      @remove="emit('remove', $event)"
      @download="emit('download', $event)"
    />

    <slot v-if="!files.length" name="empty">
      <p class="text-muted-foreground text-center py-6">
        {{ $t('common.no_files', 'No files') }}
      </p>
    </slot>
  </div>
</template>
