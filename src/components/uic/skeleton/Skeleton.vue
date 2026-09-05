<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/utils/cn'

interface SkeletonProps {
  class?: HTMLAttributes['class']
}
const props = defineProps<SkeletonProps>()
</script>

<template>
  <div
    data-slot="skeleton"
    :class="cn(
      'animate-pulse rounded-md bg-muted/80',
      props.class,
    )"
  />
</template>

<style scoped>
[data-slot="skeleton"] {
  animation-duration: 1.8s;
  animation-timing-function: ease-in-out;
}
</style>
