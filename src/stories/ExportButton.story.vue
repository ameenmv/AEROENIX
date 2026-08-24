<script setup lang="ts">
import { ExportButton } from '@/components/uic/export-button'

function onExport(format: string) {
  // eslint-disable-next-line no-console
  console.log(`Exporting as: ${format}`)
}
</script>

<template>
  <Story title="ExportButton" group="inputs" icon="lucide:download">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="flex flex-wrap gap-3">
            <ExportButton @export="onExport" />
            <ExportButton label="Download" :formats="['csv', 'excel']" @export="onExport" />
            <ExportButton variant="default" size="default" @export="onExport" />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="flex flex-wrap gap-3">
            <ExportButton @export="onExport" />
            <ExportButton label="Download" :formats="['csv', 'excel']" @export="onExport" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
