<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { DropdownMenuItem } from '@/components/uic/dropdown-menu'
// import { ObjectDirective } from 'vue'
// Avoid router-link inside DropdownMenuItem causing block issues: Better to use the item as router-link
// DropdownMenuItem can use `as` prop or `as-child` but Radix Vue's DropdownMenuItem supports `asChild`.
defineProps<{
  label: string
  icon?: string | object
  variant?: 'default' | 'delete'
  to?: string | object
}>()
const emit = defineEmits(['click'])
function handleClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<template>
  <DropdownMenuItem
    :as="to ? 'router-link' : 'div'"
    v-bind="to ? { to } : {}"
    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all text-left cursor-pointer group"
    :class="[
      variant === 'delete'
        ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive focus:bg-destructive/20 focus:text-destructive shadow-sm'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground',
    ]"
    @click="handleClick"
  >
    <div
      class="w-5 h-5 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
    >
      <HugeiconsIcon
        v-if="icon && typeof icon !== 'string'"
        :icon="icon as any"
        :size="16"
        stroke-width="2"
      />
      <i v-else-if="typeof icon === 'string'" :class="icon" class="text-[14px]" />
      <slot v-else name="icon" />
    </div>
    <span class="capitalize leading-none pt-0.5">{{ label }}</span>
  </DropdownMenuItem>
</template>
