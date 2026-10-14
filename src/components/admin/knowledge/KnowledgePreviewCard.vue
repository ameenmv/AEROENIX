<script setup lang="ts">
import { Bot, Check, Copy, MessageSquare, Sparkles, User } from 'lucide-vue-next'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    title?: string
    content?: string
    category?: string
    priority?: number
    status?: 'active' | 'inactive'
    hotelName?: string | null
    syncedToAi?: boolean
  }>(),
  {
    title: '',
    content: '',
    category: 'general',
    priority: 5,
    status: 'active',
    hotelName: null,
    syncedToAi: false,
  },
)

const { t } = useI18n()
const copied = ref(false)

async function copyAnswer() {
  if (!props.content) return
  await navigator.clipboard.writeText(props.content)
  copied.value = true
  setTimeout(() => (copied.value = false), 1800)
}
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 p-5 shadow-sm backdrop-blur-md">
    <!-- Ambient glow behind chatbot -->
    <div class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />

    <!-- Card Header -->
    <div class="relative mb-4 flex items-center justify-between border-b border-border/40 pb-3">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
          <Bot class="h-4 w-4" />
        </div>
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-foreground">
            {{ t('knowledge.preview_title', 'AI Guest Chat Preview') }}
          </h4>
          <p class="text-[11px] text-muted-foreground">
            {{ t('knowledge.preview_subtitle', 'Live simulation of how the chatbot uses this entry') }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <span
          class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
          :class="status === 'active'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            : 'border-border/50 bg-muted/40 text-muted-foreground'"
        >
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground/60'"
          />
          {{ status === 'active' ? t('knowledge.active', 'Active') : t('knowledge.inactive', 'Inactive') }}
        </span>
      </div>
    </div>

    <!-- Chat Simulation Container -->
    <div class="relative space-y-4 rounded-xl border border-border/40 bg-background/50 p-4">
      <!-- 1. Guest Message (Question) -->
      <div class="flex items-start gap-2.5 justify-end">
        <div class="max-w-[85%] rounded-2xl rounded-tr-xs bg-primary/15 border border-primary/25 px-4 py-2.5 text-xs text-foreground shadow-xs">
          <p class="font-medium leading-relaxed">
            {{ title.trim() || t('knowledge.preview_sample_q', 'How can this help the guest?') }}
          </p>
          <span class="mt-1 block text-right text-[10px] text-primary/70">
            {{ t('knowledge.preview_guest', 'Guest') }} • {{ t('knowledge.just_now', 'Just now') }}
          </span>
        </div>
        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
          <User class="h-3.5 w-3.5" />
        </div>
      </div>

      <!-- 2. AI Bot Response (Answer) -->
      <div class="flex items-start gap-2.5">
        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary shadow-xs">
          <Sparkles class="h-3.5 w-3.5" />
        </div>
        <div class="group/msg relative max-w-[88%] rounded-2xl rounded-tl-xs border border-border/50 bg-card/90 px-4 py-3 text-xs text-foreground shadow-xs">
          <!-- Copy quick button -->
          <button
            v-if="content.trim()"
            type="button"
            class="absolute right-2 top-2 rounded-md p-1 text-muted-foreground/50 opacity-0 transition hover:bg-muted hover:text-foreground group-hover/msg:opacity-100"
            :title="t('common.copy', 'Copy')"
            @click="copyAnswer"
          >
            <Check v-if="copied" class="h-3 w-3 text-emerald-400" />
            <Copy v-else class="h-3 w-3" />
          </button>

          <p class="whitespace-pre-line leading-relaxed text-foreground/90">
            {{ content.trim() || t('knowledge.preview_sample_a', 'Type the content/answer on the left to preview how Azul AI delivers it to guests.') }}
          </p>

          <!-- AI Confidence & Meta strip -->
          <div class="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border/30 pt-2 text-[10.5px] text-muted-foreground">
            <span class="inline-flex items-center gap-1 font-semibold text-primary/90">
              <Bot class="h-3 w-3" />
              Azul AI Concierge
            </span>
            <span>•</span>
            <span class="capitalize text-muted-foreground/80">{{ category }}</span>
            <span v-if="hotelName">•</span>
            <span v-if="hotelName" class="text-muted-foreground/80 truncate max-w-[120px]">{{ hotelName }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer metadata tips -->
    <div class="mt-3 flex items-center justify-between text-[11px] text-muted-foreground/70">
      <span class="flex items-center gap-1">
        <MessageSquare class="h-3 w-3 text-primary/60" />
        {{ t('knowledge.preview_tip', 'Priority score influences AI retrieval weighting') }}
      </span>
      <span class="font-mono text-xs font-semibold text-foreground/80">
        {{ priority }}/10
      </span>
    </div>
  </div>
</template>
