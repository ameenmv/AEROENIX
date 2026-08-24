<script setup lang="ts">
import type { Props } from '@/types/components/info-card'

withDefaults(defineProps<Props>(), {
  icon: null,
  scrollable: false,
  maxHeight: '400px',
})
</script>

<template>
  <div
    class="flex flex-col gap-6 p-6 bg-card rounded-2xl"
    :class="{
      'flex-1 max-h-[400px]': scrollable,
      'max-h-[400px]': scrollable && maxHeight,
    }"
  >
    <h3
      class="text-xs font-bold text-foreground uppercase tracking-[0.7px] flex items-center gap-2"
      :class="{ 'sticky top-0 bg-card pb-2': scrollable }"
    >
      <component :is="icon" v-if="icon" :size="16" class="text-muted-foreground" />
      {{ title }}
    </h3>
    <slot />
  </div>
</template>
