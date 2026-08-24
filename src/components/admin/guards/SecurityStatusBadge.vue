<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  value: number
}>()
const { t } = useI18n()
const statusConfig = computed(() => {
  switch (props.value) {
    case 2:
      return {
        label: t('guards.neoprity_status.approved'),
        class: 'bg-green-500/10 text-green-500',
      }
    case 3:
      return {
        label: t('guards.neoprity_status.rejected'),
        class: 'bg-red-500/10 text-red-500',
      }
    default:
      return {
        label: t('guards.neoprity_status.pending'),
        class: 'bg-yellow-500/10 text-yellow-500',
      }
  }
})
</script>

<template>
  <span class="px-2 py-1 rounded-full text-xs font-bold" :class="[statusConfig.class]">
    {{ statusConfig.label }}
  </span>
</template>
