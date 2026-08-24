<script setup lang="ts">
/**
 * DropdownActions — convenience wrapper for table row action menus.
 * Composes shadcn DropdownMenu with a kebab trigger and preconfigured action items.
 * Used in 40+ SAAF list pages as the "DropdownList" pattern.
 */
import type { Component, HTMLAttributes } from 'vue'
import { MoreHorizontal } from 'lucide-vue-next'
import { Button } from '@/components/uic/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'
import { cn } from '@/utils/cn'

export interface ActionItem {
  /** Unique key */
  key: string
  /** Display label */
  label: string
  /** Lucide icon component */
  icon?: Component
  /** Makes the item destructive (red) */
  destructive?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Adds a separator before this item */
  separatorBefore?: boolean
}

const props = withDefaults(
  defineProps<{
    /** Array of action items to display */
    items: ActionItem[]
    /** Alignment of the dropdown */
    align?: 'start' | 'center' | 'end'
    class?: HTMLAttributes['class']
  }>(),
  {
    align: 'end',
  },
)

const emit = defineEmits<{
  action: [key: string]
}>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        data-slot="dropdown-actions"
        variant="ghost"
        size="icon-sm"
        :class="cn('h-8 w-8', props.class)"
        @click.stop
      >
        <MoreHorizontal :size="16" />
        <span class="sr-only">{{ $t('common.actions', 'Actions') }}</span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent :align="align" class="min-w-[160px]">
      <template v-for="item in items" :key="item.key">
        <DropdownMenuSeparator v-if="item.separatorBefore" />
        <DropdownMenuItem
          :disabled="item.disabled"
          :class="cn(item.destructive && 'text-destructive focus:text-destructive')"
          @click.stop="emit('action', item.key)"
        >
          <component :is="item.icon" v-if="item.icon" :size="14" class="mr-2" />
          {{ item.label }}
        </DropdownMenuItem>
      </template>

      <!-- Extra slot for custom items -->
      <slot />
    </DropdownMenuContent>
  </DropdownMenu>
</template>
