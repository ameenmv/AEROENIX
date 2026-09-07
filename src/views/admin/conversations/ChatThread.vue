<script setup lang="ts">
import type { InboxConversationDetail, InboxMessageItem } from '@/types/entities/conversation'
import {
  BubbleChatIcon,
  FacebookIcon,
  InstagramIcon,
  MailSend01Icon,
  SparklesIcon,
  UserGroupIcon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import { ref } from 'vue'

const props = defineProps<{
  conversation: InboxConversationDetail | null
  messages: InboxMessageItem[]
  isAiPaused: boolean
  isLoadingMessages: boolean
  isSendingMessage: boolean
  isTogglingHandoff: boolean
  hasActiveConversation: boolean
}>()

const emit = defineEmits<{
  'send-message': [text: string]
  'request-handoff-toggle': []
}>()

const newMessageText = ref('')

function handleSend() {
  if (!newMessageText.value.trim()) return
  emit('send-message', newMessageText.value.trim())
  newMessageText.value = ''
}

function getChannelColorClass(badgeName: string) {
  const name = (badgeName || '').toLowerCase()
  if (name.includes('whatsapp')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  if (name.includes('instagram')) return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
  if (name.includes('messenger') || name.includes('facebook')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  return 'bg-primary/10 text-primary border-primary/20'
}

function getChannelIcon(badgeName: string) {
  const name = (badgeName || '').toLowerCase()
  if (name.includes('whatsapp')) return WhatsappIcon
  if (name.includes('instagram')) return InstagramIcon
  if (name.includes('messenger') || name.includes('facebook')) return FacebookIcon
  return BubbleChatIcon
}
</script>

<template>
  <div class="flex flex-col h-full">
    <template v-if="hasActiveConversation && conversation">

      <!-- ── Chat Header ──────────────────────────────────────────── -->
      <div class="px-5 py-4 border-b border-border/20 flex items-center justify-between gap-4 shrink-0">
        <div class="flex items-center gap-3.5 min-w-0">
          <!-- Avatar -->
          <div class="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
            {{ conversation.avatar_initials || 'G' }}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2.5 flex-wrap">
              <h3 class="text-[15px] font-bold text-foreground truncate">
                {{ conversation.contact_name || 'Guest' }}
              </h3>
              <Badge
                variant="outline"
                class="text-[10px] uppercase font-semibold border px-2.5 py-0.5 flex items-center gap-1"
                :class="getChannelColorClass(conversation.channel_badge_name || '')"
              >
                <HugeiconsIcon :icon="getChannelIcon(conversation.channel_badge_name || '')" :size="11" />
                {{ conversation.channel_badge_name || 'Channel' }}
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground/70 truncate mt-0.5">
              {{ conversation.phone }}
            </p>
          </div>
        </div>

        <!-- AI Handoff Button -->
        <button
          class="shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-300"
          :class="isAiPaused
            ? 'bg-blue-500/8 border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/12'
            : 'bg-emerald-500/8 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/12'"
          :disabled="isTogglingHandoff"
          @click="emit('request-handoff-toggle')"
        >
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center"
            :class="isAiPaused ? 'bg-blue-500/15' : 'bg-emerald-500/15'"
          >
            <HugeiconsIcon
              :icon="isAiPaused ? UserGroupIcon : SparklesIcon"
              :size="17"
              :class="isAiPaused ? 'text-blue-400' : 'text-emerald-400'"
            />
          </div>
          <div class="text-left">
            <p class="text-[13px] font-bold leading-tight" :class="isAiPaused ? 'text-blue-400' : 'text-emerald-400'">
              {{ isAiPaused ? 'Staff Mode' : 'AI Active' }}
            </p>
            <p class="text-[10px] text-muted-foreground/70 font-medium">
              {{ isAiPaused ? 'Click to resume AI' : 'Click to take over' }}
            </p>
          </div>
          <!-- Pulsing dot -->
          <div class="relative ml-1">
            <span class="block w-2.5 h-2.5 rounded-full" :class="isAiPaused ? 'bg-blue-400' : 'bg-emerald-400'" />
            <span class="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-60" :class="isAiPaused ? 'bg-blue-400' : 'bg-emerald-400'" />
          </div>
        </button>
      </div>

      <!-- AI Status Strip -->
      <div
        class="px-4 py-2 flex items-center justify-center gap-2 text-[11px] font-semibold border-b transition-colors duration-300"
        :class="isAiPaused
          ? 'bg-blue-500/6 text-blue-400 border-blue-500/10'
          : 'bg-emerald-500/6 text-emerald-400 border-emerald-500/10'"
      >
        <HugeiconsIcon :icon="isAiPaused ? UserGroupIcon : SparklesIcon" :size="13" />
        <span v-if="isAiPaused">🛑 AI is paused — You are replying manually as staff</span>
        <span v-else>✨ AI is auto-replying to this conversation</span>
      </div>

      <!-- ── Chat Messages ────────────────────────────────────────── -->
      <div class="flex-1 px-5 py-4 overflow-y-auto space-y-4 bg-muted/5">
        <!-- Skeleton Loading -->
        <div v-if="isLoadingMessages" class="space-y-5 py-4">
          <!-- Customer bubble (left) -->
          <div class="flex flex-col items-start">
            <div class="h-2 w-20 bg-white/[0.04] rounded-full mb-2 animate-pulse" />
            <div class="bg-white/[0.06] rounded-2xl rounded-tl-sm h-10 animate-pulse" style="width: 55%" />
          </div>
          <!-- AI bubble (right) -->
          <div class="flex flex-col items-end">
            <div class="h-2 w-24 bg-white/[0.04] rounded-full mb-2 animate-pulse" />
            <div class="bg-purple-500/[0.12] rounded-2xl rounded-tr-sm h-16 animate-pulse" style="width: 70%" />
          </div>
          <!-- Customer bubble (left) -->
          <div class="flex flex-col items-start">
            <div class="h-2 w-16 bg-white/[0.04] rounded-full mb-2 animate-pulse" />
            <div class="bg-white/[0.06] rounded-2xl rounded-tl-sm h-8 animate-pulse" style="width: 40%" />
          </div>
          <!-- AI bubble (right) -->
          <div class="flex flex-col items-end">
            <div class="h-2 w-20 bg-white/[0.04] rounded-full mb-2 animate-pulse" />
            <div class="bg-purple-500/[0.12] rounded-2xl rounded-tr-sm h-20 animate-pulse" style="width: 65%" />
          </div>
          <!-- Customer bubble (left) -->
          <div class="flex flex-col items-start">
            <div class="h-2 w-18 bg-white/[0.04] rounded-full mb-2 animate-pulse" />
            <div class="bg-white/[0.06] rounded-2xl rounded-tl-sm h-10 animate-pulse" style="width: 50%" />
          </div>
        </div>

        <!-- Messages -->
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex flex-col"
          :class="msg.sender_type === 'customer' ? 'items-start' : 'items-end'"
        >
          <!-- Sender -->
          <span class="text-[10px] text-muted-foreground/60 mb-1.5 px-1 flex items-center gap-1">
            <span v-if="msg.sender_type === 'ai'" class="text-purple-400 font-semibold flex items-center gap-0.5">
              <HugeiconsIcon :icon="SparklesIcon" :size="10" /> AI Assistant
            </span>
            <span v-else-if="msg.sender_type === 'staff'" class="text-blue-400 font-semibold flex items-center gap-0.5">
              <HugeiconsIcon :icon="UserGroupIcon" :size="10" /> Staff Agent
            </span>
            <span v-else class="font-medium">Customer</span>
            <span>• {{ msg.time }}</span>
          </span>

          <!-- Bubble -->
          <div
            class="max-w-[75%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm"
            :class="[
              msg.sender_type === 'customer'
                ? 'bg-card text-foreground rounded-tl-sm border border-border/30'
                : msg.sender_type === 'ai'
                  ? 'bg-purple-600/85 text-white rounded-tr-sm shadow-purple-600/15'
                  : 'bg-primary text-primary-foreground rounded-tr-sm shadow-primary/15',
            ]"
          >
            {{ msg.text }}
          </div>
        </div>
      </div>

      <!-- ── Composer ─────────────────────────────────────────────── -->
      <div class="px-4 py-3.5 border-t border-border/20 bg-background flex items-center gap-3 shrink-0">
        <Input
          v-model="newMessageText"
          type="text"
          placeholder="Type here..."
          class="flex-1 h-11 rounded-full bg-muted/15 border-border/20 text-sm px-5"
          @keyup.enter="handleSend"
        />
        <Button
          class="gap-2 rounded-full h-11 px-6 bg-primary text-primary-foreground shadow-sm shadow-primary/20 text-sm font-semibold"
          :disabled="!newMessageText.trim() || isSendingMessage"
          @click="handleSend"
        >
          <HugeiconsIcon :icon="MailSend01Icon" :size="16" />
          <span>Reply</span>
        </Button>
      </div>
    </template>

    <!-- Full Chat Skeleton (shows while loading a conversation) -->
    <template v-else-if="hasActiveConversation && isLoadingMessages">
      <!-- Header skeleton -->
      <div class="px-5 py-4 border-b border-border/20 flex items-center justify-between gap-4 shrink-0">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-full bg-white/[0.06] animate-pulse shrink-0" />
          <div class="space-y-2">
            <div class="h-4 w-36 bg-white/[0.08] rounded-full animate-pulse" />
            <div class="h-2.5 w-24 bg-white/[0.04] rounded-full animate-pulse" />
          </div>
        </div>
        <div class="w-40 h-14 rounded-2xl bg-white/[0.04] animate-pulse" />
      </div>

      <!-- Status strip skeleton -->
      <div class="px-4 py-2 border-b border-white/[0.04] flex items-center justify-center">
        <div class="h-2.5 w-56 bg-white/[0.04] rounded-full animate-pulse" />
      </div>

      <!-- Message bubbles skeleton -->
      <div class="flex-1 px-5 py-4 overflow-y-auto space-y-5 bg-muted/5">
        <!-- Customer bubble -->
        <div class="flex flex-col items-start">
          <div class="h-2 w-20 bg-white/[0.04] rounded-full mb-2 animate-pulse" />
          <div class="bg-white/[0.06] rounded-2xl rounded-tl-sm h-10 animate-pulse" style="width: 55%" />
        </div>
        <!-- AI bubble -->
        <div class="flex flex-col items-end">
          <div class="h-2 w-24 bg-white/[0.04] rounded-full mb-2 animate-pulse" />
          <div class="bg-purple-500/[0.12] rounded-2xl rounded-tr-sm h-16 animate-pulse" style="width: 70%" />
        </div>
        <!-- Customer bubble -->
        <div class="flex flex-col items-start">
          <div class="h-2 w-16 bg-white/[0.04] rounded-full mb-2 animate-pulse" />
          <div class="bg-white/[0.06] rounded-2xl rounded-tl-sm h-8 animate-pulse" style="width: 40%" />
        </div>
        <!-- AI bubble -->
        <div class="flex flex-col items-end">
          <div class="h-2 w-20 bg-white/[0.04] rounded-full mb-2 animate-pulse" />
          <div class="bg-purple-500/[0.12] rounded-2xl rounded-tr-sm h-20 animate-pulse" style="width: 65%" />
        </div>
        <!-- Customer bubble -->
        <div class="flex flex-col items-start">
          <div class="h-2 w-18 bg-white/[0.04] rounded-full mb-2 animate-pulse" />
          <div class="bg-white/[0.06] rounded-2xl rounded-tl-sm h-10 animate-pulse" style="width: 50%" />
        </div>
      </div>

      <!-- Composer skeleton -->
      <div class="px-4 py-3.5 border-t border-border/20 bg-background flex items-center gap-3 shrink-0">
        <div class="flex-1 h-11 rounded-full bg-white/[0.04] animate-pulse" />
        <div class="h-11 w-24 rounded-full bg-white/[0.06] animate-pulse" />
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center text-muted-foreground text-sm">
      <div class="text-center space-y-4">
        <div class="w-20 h-20 rounded-3xl bg-muted/10 flex items-center justify-center mx-auto">
          <HugeiconsIcon :icon="SparklesIcon" :size="36" class="text-muted-foreground/25" />
        </div>
        <div>
          <p class="font-semibold text-foreground/60">No conversation selected</p>
          <p class="text-xs text-muted-foreground/50 mt-1">Select a conversation from the inbox to start chatting.</p>
        </div>
      </div>
    </div>
  </div>
</template>
