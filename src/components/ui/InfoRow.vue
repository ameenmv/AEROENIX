<script setup lang="ts">
import type { Props } from '@/types/components/info-row'

withDefaults(defineProps<Props>(), {
  value: '',
  columns: 2,
})
</script>

<template>
  <div
    class="flex flex-col gap-1"
    :class="{
      'col-span-1': columns === 1,
      'col-span-2': columns === 2,
      'col-span-3': columns === 3,
      'col-span-4': columns === 4,
    }"
  >
    <span class="text-sm text-muted-foreground">{{ label }}</span>
    <span class="text-base text-foreground">
      <slot>{{ value }}</slot>
    </span>
  </div>
</template>
