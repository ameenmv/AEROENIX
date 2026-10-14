<script setup lang="ts">
import {
  BubbleChatIcon,
  Cancel01Icon,
  FacebookIcon,
  FilterIcon,
  InstagramIcon,
  Search01Icon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import ConversationInboxList from './ConversationInboxList.vue'
import type { InboxConversationItem } from '@/types/entities/conversation'

defineProps<{
  conversations: InboxConversationItem[]
  selectedConversationId: number | null
  searchQuery: string
  isLoading: boolean
  activeChannelId: number | null
  providerTabs: { id: number | null, label: string, icon?: string | null }[]
  hasMore?: boolean
  isFetchingMore?: boolean
}>()

const emit = defineEmits<{
  selectConversation: [id: number]
  'update:searchQuery': [value: string]
  setChannelTab: [id: number | null]
  loadMore: []
}>()

const { t } = useI18n()

function getProviderIcon(channelBadgeName: string | null | undefined) {
  const name = (channelBadgeName || '').toLowerCase()
  if (name.includes('whatsapp')) return WhatsappIcon
  if (name.includes('instagram')) return InstagramIcon
  if (name.includes('facebook') || name.includes('messenger')) return FacebookIcon
  return BubbleChatIcon
}

function selectProvider(id: number | null) {
  emit('setChannelTab', id)
}
</script>

<template>
  <div class="flex flex-col gap-3 w-full h-full min-h-0 relative select-none">
    <!-- ── Row 1: Header + Count Badge ──────────────────────────────── -->
    <div class="flex items-center justify-between w-full px-1 flex-shrink-0">
      <div class="flex items-center gap-2">
        <h2 class="text-base font-bold tracking-tight text-foreground">
          {{ t('conversations.inbox', 'Inbox') }}
        </h2>
        <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
          {{ conversations.length }}
        </span>
      </div>
    </div>

    <!-- ── Row 2: Search Input with glassmorphic look ───────────────── -->
    <div class="flex items-center gap-2 flex-shrink-0 min-w-0 px-1">
      <div class="flex items-center gap-2.5 flex-1 min-w-0 px-3.5 py-2 rounded-xl bg-muted/30 border border-border/50 focus-within:border-primary/50 focus-within:bg-card transition-all">
        <HugeiconsIcon :icon="Search01Icon" :size="15" class="text-muted-foreground shrink-0" />
        <input
          :value="searchQuery"
          :placeholder="t('conversations.search_placeholder', 'Search conversations...')"
          class="flex-1 bg-transparent text-xs font-normal text-foreground placeholder-muted-foreground outline-none min-w-0"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        >
        <button
          v-if="searchQuery"
          type="button"
          class="text-muted-foreground hover:text-foreground transition-colors p-0.5"
          @click="emit('update:searchQuery', '')"
        >
          <HugeiconsIcon :icon="Cancel01Icon" :size="13" />
        </button>
      </div>
    </div>

    <!-- ── Row 3: Platform Filter Tabs ─────────────────────────────── -->
    <div 
      class="flex items-center gap-1.5 flex-shrink-0 overflow-x-auto px-1 pb-1 no-scrollbar-tabs"
      style="scrollbar-width: none; -ms-overflow-style: none;"
    >
      <button
        v-for="tab in providerTabs"
        :key="tab.id !== null ? tab.id : 'all'"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 border"
        :class="activeChannelId === tab.id
          ? 'bg-primary text-primary-foreground border-primary shadow-xs shadow-primary/25'
          : 'bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground border-border/40'"
        @click="selectProvider(tab.id)"
      >
        <HugeiconsIcon v-if="tab.id !== null" :icon="getProviderIcon(tab.label)" :size="13" class="shrink-0" />
        <HugeiconsIcon v-else :icon="FilterIcon" :size="12" class="shrink-0 opacity-70" />
        <span>{{ tab.id === null ? t('conversations.all_channels', 'All') : tab.label }}</span>
      </button>
    </div>

    <!-- ── Loading Skeleton ───────────────────────────────────────── -->
    <div v-if="isLoading" class="flex flex-col flex-1 overflow-y-auto px-1 space-y-2 mt-1">
      <div v-for="i in 6" :key="i" class="flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-border/30">
        <div class="w-11 h-11 rounded-full bg-muted/60 animate-pulse shrink-0" />
        <div class="flex flex-col flex-1 gap-2 min-w-0">
          <div class="flex justify-between items-center w-full">
            <div class="h-3.5 bg-muted/60 rounded-full w-24 animate-pulse" />
            <div class="h-2.5 bg-muted/50 rounded-full w-10 animate-pulse" />
          </div>
          <div class="h-3 bg-muted/40 rounded-full w-4/5 animate-pulse" />
        </div>
      </div>
    </div>

    <!-- ── Conversation List ──────────────────────────────────────── -->
    <ConversationInboxList
      v-else
      :conversations="conversations"
      :selected-conversation-id="selectedConversationId"
      :has-more="hasMore"
      :is-fetching-more="isFetchingMore"
      @select-conversation="emit('selectConversation', $event)"
      @load-more="emit('loadMore')"
    />
  </div>
</template>
