import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { conversationsService } from '@/services/conversationsService'
import { channelsService } from '@/services/channelsService'
import type { InboxConversationItem } from '@/types/entities/conversation'
import type { Channel } from '@/types/entities/channel'

export interface ProviderTab {
  id: number | null
  label: string
  provider?: string | null
  provider_label?: string | null
  profile_picture_url?: string | null
  username?: string | null
  icon?: string | null
}

export function useConversationInbox() {
  const route = useRoute()
  const router = useRouter()

  const conversations = ref<InboxConversationItem[]>([])
  const isLoading = ref(true)
  const selectedConversationId = ref<number | null>(
    route.query.id ? Number.parseInt(route.query.id as string) : null,
  )

  watch(selectedConversationId, (newId) => {
    const query = { ...route.query }
    if (newId) {
      query.id = newId.toString()
    } else {
      delete query.id
    }
    router.replace({ query })
  })

  // ── Channels (Tabs) ───────────────────────────────────────────────────────
  const channels = ref<Channel[]>([])
  const isChannelsLoaded = ref(false)
  const activeChannelId = ref<number | null>(null) // null = All

  onMounted(async () => {
    try {
      channels.value = await channelsService.getAll()
    } catch {
      // ignore
    } finally {
      isChannelsLoaded.value = true
    }
  })

  const providerTabs = computed<ProviderTab[]>(() => {
    const tabs: ProviderTab[] = [
      { id: null, label: 'All', provider: null, icon: null },
    ]
    channels.value.forEach(channel => {
      tabs.push({
        id: channel.id,
        label: channel.name || channel.username || channel.provider_label || `Channel ${channel.id}`,
        provider: channel.provider,
        provider_label: channel.provider_label,
        profile_picture_url: channel.profile_picture_url,
        username: channel.username,
        icon: null,
      })
    })
    return tabs
  })

  // ── Filters ───────────────────────────────────────────────────────────────
  const searchQuery = ref('')
  const showFilters = ref(false)
  const statusFilter = ref<'mine' | 'unassigned' | null>(null)

  const filteredConversations = computed(() => {
    let list = conversations.value
    
    // Channel filter
    if (activeChannelId.value) {
      list = list.filter(c => c.channel_id === activeChannelId.value)
    }

    // Search filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(
        c =>
          c.contact_name?.toLowerCase().includes(q) ||
          c.text?.toLowerCase().includes(q)
      )
    }
    return list
  })

  const selectedConversation = computed(
    () => conversations.value.find(c => c.id === selectedConversationId.value) || null
  )

  const hasActiveFilters = computed(
    () => statusFilter.value !== null || activeChannelId.value !== null
  )

  // ── Pagination State ───────────────────────────────────────────────────────
  const currentPage = ref(1)
  const hasMore = ref(false)
  const isFetchingMore = ref(false)

  // ── Actions ───────────────────────────────────────────────────────────────
  async function fetchConversations(page = 1) {
    if (page === 1) {
      isLoading.value = true
      currentPage.value = 1
    } else {
      isFetchingMore.value = true
    }

    try {
      const res = await conversationsService.getConversations({
        page,
        channel: activeChannelId.value ? String(activeChannelId.value) : undefined,
      })

      if (Array.isArray(res)) {
        conversations.value = res
        hasMore.value = false
      } else {
        if (page === 1) {
          conversations.value = res.data || []
        } else {
          conversations.value = [...conversations.value, ...(res.data || [])]
        }
        hasMore.value = !!res.hasMore
        currentPage.value = page
      }
    } finally {
      isLoading.value = false
      isFetchingMore.value = false
    }
  }

  async function loadMore() {
    if (isFetchingMore.value || !hasMore.value) return
    await fetchConversations(currentPage.value + 1)
  }

  function selectConversation(id: number | null) {
    selectedConversationId.value = id
  }

  function setChannelTab(channelId: number | null) {
    activeChannelId.value = channelId
    fetchConversations(1)
  }

  function toggleFilterPanel() {
    showFilters.value = !showFilters.value
  }

  function resetFilters() {
    statusFilter.value = null
    activeChannelId.value = null
    fetchConversations(1)
  }

  onMounted(() => {
    fetchConversations()
  })

  return {
    conversations,
    isLoading,
    isChannelsLoaded,
    channels,
    selectedConversationId,
    searchQuery,
    showFilters,
    statusFilter,
    activeChannelId,

    // Pagination
    hasMore,
    isFetchingMore,
    currentPage,

    filteredConversations,
    selectedConversation,
    providerTabs,
    hasActiveFilters,

    fetchConversations,
    loadMore,
    selectConversation,
    setChannelTab,
    toggleFilterPanel,
    resetFilters,
  }
}
