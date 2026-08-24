<script setup lang="ts">
import type { ColumnDef } from '@/composables/shared/useColumnVisibility'
import { FilterResetIcon, LayoutTwoColumnIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Check } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button as Btn } from '@/components/uic/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/uic/popover'

const props = defineProps<{
  /** All column definitions */
  columns: ColumnDef[]
  /** Currently visible column keys */
  visibleKeys: string[]
  /** Number of hidden columns */
  hiddenCount: number
}>()

const emit = defineEmits<{
  (e: 'toggle', key: string): void
  (e: 'reset'): void
}>()

const { t } = useI18n()

const visibleSet = computed(() => new Set(props.visibleKeys))

function isChecked(key: string): boolean {
  return visibleSet.value.has(key)
}

function isDisabled(key: string): boolean {
  return isChecked(key) && props.visibleKeys.length <= 1
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Btn
        variant="outline"
        size="default"
        class="relative flex items-center justify-center h-10 px-4 gap-2 rounded-md text-sm shrink-0"
      >
        <HugeiconsIcon :icon="LayoutTwoColumnIcon" :size="14" class="text-muted-foreground" />
        {{ t('common.columns', 'Columns') }}
        <span
          v-if="hiddenCount > 0"
          class="absolute -top-1 -end-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center"
        >
          {{ hiddenCount }}
        </span>
      </Btn>
    </PopoverTrigger>
    <PopoverContent align="end" :side-offset="8" class="w-56 p-0">
      <div class="px-3 pt-3 pb-2 border-b border-border">
        <p class="text-sm font-semibold text-foreground">
          {{ t('common.toggle_columns', 'Toggle columns') }}
        </p>
        <p class="text-xs text-muted-foreground mt-0.5">
          {{ t('common.toggle_columns_desc', 'Select which columns to display.') }}
        </p>
      </div>
      <div class="py-1.5 max-h-[280px] overflow-y-auto">
        <div
          v-for="col in columns"
          :key="col.key"
          class="flex items-center gap-2.5 px-3 py-1.5 cursor-pointer transition-colors rounded-sm mx-1"
          :class="[
            isDisabled(col.key) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/60',
          ]"
          @click="!isDisabled(col.key) && emit('toggle', col.key)"
        >
          <!-- Custom checkbox indicator -->
          <div
            class="size-4 shrink-0 rounded-[4px] border shadow-xs transition-all duration-150 flex items-center justify-center"
            :class="
              isChecked(col.key)
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-input bg-transparent'
            "
          >
            <Check v-if="isChecked(col.key)" class="size-3 stroke-[3]" />
          </div>
          <span class="text-sm font-normal text-foreground select-none flex-1">
            {{ col.label }}
          </span>
        </div>
      </div>
      <div v-if="hiddenCount > 0" class="px-3 py-2 border-t border-border">
        <button
          class="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          @click="emit('reset')"
        >
          <HugeiconsIcon :icon="FilterResetIcon" :size="12" />
          {{ t('common.reset_columns', 'Reset to default') }}
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>
