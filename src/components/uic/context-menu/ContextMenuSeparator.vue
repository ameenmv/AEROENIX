<script setup lang="ts">
import type { ContextMenuSeparatorProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { ContextMenuSeparator } from 'reka-ui'
import { cn } from '@/utils/cn'

const props = defineProps<ContextMenuSeparatorProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ContextMenuSeparator
    data-slot="context-menu-separator"
    :class="cn('bg-border -mx-1 my-1 h-px', props.class)"
  />
</template>
