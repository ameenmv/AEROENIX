<script setup lang="ts">
import { MoreHorizontalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ref } from 'vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'
import TableActionItem from './TableActionItem.vue'

defineProps<{
  actions?: {
    label: string
    icon?: string | object
    to?: string | object
    onClick?: () => void
    variant?: 'default' | 'delete'
  }[]
}>()
const isOpen = ref(false)
</script>

<template>
  <DropdownMenu v-model:open="isOpen">
    <DropdownMenuTrigger as-child>
      <div class="cursor-pointer inline-block">
        <slot name="trigger">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
          >
            <HugeiconsIcon
              :icon="MoreHorizontalIcon"
              :size="20"
              stroke-width="2"
              class="text-foreground"
            />
          </button>
        </slot>
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[160px] p-1.5 z-50 rounded-xl">
      <template v-if="actions && actions.length">
        <TableActionItem
          v-for="(action, index) in actions"
          :key="index"
          v-bind="action"
          @click="
            () => {
              action.onClick?.()
              isOpen = false
            }
          "
        />
      </template>
      <slot v-else />
    </DropdownMenuContent>
  </DropdownMenu>
</template>
