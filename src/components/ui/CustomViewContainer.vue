<script setup lang="ts">
import type { Props } from '@/types/components/custom-view-container'
import { cn } from '@/utils/cn'

withDefaults(defineProps<Props>(), {
  loading: false,
})
</script>

<template>
  <div v-if="!loading" :class="cn('flex flex-col gap-6 p-8 w-full min-h-[900px] bg-card')">
    <slot />
  </div>
  <div v-else class="flex justify-center py-20">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
  </div>
</template>
