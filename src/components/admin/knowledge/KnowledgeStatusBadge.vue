<script setup lang="ts">
import type { KnowledgeStatus } from '@/types/entities/knowledge'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  status: KnowledgeStatus
}>()

const { t } = useI18n()

const label = computed(() => {
  return props.status === 'active'
    ? t('knowledge.active', 'Active')
    : t('knowledge.inactive', 'Inactive')
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider border transition-colors select-none"
    :class="status === 'active'
      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
      : 'border-border/50 bg-muted/30 text-muted-foreground'"
  >
    <span
      class="h-1.5 w-1.5 rounded-full me-1.5 shrink-0"
      :class="status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]' : 'bg-muted-foreground/60'"
    />
    {{ label }}
  </span>
</template>
