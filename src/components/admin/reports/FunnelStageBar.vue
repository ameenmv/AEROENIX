<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  count: number
  barPercentage: number
  colorHex?: string
  conversionRatioText?: string
}>()

const barColorClass = computed(() => {
  if (props.colorHex?.includes('3b82f6') || props.colorHex?.includes('blue')) {
    return 'bg-blue-500 shadow-blue-500/20'
  }
  if (props.colorHex?.includes('f59e0b') || props.colorHex?.includes('amber')) {
    return 'bg-amber-400 shadow-amber-400/20'
  }
  if (props.colorHex?.includes('14b8a6') || props.colorHex?.includes('teal')) {
    return 'bg-teal-400 shadow-teal-400/20'
  }
  return 'bg-emerald-500 shadow-emerald-500/20'
})
</script>

<template>
  <div class="space-y-2 p-3.5 rounded-2xl bg-card/40 border border-border/30 hover:border-border/60 transition-colors">
    <div class="flex items-center justify-between text-xs sm:text-sm">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full" :class="barColorClass"></span>
        <span class="font-semibold text-foreground">{{ label }}</span>
      </div>

      <div class="flex items-center gap-3">
        <span
          v-if="conversionRatioText"
          class="hidden sm:inline-block text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/30"
        >
          {{ conversionRatioText }}
        </span>
        <span class="text-foreground font-mono font-bold text-sm sm:text-base">
          {{ count }}
        </span>
      </div>
    </div>

    <!-- Progress Track -->
    <div class="w-full bg-muted/50 rounded-full h-3 overflow-hidden p-0.5 border border-border/30">
      <div
        class="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
        :class="barColorClass"
        :style="{ width: `${Math.min(100, Math.max(2, barPercentage))}%` }"
      ></div>
    </div>

    <div class="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
      <span>{{ barPercentage }}% of conversations</span>
      <span v-if="conversionRatioText" class="sm:hidden text-primary font-medium">
        {{ conversionRatioText }}
      </span>
    </div>
  </div>
</template>
