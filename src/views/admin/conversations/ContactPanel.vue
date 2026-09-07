<script setup lang="ts">
import type { InboxConversationDetail } from '@/types/entities/conversation'
import {
  SmartPhone01Icon,
  SparklesIcon,
  UserGroupIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'

defineProps<{
  conversation: InboxConversationDetail | null
  isAiPaused: boolean
  isTogglingHandoff: boolean
  isLoading: boolean
}>()

const emit = defineEmits<{
  'request-handoff-toggle': []
}>()
</script>

<template>
  <div class="flex flex-col h-full overflow-y-auto">
    <template v-if="conversation">

      <!-- ── Contact Info ───────────────────────────────────────────── -->
      <div class="px-6 pt-6 pb-5">
        <h3 class="text-base font-bold text-foreground mb-5">Contact Info</h3>

        <div class="space-y-5">
          <!-- Contact Name -->
          <div class="flex items-start gap-3.5">
            <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <HugeiconsIcon :icon="UserIcon" :size="16" class="text-primary" />
            </div>
            <div class="pt-0.5">
              <p class="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium mb-0.5">Contact Name</p>
              <p class="text-sm font-semibold text-foreground leading-snug">{{ conversation.contact_name }}</p>
            </div>
          </div>

          <!-- Phone -->
          <div class="flex items-start gap-3.5">
            <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <HugeiconsIcon :icon="SmartPhone01Icon" :size="16" class="text-primary" />
            </div>
            <div class="pt-0.5">
              <p class="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium mb-0.5">Phone</p>
              <p class="text-sm text-foreground leading-snug">{{ conversation.phone }}</p>
            </div>
          </div>

          <!-- ID -->
          <!-- <div class="flex items-start gap-3.5">
            <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span class="text-primary font-bold text-sm">#</span>
            </div>
            <div class="pt-0.5">
              <p class="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium mb-0.5">ID</p>
              <p class="text-sm text-foreground leading-snug">{{ conversation.id }}</p>
            </div>
          </div> -->

          <!-- Tags -->
          <div class="flex items-start gap-3.5">
            <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
                <path d="m15.5 3h5v5l-11 11-5-5z" /><circle cx="18.5" cy="5.5" r=".5" fill="currentColor" />
              </svg>
            </div>
            <div class="pt-0.5">
              <p class="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium mb-1.5">Tags</p>
              <div class="flex flex-wrap gap-2">
                <Badge variant="outline" class="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-2.5 py-0.5 font-semibold rounded-full">
                  {{ conversation.lead_score || '🔥 Hot Lead' }}
                </Badge>
                <Badge variant="outline" class="bg-primary/10 text-primary border-primary/20 text-[10px] px-2.5 py-0.5 font-semibold rounded-full">
                  {{ conversation.channel_badge_name }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-border/15 mx-6" />

      <!-- ── AI Mode Card ───────────────────────────────────────────── -->
      <div class="px-6 py-5">
        <div
          class="p-4 rounded-2xl border-2 transition-all duration-300"
          :class="isAiPaused
            ? 'bg-blue-500/5 border-blue-500/20'
            : 'bg-emerald-500/5 border-emerald-500/20'"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="isAiPaused ? 'bg-blue-500/15' : 'bg-emerald-500/15'"
            >
              <HugeiconsIcon
                :icon="isAiPaused ? UserGroupIcon : SparklesIcon"
                :size="20"
                :class="isAiPaused ? 'text-blue-400' : 'text-emerald-400'"
              />
            </div>
            <div>
              <p class="text-sm font-bold" :class="isAiPaused ? 'text-blue-400' : 'text-emerald-400'">
                {{ isAiPaused ? 'Staff Handling' : 'AI Auto-Reply' }}
              </p>
              <p class="text-[10px] text-muted-foreground/60">
                {{ isAiPaused ? 'AI bot is paused' : 'Bot is handling replies' }}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="w-full gap-2 text-xs font-semibold h-9 rounded-xl"
            :class="isAiPaused
              ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
              : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10'"
            :disabled="isTogglingHandoff"
            @click="emit('request-handoff-toggle')"
          >
            <HugeiconsIcon :icon="isAiPaused ? SparklesIcon : UserGroupIcon" :size="14" />
            {{ isAiPaused ? 'Resume AI Bot' : 'Take Over (Staff)' }}
          </Button>
        </div>
      </div>
    </template>

    <!-- Skeleton Loading -->
    <div v-else-if="isLoading" class="px-6 pt-6 pb-5">
      <div class="h-4 w-24 bg-white/[0.08] rounded-full mb-6 animate-pulse" />
      <!-- Field skeletons -->
      <div class="space-y-5">
        <div v-for="i in 3" :key="i" class="flex items-start gap-3.5">
          <div class="w-9 h-9 rounded-xl bg-white/[0.06] shrink-0 animate-pulse" />
          <div class="flex-1 pt-1 space-y-2">
            <div class="h-2 w-16 bg-white/[0.04] rounded-full animate-pulse" />
            <div class="h-3 bg-white/[0.08] rounded-full animate-pulse" :style="{ width: `${80 + i * 20}px` }" />
          </div>
        </div>
      </div>

      <!-- Tags skeleton -->
      <div class="flex items-start gap-3.5 mt-5">
        <div class="w-9 h-9 rounded-xl bg-white/[0.06] shrink-0 animate-pulse" />
        <div class="pt-1 space-y-2">
          <div class="h-2 w-10 bg-white/[0.04] rounded-full animate-pulse" />
          <div class="flex gap-2 mt-1">
            <div class="h-5 w-16 bg-white/[0.06] rounded-full animate-pulse" />
            <div class="h-5 w-20 bg-white/[0.06] rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div class="border-t border-white/[0.04] my-5" />

      <!-- AI card skeleton -->
      <div class="p-4 rounded-2xl border-2 border-white/[0.06]">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-white/[0.06] animate-pulse" />
          <div class="space-y-2 flex-1">
            <div class="h-3 w-24 bg-white/[0.08] rounded-full animate-pulse" />
            <div class="h-2 w-20 bg-white/[0.04] rounded-full animate-pulse" />
          </div>
        </div>
        <div class="h-9 w-full bg-white/[0.05] rounded-xl animate-pulse" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="flex-1 flex items-center justify-center text-muted-foreground/50 text-xs py-8">
      Select a conversation to view details.
    </div>
  </div>
</template>
