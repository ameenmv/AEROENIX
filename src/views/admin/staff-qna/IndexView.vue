<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import {
  CpuIcon,
  MessageQuestionIcon,
  CheckmarkBadge01Icon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

import { staffQnaService } from '@/services/staffQnaService'
import { Input } from '@/components/uic/input'

const { t } = useI18n()
const search = ref('')

const { data: qnaPairs, isLoading } = useQuery({
  queryKey: ['staff-qna'],
  queryFn: () => staffQnaService.list({ limit: 100 }),
})

const filteredQnaPairs = computed(() => {
  if (!qnaPairs.value) return []
  if (!search.value) return qnaPairs.value
  const query = search.value.toLowerCase()
  return qnaPairs.value.filter(pair => 
    pair.question.toLowerCase().includes(query) || 
    pair.answer.toLowerCase().includes(query)
  )
})

</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
          <HugeiconsIcon :icon="CpuIcon" :size="28" class="text-primary" />
          {{ t('staff_qna.title', 'AI Knowledge Base') }}
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ t('staff_qna.subtitle', 'Review how staff answers customer questions. The AI uses this data to train and respond automatically in the future.') }}
        </p>
      </div>
    </div>

    <!-- Search / Filter (Client side for now as backend endpoint doesn't support search yet) -->
    <div class="bg-card p-4 rounded-xl border border-border/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="relative w-full max-w-md">
        <HugeiconsIcon :icon="Search01Icon" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="search" :placeholder="t('staff_qna.search', 'Search questions or answers...')" class="pl-9 w-full bg-background" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-20 flex flex-col items-center gap-3">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <span class="text-sm text-muted-foreground">{{ t('common.loading', 'Loading knowledge base...') }}</span>
    </div>

    <!-- QnA Grid -->
    <div v-else-if="filteredQnaPairs.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <template v-for="(pair, index) in filteredQnaPairs" :key="index">
        <div class="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors shadow-sm">
          
          <!-- Question -->
          <div class="p-5 border-b border-border/50 bg-muted/20">
            <div class="flex gap-3">
              <div class="shrink-0 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mt-0.5">
                <HugeiconsIcon :icon="MessageQuestionIcon" :size="16" />
              </div>
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  {{ t('staff_qna.customer_question', 'Customer Question') }}
                </span>
                <p class="text-sm font-medium leading-relaxed">{{ pair.question }}</p>
              </div>
            </div>
          </div>

          <!-- Answer -->
          <div class="p-5">
            <div class="flex gap-3">
              <div class="shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mt-0.5">
                <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="16" />
              </div>
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  {{ t('staff_qna.staff_answer', 'Staff Answer') }}
                </span>
                <p class="text-sm text-muted-foreground leading-relaxed">{{ pair.answer }}</p>
              </div>
            </div>
          </div>

        </div>
      </template>
    </div>

    <!-- Empty Search State -->
    <div v-else-if="qnaPairs?.length && filteredQnaPairs.length === 0" class="py-20 flex flex-col items-center justify-center border border-dashed border-border rounded-xl">
      <HugeiconsIcon :icon="Search01Icon" :size="48" class="text-muted-foreground/30 mb-4" />
      <h3 class="text-lg font-medium">{{ t('staff_qna.no_results', 'No Results Found') }}</h3>
      <p class="text-sm text-muted-foreground max-w-sm text-center mt-2">
        {{ t('staff_qna.no_results_desc', 'We couldn\'t find any question or answer matching your search.') }}
      </p>
    </div>

    <!-- Empty State -->
    <div v-else class="py-20 flex flex-col items-center justify-center border border-dashed border-border rounded-xl">
      <HugeiconsIcon :icon="CpuIcon" :size="48" class="text-muted-foreground/30 mb-4" />
      <h3 class="text-lg font-medium">{{ t('staff_qna.empty_title', 'No Knowledge Data Yet') }}</h3>
      <p class="text-sm text-muted-foreground max-w-sm text-center mt-2">
        {{ t('staff_qna.empty_desc', 'Once staff members start replying to customers, the question-answer pairs will appear here for the AI to learn from.') }}
      </p>
    </div>
  </div>
</template>
