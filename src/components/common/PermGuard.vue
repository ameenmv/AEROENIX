<script setup lang="ts">
import { useCan } from '@/composables/shared/useCan'

const props = defineProps<{
  permKey: string
}>()
const { can } = useCan()
</script>

<template>
  <template v-if="can(props.permKey)">
    <slot />
  </template>
  <template v-else-if="$slots.fallback">
    <slot name="fallback" />
  </template>
</template>
