<script setup lang="ts">
import type { KnowledgeStatus } from '@/types/entities/knowledge'

defineProps<{
  status: KnowledgeStatus
}>()

const statusConfig: Record<KnowledgeStatus, { label: string; class: string }> = {
  active: {
    label: 'Active',
    class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  inactive: {
    label: 'Inactive',
    class: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  },
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border transition-colors',
      statusConfig[status]?.class || statusConfig.inactive.class,
    ]"
  >
    <span
      :class="[
        'w-1.5 h-1.5 rounded-full mr-1.5',
        status === 'active' ? 'bg-emerald-500' : 'bg-slate-400',
      ]"
    />
    {{ statusConfig[status]?.label || status }}
  </span>
</template>
