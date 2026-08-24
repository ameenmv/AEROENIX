<script setup lang="ts">
import type { FileInfo } from '@/components/uic/file-list/FileItem.vue'
import { FileList } from '@/components/uic/file-list'

const files: FileInfo[] = [
  { name: 'report-2024.pdf', size: 2048000, type: 'application/pdf', url: '#' },
  { name: 'profile-photo.jpg', size: 512000, type: 'image/jpeg', url: '#' },
  { name: 'data-export.csv', size: 128000, type: 'text/csv', url: '#' },
  { name: 'presentation.mp4', size: 15360000, type: 'video/mp4', url: '#' },
]
</script>

<template>
  <Story title="FileList" group="display" icon="lucide:file">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <FileList :files="files" class="max-w-md" />
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <FileList :files="files" class="max-w-md" />
        </div>
      </div>
    </Variant>
    <Variant title="Empty">
      <div class="p-8">
        <div class="light p-8 rounded-xl bg-background border border-border">
          <FileList :files="[]" class="max-w-md" />
        </div>
      </div>
    </Variant>
  </Story>
</template>
