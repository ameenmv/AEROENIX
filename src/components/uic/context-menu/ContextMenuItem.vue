<script setup lang="ts">
import type { ContextMenuItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { ContextMenuItem, useForwardProps } from 'reka-ui'
import { cn } from '@/utils/cn'

const props = defineProps<ContextMenuItemProps & { class?: HTMLAttributes['class'] }>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <ContextMenuItem
    data-slot="context-menu-item"
    v-bind="forwardedProps"
    :class="
      cn(
        'focus:bg-accent focus:text-foreground relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        props.class,
      )
    "
  >
    <slot />
  </ContextMenuItem>
</template>
