<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    status: 'pending' | 'confirmed' | 'rejected' | string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md',
  },
)

const { t } = useI18n()

const label = computed(() => {
  const s = props.status?.toLowerCase()
  if (s === 'confirmed') return t('bookings.confirmed', 'Confirmed')
  if (s === 'rejected') return t('bookings.rejected', 'Rejected')
  return t('bookings.pending', 'Pending')
})

const badgeClasses = computed(() => {
  const s = props.status?.toLowerCase()
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-[11px]',
    lg: 'px-3 py-1 text-xs',
  }[props.size]

  if (s === 'confirmed') {
    return `${sizeClasses} border-emerald-500/25 bg-emerald-500/10 text-emerald-400`
  }
  if (s === 'rejected') {
    return `${sizeClasses} border-rose-500/25 bg-rose-500/10 text-rose-400`
  }
  return `${sizeClasses} border-amber-500/25 bg-amber-500/10 text-amber-400`
})

const dotClasses = computed(() => {
  const s = props.status?.toLowerCase()
  if (s === 'confirmed') {
    return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]'
  }
  if (s === 'rejected') {
    return 'bg-rose-400'
  }
  return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)] animate-pulse'
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full font-semibold uppercase tracking-wider border transition-colors select-none"
    :class="badgeClasses"
  >
    <span
      class="h-1.5 w-1.5 rounded-full me-1.5 shrink-0"
      :class="dotClasses"
    />
    {{ label }}
  </span>
</template>
