import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { conversationsService } from '@/services/conversationsService'
import { channelsService } from '@/services/channelsService'
import type { InboxConversationItem } from '@/types/entities/conversation'
import type { Channel } from '@/types/entities/channel'

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
  const activeChannelId = ref<number | null>(null) // null = All

  onMounted(async () => {
    try {
      channels.value = await channelsService.getAll()
    } catch {
      // ignore
    }
  })

  const providerTabs = computed(() => {
    const tabs: Array<{ id: number | null, label: string, icon?: string | null }> = [{ id: null, label: 'All', icon: null }]
    channels.value.forEach(channel => {
      tabs.push({
        id: channel.id,
        label: channel.name,
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

  // ── Actions ───────────────────────────────────────────────────────────────
  async function fetchConversations() {
    isLoading.value = true
    try {
      conversations.value = await conversationsService.getConversations()
    } finally {
      isLoading.value = false
    }
  }

  function selectConversation(id: number | null) {
    selectedConversationId.value = id
  }

  function setChannelTab(channelId: number | null) {
    activeChannelId.value = channelId
    fetchConversations()
  }

  function toggleFilterPanel() {
    showFilters.value = !showFilters.value
  }

  function resetFilters() {
    statusFilter.value = null
    activeChannelId.value = null
    fetchConversations()
  }

  onMounted(() => {
    fetchConversations()
  })

  return {
    conversations,
    isLoading,
    selectedConversationId,
    searchQuery,
    showFilters,
    statusFilter,
    activeChannelId,

    filteredConversations,
    selectedConversation,
    providerTabs,
    hasActiveFilters,

    fetchConversations,
    selectConversation,
    setChannelTab,
    toggleFilterPanel,
    resetFilters,
  }
}
