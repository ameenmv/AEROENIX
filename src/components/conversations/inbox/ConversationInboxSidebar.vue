<script setup lang="ts">
import { ChevronDown, Search } from 'lucide-vue-next'
import { WhatsappIcon, InstagramIcon, FacebookIcon, BubbleChatIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/uic/popover'
import ConversationInboxList from './ConversationInboxList.vue'
import type { InboxConversationItem } from '@/types/entities/conversation'

const props = defineProps<{
  conversations: InboxConversationItem[]
  selectedConversationId: number | null
  searchQuery: string
  isLoading: boolean
  activeChannelId: number | null
  providerTabs: { id: number | null, label: string, icon?: string | null }[]
}>()

const emit = defineEmits<{
  selectConversation: [id: number]
  'update:searchQuery': [value: string]
  setChannelTab: [id: number | null]
}>()

const { t } = useI18n()

// Show first 3 visible tabs, rest in dropdown
const MAX_VISIBLE_TABS = 3
const visibleTabs = computed(() => props.providerTabs.slice(0, MAX_VISIBLE_TABS))
const overflowTabs = computed(() => props.providerTabs.slice(MAX_VISIBLE_TABS))

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
  <div class="flex flex-col gap-3 w-full h-full min-h-0 relative">
    <!-- ── Row 1: Title + Count Badge ──────────────────────────────── -->
    <div class="flex items-center justify-between w-full flex-shrink-0">
      <h2 class="text-[15px] font-bold text-foreground">
        {{ t('conversations.inbox', 'Inbox') }}
      </h2>
      <div class="flex items-center px-2 py-0.5 rounded-2xl bg-primary/10">
        <span class="text-[11px] font-bold text-primary">{{ conversations.length }}</span>
      </div>
    </div>

    <!-- ── Row 2: Search Input ─────────────────────────────────────── -->
    <div class="flex items-center gap-2 flex-shrink-0 min-w-0">
      <div class="flex items-center gap-2 flex-1 min-w-0 px-3 py-2 rounded-full bg-background border border-border">
        <Search class="w-[14px] h-[14px] text-muted-foreground flex-shrink-0" />
        <input
          :value="searchQuery"
          :placeholder="t('common.search', 'Search')"
          class="flex-1 bg-transparent text-[12px] font-normal text-foreground placeholder-muted-foreground outline-none"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>

    <!-- ── Row 3: Platform Tabs ────────────────────────────────────── -->
    <div class="flex items-center gap-1.5 flex-shrink-0 relative provider-dropdown-area">
      <button
        v-for="tab in visibleTabs"
        :key="tab.label"
        class="flex items-center gap-[4px] px-[10px] py-[5px] rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
        :class="activeChannelId === tab.id
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-transparent text-muted-foreground hover:bg-muted/50'"
        @click="selectProvider(tab.id)"
      >
        <HugeiconsIcon v-if="tab.id !== null" :icon="getProviderIcon(tab.label)" :size="14" class="flex-shrink-0" />
        {{ tab.label }}
      </button>

      <div class="flex-1" />

      <!-- Overflow dropdown -->
      <Popover v-if="overflowTabs.length > 0">
        <PopoverTrigger as-child>
          <button class="flex items-center justify-center w-[24px] h-[24px] rounded-full transition-colors cursor-pointer flex-shrink-0 hover:bg-muted/50">
            <ChevronDown class="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" :side-offset="8" class="w-[188px] !rounded-[24px] !p-3 border border-border bg-background/90 backdrop-blur-[5px] shadow-lg flex flex-col gap-2">
          <button
            v-for="tab in overflowTabs"
            :key="tab.label"
            class="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] font-medium transition-all cursor-pointer"
            :class="activeChannelId === tab.id
              ? 'bg-muted border border-border rounded-[80px] text-foreground'
              : 'rounded-[24px] text-muted-foreground hover:bg-muted/50 border border-transparent'"
            @click="selectProvider(tab.id)"
          >
            <img v-if="tab.icon" :src="tab.icon" :alt="tab.label" class="w-[14px] h-[14px] object-contain">
            {{ tab.label }}
          </button>
        </PopoverContent>
      </Popover>
    </div>

    <!-- ── Loading Skeleton ───────────────────────────────────────── -->
    <div v-if="isLoading" class="flex flex-col flex-1 overflow-y-auto mt-2">
      <div v-for="i in 6" :key="i" class="flex items-center gap-3 px-4 py-3 border-b border-border/50">
        <!-- Avatar skeleton -->
        <div class="w-[46px] h-[46px] rounded-full bg-muted/60 animate-pulse flex-shrink-0" />
        <div class="flex flex-col flex-1 gap-2">
          <!-- Name & Time skeleton -->
          <div class="flex justify-between items-center w-full">
            <div class="h-3.5 bg-muted/60 rounded-full w-24 animate-pulse" />
            <div class="h-2.5 bg-muted/60 rounded-full w-8 animate-pulse" />
          </div>
          <!-- Message preview skeleton -->
          <div class="h-3 bg-muted/40 rounded-full w-[85%] animate-pulse" />
        </div>
      </div>
    </div>

    <!-- ── Ticket List ────────────────────────────────────────────── -->
    <template v-else>
      <ConversationInboxList
        :conversations="conversations"
        :selected-conversation-id="selectedConversationId"
        @select-conversation="emit('selectConversation', $event)"
      />
    </template>
  </div>
</template>
