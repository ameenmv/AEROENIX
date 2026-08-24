<script setup lang="ts">
import type { ActionItem } from '@/components/uic/dropdown-actions'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'
import { DropdownActions } from '@/components/uic/dropdown-actions'

const actions: ActionItem[] = [
  { key: 'view', label: 'View', icon: Eye },
  { key: 'edit', label: 'Edit', icon: Pencil },
  { key: 'delete', label: 'Delete', icon: Trash2, destructive: true, separatorBefore: true },
]

function onAction(key: string) {
  // eslint-disable-next-line no-console
  console.log(`Action: ${key}`)
}
</script>

<template>
  <Story title="DropdownActions" group="inputs" icon="lucide:more-horizontal">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground">Row action menu:</span>
            <DropdownActions :items="actions" @action="onAction" />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground">Row action menu:</span>
            <DropdownActions :items="actions" @action="onAction" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
