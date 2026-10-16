<script setup lang="ts">
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BubbleChatIcon,
  Cancel01Icon,
  FilterIcon,
  InstagramIcon,
  MessengerIcon,
  Search01Icon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ConversationInboxList from './ConversationInboxList.vue'
import type { InboxConversationItem } from '@/types/entities/conversation'
import type { ProviderTab } from '@/composables/conversations/useConversationInbox'

const props = defineProps<{
  conversations: InboxConversationItem[]
  selectedConversationId: number | null
  searchQuery: string
  isLoading: boolean
  activeChannelId: number | null
  providerTabs: ProviderTab[]
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

function getChannelIcon(provider?: string | null, label?: string) {
  const p = (provider || label || '').toLowerCase()
  if (p.includes('whatsapp')) return WhatsappIcon
  if (p.includes('instagram')) return InstagramIcon
  if (p.includes('facebook') || p.includes('messenger')) return MessengerIcon
  return BubbleChatIcon
}

function getChannelColor(provider?: string | null, label?: string) {
  const p = (provider || label || '').toLowerCase()
  if (p.includes('whatsapp')) return '#25D366'
  if (p.includes('instagram')) return '#E1306C'
  if (p.includes('facebook') || p.includes('messenger')) return '#0084FF'
  return 'currentColor'
}

const tabsContainerRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function checkScroll() {
  const el = tabsContainerRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function scrollNext() {
  if (!tabsContainerRef.value) return
  tabsContainerRef.value.scrollBy({ left: 140, behavior: 'smooth' })
  setTimeout(checkScroll, 250)
}

function scrollPrev() {
  if (!tabsContainerRef.value) return
  tabsContainerRef.value.scrollBy({ left: -140, behavior: 'smooth' })
  setTimeout(checkScroll, 250)
}

function onWheel(e: WheelEvent) {
  if (!tabsContainerRef.value) return
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    tabsContainerRef.value.scrollLeft += e.deltaY
    checkScroll()
  }
}

function selectProvider(id: number | null, event?: MouseEvent) {
  emit('setChannelTab', id)
  if (event?.currentTarget) {
    (event.currentTarget as HTMLElement).scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
    setTimeout(checkScroll, 300)
  }
}

watch(() => props.providerTabs, () => {
  nextTick(checkScroll)
}, { deep: true })

watch(() => props.activeChannelId, (newId) => {
  if (newId === null) return
  nextTick(() => {
    const el = tabsContainerRef.value?.querySelector(`[data-tab-id="${newId}"]`) as HTMLElement | null
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      setTimeout(checkScroll, 300)
    }
  })
})

onMounted(() => {
  nextTick(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScroll)
})
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

    <!-- ── Row 3: Platform Filter Tabs with Next/Prev Buttons ───────── -->
    <div class="relative flex items-center w-full min-w-0 px-1 gap-1">
      <!-- Prev Channel button -->
      <button
        v-if="canScrollLeft"
        type="button"
        class="h-7 w-7 rounded-xl bg-card border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-xs"
        :title="t('conversations.prev_channel', 'Previous channels')"
        @click="scrollPrev"
      >
        <HugeiconsIcon :icon="ArrowLeft01Icon" :size="13" />
      </button>

      <!-- Scrollable Tabs Container -->
      <div 
        ref="tabsContainerRef"
        class="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto no-scrollbar-tabs py-0.5 scroll-smooth select-none"
        style="scrollbar-width: none; -ms-overflow-style: none;"
        @scroll="checkScroll"
        @wheel.passive="onWheel"
      >
        <button
          v-for="tab in providerTabs"
          :key="tab.id !== null ? tab.id : 'all'"
          :data-tab-id="tab.id"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border"
          :class="activeChannelId === tab.id
            ? 'bg-primary text-primary-foreground border-primary shadow-xs shadow-primary/25'
            : 'bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground border-border/40'"
          @click="selectProvider(tab.id, $event)"
        >
          <!-- Channel Brand Logo based on provider -->
          <span
            v-if="tab.id !== null"
            class="flex items-center justify-center shrink-0"
            :style="{ color: activeChannelId === tab.id ? 'inherit' : getChannelColor(tab.provider, tab.label) }"
          >
            <HugeiconsIcon :icon="getChannelIcon(tab.provider, tab.label)" :size="13" />
          </span>

          <!-- Filter Icon for 'All' -->
          <HugeiconsIcon v-else :icon="FilterIcon" :size="12" class="shrink-0 opacity-70" />

          <!-- Channel Name -->
          <span class="truncate max-w-[120px]">{{ tab.id === null ? t('conversations.all_channels', 'All') : tab.label }}</span>
        </button>
      </div>

      <!-- Next Channel button -->
      <button
        v-if="canScrollRight"
        type="button"
        class="h-7 w-7 rounded-xl bg-card border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-xs"
        :title="t('conversations.next_channel', 'Next channels')"
        @click="scrollNext"
      >
        <HugeiconsIcon :icon="ArrowRight01Icon" :size="13" />
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
