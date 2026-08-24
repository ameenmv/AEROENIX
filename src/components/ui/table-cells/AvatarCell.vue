<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed } from 'vue'

const props = defineProps<{
  value?: any
  row?: any
  titleKey?: string
  subtitleKey?: string
  avatarIcon?: any
  iconClass?: string
}>()
const title = computed(() => {
  if (!props.value)
    return 'N/A'
  if (props.titleKey)
    return props.value[props.titleKey] || props.value
  return props.value.name || props.value.company_name || props.value.title || props.value
})
const subtitle = computed(() => {
  if (!props.value || !props.subtitleKey)
    return null
  return props.value[props.subtitleKey]
})
</script>

<template>
  <div class="flex items-center gap-3 py-1">
    <div
      v-if="avatarIcon"
      class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
      :class="iconClass"
    >
      <HugeiconsIcon :icon="avatarIcon" color="white" :size="16" />
    </div>
    <div class="flex flex-col">
      <span class="text-sm font-bold text-white tracking-tight leading-tight">
        {{ title }}
      </span>
      <span v-if="subtitle" class="text-[11px] text-white/40 uppercase mt-0.5">
        {{ subtitle }}
      </span>
    </div>
  </div>
</template>
