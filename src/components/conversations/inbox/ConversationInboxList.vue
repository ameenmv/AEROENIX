<script setup lang="ts">
import {
  ArchiveIcon,
  BubbleChatIcon,
  FacebookIcon,
  InstagramIcon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import type { InboxConversationItem } from '@/types/entities/conversation'

defineProps<{
  conversations: InboxConversationItem[]
  selectedConversationId: number | null
  hasMore?: boolean
  isFetchingMore?: boolean
}>()

const emit = defineEmits<{
  selectConversation: [id: number]
  loadMore: []
}>()

const { t } = useI18n()

function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t('common.now', 'Now')
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getAvatarColor(name: string | null | undefined): string {
  const gradients = [
    'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/30',
    'from-indigo-500/20 to-blue-500/10 text-indigo-400 border-indigo-500/30',
    'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
    'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    'from-purple-500/20 to-violet-500/10 text-purple-400 border-purple-500/30',
    'from-pink-500/20 to-rose-500/10 text-pink-400 border-pink-500/30',
    'from-sky-500/20 to-cyan-500/10 text-sky-400 border-sky-500/30',
  ]
  if (!name) return gradients[0]!
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[hash % gradients.length]!
}

function getProviderIcon(channelBadgeName: string | null | undefined) {
  const name = (channelBadgeName || '').toLowerCase()
  if (name.includes('whatsapp')) return WhatsappIcon
  if (name.includes('instagram')) return InstagramIcon
  if (name.includes('facebook') || name.includes('messenger')) return FacebookIcon
  return BubbleChatIcon
}

function getProviderColorClass(channelBadgeName: string | null | undefined) {
  const name = (channelBadgeName || '').toLowerCase()
  if (name.includes('whatsapp')) return 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/20'
  if (name.includes('instagram')) return 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-500 text-white'
  if (name.includes('facebook') || name.includes('messenger')) return 'bg-blue-600 text-white'
  return 'bg-primary text-primary-foreground'
}
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-1.5 px-1 scrollbar-thin">
    <div
      v-for="conv in conversations"
      :key="conv.id"
      class="group relative flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 cursor-pointer flex-shrink-0 border"
      :class="[
        selectedConversationId === conv.id
          ? 'bg-primary/10 border-primary/30 shadow-xs'
          : 'bg-card/40 hover:bg-muted/40 border-border/30 hover:border-border/60',
      ]"
      @click="emit('selectConversation', conv.id)"
    >
      <!-- Active vertical accent bar -->
      <div
        v-if="selectedConversationId === conv.id"
        class="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary"
      />

      <!-- Avatar with provider badge overlay -->
      <div class="relative shrink-0">
        <div
          class="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm bg-gradient-to-br border shadow-xs"
          :class="getAvatarColor(conv.contact_name)"
        >
          {{ conv.avatar_initials || '?' }}
        </div>
        <!-- Channel provider badge -->
        <div
          class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-background overflow-hidden"
          :class="getProviderColorClass(conv.channel_badge_name)"
        >
          <HugeiconsIcon :icon="getProviderIcon(conv.channel_badge_name)" :size="9" />
        </div>
      </div>

      <!-- Text Content -->
      <div class="flex flex-col flex-1 min-w-0">
        <!-- Row 1: Name + Channel Pill + Timestamp -->
        <div class="flex items-center justify-between gap-1 mb-1">
          <div class="flex items-center gap-1.5 truncate flex-1 min-w-0">
            <span class="text-xs sm:text-sm font-bold text-foreground truncate">
              {{ conv.contact_name || t('conversations.unknown_contact', 'Unknown') }}
            </span>
            <span
              v-if="conv.channel_badge_name"
              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-muted/60 text-muted-foreground border border-border/40 truncate shrink-0 max-w-[80px]"
              :title="conv.channel_badge_name"
            >
              {{ conv.channel_badge_name }}
            </span>
          </div>
          <span class="text-[11px] font-mono text-muted-foreground/80 shrink-0">
            {{ formatTime(conv.time) }}
          </span>
        </div>

        <!-- Row 2: Message preview + Unread pill -->
        <div class="flex items-center justify-between gap-2">
          <p
            class="text-xs text-muted-foreground truncate leading-normal flex-1"
            :class="{ 'font-semibold text-foreground/90': conv.unread_count > 0 }"
          >
            {{ conv.text || t('conversations.no_messages', 'No messages') }}
          </p>

          <!-- Unread Count Badge -->
          <span
            v-if="conv.unread_count > 0"
            class="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold font-mono bg-primary text-primary-foreground shadow-xs shadow-primary/30 shrink-0 animate-pulse"
          >
            {{ conv.unread_count > 99 ? '99+' : conv.unread_count }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="conversations.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div class="w-12 h-12 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center text-muted-foreground/60">
        <HugeiconsIcon :icon="ArchiveIcon" :size="20" />
      </div>
      <p class="text-xs text-muted-foreground font-medium">
        {{ t('conversations.no_conversations', 'No conversations found') }}
      </p>
    </div>

    <!-- Load more button -->
    <div v-if="hasMore" class="p-3 flex justify-center">
      <button
        class="text-xs text-primary hover:underline font-semibold py-1.5 px-4 rounded-xl hover:bg-primary/10 transition-colors disabled:opacity-50 border border-primary/20"
        :disabled="isFetchingMore"
        @click="emit('loadMore')"
      >
        {{ isFetchingMore ? t('common.loading', 'Loading...') : t('common.load_more', 'Load more') }}
      </button>
    </div>
  </div>
</template>
