<script setup lang="ts">
import { Cancel01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { cva } from 'class-variance-authority'
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  value: string | boolean
}>()
const statusVariants = cva('flex items-center gap-1', {
  variants: {
    variant: {
      success: 'text-[#32E444]',
      danger: 'text-[#FF697D]',
    },
  },
  defaultVariants: {
    variant: 'danger',
  },
})
const isSuccess = computed(() => {
  if (typeof props.value === 'string') {
    return props.value.toLowerCase() === 'success' || props.value.toLowerCase() === 'completed'
  }
  return !!props.value
})
const resolvedVariant = computed(() => (isSuccess.value ? 'success' : 'danger'))
const icon = computed(() => (isSuccess.value ? CheckmarkCircle01Icon : Cancel01Icon))
const label = computed(() => {
  if (typeof props.value === 'string')
    return props.value
  return isSuccess.value ? 'Success' : 'Failed'
})
</script>

<template>
  <div :class="cn(statusVariants({ variant: resolvedVariant }))">
    <div class="w-[14px] h-[14px] flex items-center justify-center">
      <HugeiconsIcon :icon="icon" :size="14" stroke-width="2.5" />
    </div>
    <span class="text-[14px] leading-[20px] capitalize">{{ label }}</span>
  </div>
</template>
