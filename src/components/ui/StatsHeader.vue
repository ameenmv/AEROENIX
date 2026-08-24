<script setup lang="ts">
import type { Props } from '@/types/components/stats-header'

withDefaults(defineProps<Props>(), {
  stats: () => [],
})
</script>

<template>
  <div class="flex justify-between items-center mb-2">
    <h2 class="text-[20px] font-bold text-foreground uppercase tracking-tight">
      {{ title }}
    </h2>
    <div v-if="stats.length" class="flex gap-4">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="flex flex-col items-end"
        :class="{ 'border-l border-border pl-4': stat.hasBorder }"
      >
        <span class="text-xs text-muted-foreground uppercase">{{ stat.label }}</span>
        <span class="text-xl font-bold text-foreground">
          {{ stat.value }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
. {
}
</style>
