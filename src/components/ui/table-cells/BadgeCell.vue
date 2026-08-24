<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/uic/badge'

const props = defineProps<{
  value: string
  variants?: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'>
}>()
const resolvedVariant = computed(() => {
  const lowercaseVal = props.value.toLowerCase()
  // 1. Check explicit mappings passed via props
  const explicitVariant = props.variants?.[lowercaseVal]
  if (explicitVariant)
    return explicitVariant
  // 2. Fallback heuristics
  if (['active', 'completed', 'success'].includes(lowercaseVal))
    return 'success'
  if (['expired', 'terminated', 'inactive', 'failed', 'danger'].includes(lowercaseVal))
    return 'danger'
  if (['pending', 'warning'].includes(lowercaseVal))
    return 'warning'
  if (['info'].includes(lowercaseVal))
    return 'info'
  return 'default'
})
</script>

<template>
  <Badge :variant="resolvedVariant as any">
    {{ value }}
  </Badge>
</template>
