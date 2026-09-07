<script setup lang="ts">
import type { InboxConversationItem } from '@/types/entities/conversation'
import {
  BubbleChatIcon,
  Comment01Icon,
  FacebookIcon,
  InstagramIcon,
  Search01Icon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Input } from '@/components/uic/input'

const props = defineProps<{
  conversations: InboxConversationItem[]
  activeConversationId: number | null
  isLoading: boolean
  selectedChannelFilter: string
  searchQuery: string
}>()

const emit = defineEmits<{
  select: [id: number]
  'update:selectedChannelFilter': [value: string]
  'update:searchQuery': [value: string]
}>()

function getChannelIcon(badgeName: string) {
  const name = (badgeName || '').toLowerCase()
  if (name.includes('whatsapp')) return WhatsappIcon
  if (name.includes('instagram')) return InstagramIcon
  if (name.includes('messenger') || name.includes('facebook')) return FacebookIcon
  return BubbleChatIcon
}

function getChannelBadgeColor(badgeName: string) {
  const name = (badgeName || '').toLowerCase()
  if (name.includes('whatsapp')) return 'bg-emerald-500 border-emerald-400'
  if (name.includes('instagram')) return 'bg-gradient-to-br from-pink-500 to-purple-500 border-pink-400'
  if (name.includes('messenger') || name.includes('facebook')) return 'bg-blue-500 border-blue-400'
  return 'bg-primary border-primary'
}

const avatarColors = [
  'bg-rose-500', 'bg-sky-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-violet-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500',
]
function getAvatarColor(name: string) {
  let hash = 0
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}
</script>

<template>
  <div class="flex flex-col h-full">

    <!-- Header -->
    <div class="flex items-center justify-between px-5 pt-5 pb-2">
      <h2 class="text-2xl font-extrabold tracking-tight uppercase text-foreground">
        Inbox
      </h2>
      <span
        v-if="conversations.length > 0"
        class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400"
      >
        {{ conversations.length }}
      </span>
    </div>

    <!-- Search -->
    <div class="px-4 pb-2 pt-1">
      <div class="relative">
        <HugeiconsIcon
          :icon="Search01Icon"
          :size="17"
          class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          :model-value="searchQuery"
          type="text"
          placeholder="Search..."
          class="pl-11 h-11 rounded-full bg-muted/20 border-border/20 text-sm"
          @update:model-value="emit('update:searchQuery', $event as string)"
        />
      </div>
    </div>

    <!-- Channel Filters -->
    <div class="flex items-center gap-2 px-4 pb-3 pt-1 overflow-x-auto">
      <button
        class="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shrink-0"
        :class="selectedChannelFilter === 'all'
          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
          : 'bg-muted/20 hover:bg-muted/40 text-muted-foreground border border-border/20'"
        @click="emit('update:selectedChannelFilter', 'all')"
      >
        All
      </button>
      <button
        class="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shrink-0 flex items-center gap-1.5"
        :class="selectedChannelFilter === 'whatsapp'
          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
          : 'bg-muted/20 hover:bg-muted/40 text-muted-foreground border border-border/20'"
        @click="emit('update:selectedChannelFilter', 'whatsapp')"
      >
        <HugeiconsIcon :icon="WhatsappIcon" :size="14" />
        <span>WhatsApp</span>
      </button>
      <button
        class="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shrink-0 flex items-center gap-1.5"
        :class="selectedChannelFilter === 'instagram'
          ? 'bg-pink-600 text-white shadow-md shadow-pink-600/25'
          : 'bg-muted/20 hover:bg-muted/40 text-muted-foreground border border-border/20'"
        @click="emit('update:selectedChannelFilter', 'instagram')"
      >
        <HugeiconsIcon :icon="InstagramIcon" :size="14" />
        <span>Instagram</span>
      </button>
      <button
        class="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shrink-0 flex items-center gap-1.5"
        :class="selectedChannelFilter === 'messenger'
          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
          : 'bg-muted/20 hover:bg-muted/40 text-muted-foreground border border-border/20'"
        @click="emit('update:selectedChannelFilter', 'messenger')"
      >
        <HugeiconsIcon :icon="FacebookIcon" :size="14" />
        <span>Messenger</span>
      </button>
    </div>

    <!-- Conversation Cards -->
    <div class="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
      <!-- Skeleton Loading -->
      <div v-if="isLoading" class="space-y-2 px-0.5">
        <div
          v-for="i in 5"
          :key="i"
          class="flex items-center gap-3 px-3.5 py-3.5 rounded-2xl"
        >
          <!-- Avatar skeleton -->
          <div class="w-12 h-12 rounded-full bg-white/[0.06] shrink-0 animate-pulse" />
          <!-- Text skeleton -->
          <div class="flex-1 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="h-3.5 bg-white/[0.08] rounded-full animate-pulse" :style="{ width: `${60 + i * 12}px` }" />
              <div class="h-2.5 w-8 bg-white/[0.05] rounded-full animate-pulse" />
            </div>
            <div class="h-2.5 bg-white/[0.05] rounded-full animate-pulse" :style="{ width: `${100 + i * 15}px` }" />
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="conversations.length === 0" class="p-10 text-center space-y-3">
        <div class="w-14 h-14 rounded-2xl bg-muted/15 flex items-center justify-center mx-auto">
          <HugeiconsIcon :icon="Comment01Icon" :size="28" class="text-muted-foreground/30" />
        </div>
        <p class="text-sm text-muted-foreground/60">No conversations found.</p>
      </div>

      <!-- Cards -->
      <div
        v-for="item in conversations"
        :key="item.id"
        class="flex items-center gap-3 px-3.5 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 group"
        :class="activeConversationId === item.id
          ? 'bg-primary/8 border border-primary/25 shadow-sm shadow-primary/5'
          : 'hover:bg-muted/30 border border-transparent'"
        @click="emit('select', item.id)"
      >
        <!-- Avatar -->
        <div class="relative shrink-0">
          <div
            class="w-12 h-12 rounded-full text-white font-semibold flex items-center justify-center text-sm shadow-sm"
            :class="getAvatarColor(item.contact_name)"
          >
            {{ item.avatar_initials }}
          </div>
          <span
            class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-background"
            :class="getChannelBadgeColor(item.channel_badge_name)"
          >
            <HugeiconsIcon :icon="getChannelIcon(item.channel_badge_name)" :size="10" class="text-white" />
          </span>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-1">
            <h4 class="text-sm font-semibold text-foreground truncate">
              {{ item.contact_name }}
            </h4>
            <span
              class="text-[10px] shrink-0 font-medium"
              :class="item.unread_count > 0 ? 'text-emerald-400' : 'text-muted-foreground/60'"
            >
              {{ item.time }}
            </span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs text-muted-foreground/70 truncate flex-1">
              {{ item.text || 'No messages yet' }}
            </p>
            <span
              v-if="item.unread_count > 0"
              class="shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm shadow-emerald-500/30"
            >
              {{ item.unread_count }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
