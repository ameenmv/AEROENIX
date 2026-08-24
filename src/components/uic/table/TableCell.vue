<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const slots = useSlots()

const isEmpty = computed(() => {
  const slotContent = slots.default?.()
  if (!slotContent || slotContent.length === 0)
    return true
  return slotContent.every((vnode) => {
    const child = vnode.children
    return child === null || child === undefined || child === '' || (Array.isArray(child) && child.length === 0)
  })
})
</script>

<template>
  <td
    data-slot="table-cell"
    :class="
      cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-center! m-auto',
        props.class,
      )
    "
  >
    <slot v-if="!isEmpty" />
    <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
    <span v-else class="text-muted-foreground select-none">&mdash;</span>
  </td>
</template>
