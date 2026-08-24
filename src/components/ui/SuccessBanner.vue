<script setup lang="ts">
import type { Props } from '@/types/components/success-banner'

withDefaults(defineProps<Props>(), {
  message: '',
  icon: undefined,
})
</script>

<template>
  <div
    class="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/80 rounded-[10px]"
  >
    <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-emerald-500">
      <slot name="icon">
        <component :is="icon" v-if="icon" :size="20" />
      </slot>
    </div>
    <div class="flex flex-col">
      <span class="text-sm font-bold text-foreground leading-tight">{{ title }}</span>
      <span v-if="message" class="text-xs text-muted-foreground">{{ message }}</span>
    </div>
  </div>
</template>
