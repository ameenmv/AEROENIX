<script setup lang="ts">
/**
 * ExportButton — dropdown button for exporting data in various formats.
 * Composes shadcn DropdownMenu + Button.
 */
import type { HTMLAttributes } from 'vue'
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-vue-next'
import { Button } from '@/components/uic/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'
import { cn } from '@/utils/cn'

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'print'

const props = withDefaults(
  defineProps<{
    /** Available export formats */
    formats?: ExportFormat[]
    /** Button label */
    label?: string
    /** Button variant */
    variant?: 'default' | 'outline' | 'secondary' | 'ghost'
    /** Button size */
    size?: 'default' | 'sm' | 'lg'
    /** Loading state */
    loading?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    formats: () => ['csv', 'excel', 'pdf', 'print'],
    label: 'Export',
    variant: 'outline',
    size: 'sm',
    loading: false,
  },
)

const emit = defineEmits<{
  export: [format: ExportFormat]
}>()

const formatConfig = {
  csv: { label: 'CSV', icon: FileText },
  excel: { label: 'Excel', icon: FileSpreadsheet },
  pdf: { label: 'PDF', icon: FileText },
  print: { label: 'Print', icon: Printer },
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        data-slot="export-button"
        :variant="variant"
        :size="size"
        :disabled="loading"
        :class="cn('gap-1.5', props.class)"
      >
        <Download :size="14" />
        {{ label }}
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end">
      <DropdownMenuItem v-for="format in formats" :key="format" @click="emit('export', format)">
        <component :is="formatConfig[format].icon" :size="14" class="mr-2" />
        {{ formatConfig[format].label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
