<script setup lang="ts">
import { Delete02Icon, Edit02Icon, MoreVerticalIcon, ViewIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'

defineProps<{
  row: Record<string, unknown>
  deleteLoading?: boolean
}>()

defineEmits<{
  (e: 'view'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex items-center justify-end">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button size="sm" variant="ghost" class="h-8 w-8 p-0">
          <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-40">
        <DropdownMenuItem @click="$emit('view')">
          <HugeiconsIcon :icon="ViewIcon" :size="14" class="mr-2 text-muted-foreground" />
          {{ t('actions.view', 'View') }}
        </DropdownMenuItem>
        <DropdownMenuItem @click="$emit('edit')">
          <HugeiconsIcon :icon="Edit02Icon" :size="14" class="mr-2 text-muted-foreground" />
          {{ t('actions.edit', 'Edit') }}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" @click="$emit('delete')">
          <HugeiconsIcon :icon="Delete02Icon" :size="14" class="mr-2" />
          {{ t('actions.delete', 'Delete') }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
