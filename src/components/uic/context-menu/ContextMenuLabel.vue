<script setup lang="ts">
import type { ContextMenuLabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { ContextMenuLabel } from 'reka-ui'
import { cn } from '@/utils/cn'

const props = defineProps<ContextMenuLabelProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ContextMenuLabel
    data-slot="context-menu-label"
    :class="cn('text-muted-foreground px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider', props.class)"
  />
</template>
