<script setup lang="ts">
import { Archive } from 'lucide-vue-next'
import { WhatsappIcon, InstagramIcon, FacebookIcon, BubbleChatIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import type { InboxConversationItem } from '@/types/entities/conversation'

defineProps<{
  conversations: InboxConversationItem[]
  selectedConversationId: number | null
}>()

const emit = defineEmits<{
  selectConversation: [id: number]
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

const avatarColors = ['#e9556b', '#6366f1', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
function getAvatarColor(name: string | null | undefined): string {
  if (!name) return avatarColors[0]!
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return avatarColors[hash % avatarColors.length]!
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
  if (name.includes('whatsapp')) return 'bg-emerald-500/15 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400'
  if (name.includes('instagram')) return 'bg-pink-500/15 text-pink-500 dark:bg-pink-500/20 dark:text-pink-400'
  if (name.includes('facebook') || name.includes('messenger')) return 'bg-blue-500/15 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400'
  return 'bg-primary/15 text-primary'
}
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin">
    <div
      v-for="conv in conversations"
      :key="conv.id"
      class="ticket-card relative flex items-center gap-[12px] py-[12px] px-[16px] w-full transition-all duration-200 cursor-pointer flex-shrink-0 border-b border-slate-100 dark:border-border"
      :class="[
        selectedConversationId === conv.id
          ? 'bg-slate-50 dark:bg-muted/50'
          : 'bg-transparent hover:bg-slate-50/50 dark:hover:bg-muted/20',
      ]"
      @click="emit('selectConversation', conv.id)"
    >
      <!-- Avatar with provider overlay -->
      <div class="relative flex-shrink-0">
        <div
          class="w-[46px] h-[46px] rounded-full flex items-center justify-center text-white text-[14px] font-semibold"
          :style="{ backgroundColor: getAvatarColor(conv.contact_name) }"
        >
          {{ conv.avatar_initials || '?' }}
        </div>
        <!-- Provider icon (WhatsApp/Instagram badge) -->
        <div class="absolute -bottom-[2px] -right-[2px] w-[20px] h-[20px] rounded-full border-[2px] border-card flex items-center justify-center overflow-hidden" :class="getProviderColorClass(conv.channel_badge_name)">
          <HugeiconsIcon :icon="getProviderIcon(conv.channel_badge_name)" :size="10" />
        </div>
      </div>

      <!-- Text content -->
      <div class="flex flex-col flex-1 min-w-0 relative">
        <!-- Row 1: Name + Time -->
        <div class="flex items-center justify-between w-full mb-[2px]">
          <div class="overflow-hidden flex-1">
            <p class="text-[14px] font-semibold text-foreground truncate leading-normal">
              {{ conv.contact_name || t('conversations.unknown_contact', 'Unknown') }}
            </p>
          </div>
          <span class="text-[12px] font-normal text-muted-foreground flex-shrink-0 ml-1">
            {{ formatTime(conv.time) }}
          </span>
        </div>

        <!-- Row 2: Preview + Unread badge -->
        <div class="flex items-center gap-[8px] pt-[3px]">
          <div class="overflow-hidden flex-1">
            <p class="text-[13px] font-normal text-muted-foreground truncate leading-normal">
              {{ conv.text || t('conversations.no_messages', 'No messages') }}
            </p>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <!-- Unread badge -->
            <div
              v-if="conv.unread_count > 0"
              class="flex items-center justify-center min-w-[20px] h-[20px] rounded-full bg-primary px-[5px]"
            >
              <span class="text-[10px] font-semibold text-primary-foreground leading-none">
                {{ conv.unread_count > 99 ? '99+' : conv.unread_count }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="conversations.length === 0" class="flex flex-col items-center justify-center py-8 gap-2 text-center">
      <Archive class="w-8 h-8 text-muted-foreground/50" />
      <p class="text-[12px] text-muted-foreground">
        {{ t('conversations.no_conversations', 'No conversations found') }}
      </p>
    </div>
  </div>
</template>
