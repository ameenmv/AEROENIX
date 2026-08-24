<script setup lang="ts">
/**
 * KvList — displays key-value pairs in a stacked list.
 * The most repeated layout pattern across all SAAF detail pages.
 */
import type { HTMLAttributes } from 'vue'
import type { KvListVariants } from './variants'
import { cn } from '@/utils/cn'
import { kvListVariants } from './variants'

const props = withDefaults(
  defineProps<{
    spacing?: KvListVariants['spacing']
    dividers?: KvListVariants['dividers']
    class?: HTMLAttributes['class']
  }>(),
  {
    spacing: 'default',
    dividers: 'none',
  },
)
</script>

<template>
  <div
    data-slot="kv-list"
    :class="cn(kvListVariants({ spacing, dividers }), props.class)"
  >
    <slot />
  </div>
</template>
