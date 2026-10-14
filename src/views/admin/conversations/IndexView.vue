<script setup lang="ts">
import { SparklesIcon, UserGroupIcon, BubbleChatIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Radio } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Button } from '@/components/uic/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/uic/sheet'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/uic/alert-dialog'
import ConversationInboxSidebar from '@/components/conversations/inbox/ConversationInboxSidebar.vue'
import ConversationChatPanel from '@/components/conversations/chat/ConversationChatPanel.vue'
import ConversationPropertiesSidebar from '@/components/conversations/properties/ConversationPropertiesSidebar.vue'

import { useConversationInbox } from '@/composables/conversations/useConversationInbox'
import { useConversationChat } from '@/composables/conversations/useConversationChat'
import { useConversationProperties } from '@/composables/conversations/useConversationProperties'
import { getEcho } from '@/services/echo'

const { t } = useI18n()

// ── Resizable Layout State (3 columns) ──────────────────────────────────────
const leftWidth = ref(Number(localStorage.getItem('conversations_left_width')) || 290)
const rightWidth = ref(Number(localStorage.getItem('conversations_right_width')) || 300)

let isDraggingLeft = false
let isDraggingRight = false
const containerRef = ref<HTMLElement | null>(null)

function startDragLeft() {
  isDraggingLeft = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

function startDragRight() {
  isDraggingRight = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (isDraggingLeft && containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    const newWidth = e.clientX - rect.left
    if (newWidth >= 240 && newWidth <= 450) {
      leftWidth.value = newWidth
      localStorage.setItem('conversations_left_width', newWidth.toString())
    }
  } else if (isDraggingRight && containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    const newWidth = rect.right - e.clientX
    if (newWidth >= 240 && newWidth <= 450) {
      rightWidth.value = newWidth
      localStorage.setItem('conversations_right_width', newWidth.toString())
    }
  }
}

function stopDrag() {
  isDraggingLeft = false
  isDraggingRight = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}

// ── UI Toggles & Zoom ────────────────────────────────────────────────────────
const isChatExpanded = ref(false)
const isPropertiesVisible = ref(true)
const showMobileProperties = ref(false)
const chatTextScale = ref(1)

const isPropertiesOpen = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 1536) {
    return showMobileProperties.value
  }
  return isPropertiesVisible.value
})

function toggleFullscreen() {
  if (!containerRef.value) return
  
  if (!document.fullscreenElement) {
    containerRef.value.requestFullscreen().catch(err => console.error(err))
    isChatExpanded.value = true
  } else {
    document.exitFullscreen()
    isChatExpanded.value = false
  }
}

// Listen to external fullscreen changes (like hitting Esc)
if (typeof window !== 'undefined') {
  window.addEventListener('fullscreenchange', () => {
    isChatExpanded.value = !!document.fullscreenElement
  })
}

function toggleProperties() {
  // On wide desktop (2xl+ / 1536px+), toggle inline column; on smaller screens (< 1536px), open sheet drawer
  if (typeof window !== 'undefined' && window.innerWidth < 1536) {
    showMobileProperties.value = !showMobileProperties.value
  } else {
    isPropertiesVisible.value = !isPropertiesVisible.value
  }
}

function zoomIn() {
  if (chatTextScale.value < 1.5) chatTextScale.value += 0.1
}

function zoomOut() {
  if (chatTextScale.value > 0.7) chatTextScale.value -= 0.1
}

function resetZoom() {
  chatTextScale.value = 1
}

// ── Composables ──────────────────────────────────────────────────────────────
const {
  conversations,
  filteredConversations,
  isLoading: isInboxLoading,
  isChannelsLoaded,
  channels,
  selectedConversationId,
  searchQuery,
  activeChannelId,
  providerTabs,
  hasMore,
  isFetchingMore,
  selectConversation,
  setChannelTab,
  fetchConversations,
  loadMore,
} = useConversationInbox()

function clearSelectedConversation() {
  selectConversation(null)
}

const {
  messages,
  status,
  isLoading: isChatLoading,
  isSending: isSendingMessage,
  newMessage,
  sendMessage,
  toggleHandoff,
} = useConversationChat(selectedConversationId)

const {
  details: activeConversation,
  isLoading: isPropsLoading,
} = useConversationProperties(selectedConversationId)

// ── Handoff UI logic ─────────────────────────────────────────────────────────
const showHandoffDialog = ref(false)
const pendingHandoffAction = ref<'handoff' | 'resume' | null>(null)
const isTogglingHandoff = ref(false)

function requestHandoffToggle() {
  if (!status.value) return
  pendingHandoffAction.value = status.value.is_ai_paused ? 'resume' : 'handoff'
  showHandoffDialog.value = true
}

async function confirmHandoff() {
  isTogglingHandoff.value = true
  try {
    await toggleHandoff()
    if (pendingHandoffAction.value === 'handoff') {
      toast.info(t('conversations.staff_mode_toast', 'AI paused — conversation taken over by staff.'))
    } else {
      toast.success(t('conversations.ai_resumed_toast', 'AI bot auto-reply resumed.'))
    }
  } catch (err: any) {
    toast.error(t('conversations.handoff_error', 'Failed to update AI handoff status.'))
  } finally {
    isTogglingHandoff.value = false
    showHandoffDialog.value = false
    pendingHandoffAction.value = null
  }
}

function cancelHandoff() {
  showHandoffDialog.value = false
  pendingHandoffAction.value = null
}

// ── Real-Time (Laravel Echo + Reverb) ────────────────────────────────────────
let realtimeChannel: any = null

function setupRealtimeListeners() {
  const echoInstance = getEcho()
  if (!echoInstance) return

  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}')
  const hotelId = authUser?.hotels?.[0]?.id

  if (!hotelId) return

  echoInstance.connector.options.auth = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
      Accept: 'application/json',
    },
  }

  const channelName = `hotel.${hotelId}.inbox`
  realtimeChannel = echoInstance.private(channelName)

  realtimeChannel.listen('.inbox.message.received', (event: any) => {
    const msg = event?.message

    if (!msg) return

    if (msg.conversation_id === selectedConversationId.value) {
      const exists = messages.value.some((m) => m.id === msg.id)
      if (!exists) {
        messages.value.push({
          id: msg.id,
          sender_type: msg.sender_type,
          text: msg.text,
          time: msg.time,
        })
      }
    }
    
    // Refresh inbox
    fetchConversations()
  })

  realtimeChannel.listen('.conversation.handoff.updated', (event: any) => {
    if (!event?.conversation_id) return
    if (event.conversation_id === selectedConversationId.value && status.value) {
      status.value.is_ai_paused = event.is_ai_paused || event.handoff_status === 'human'
    }
  })
}

function cleanupRealtimeListeners() {
  if (realtimeChannel) {
    realtimeChannel.stopListening('.inbox.message.received')
    realtimeChannel.stopListening('.conversation.handoff.updated')
    const echoInstance = getEcho()
    if (echoInstance) {
      echoInstance.leaveChannel(`private-hotel.${JSON.parse(localStorage.getItem('auth_user') || '{}')?.hotels?.[0]?.id}.inbox`)
    }
    realtimeChannel = null
  }
}

onMounted(() => {
  setupRealtimeListeners()
})

onUnmounted(() => {
  cleanupRealtimeListeners()
})
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-(--spacing(16)))] bg-muted/10 p-2 sm:p-4 min-h-[600px]">
    <!-- No Connected Channels Zero-State Screen -->
    <div
      v-if="isChannelsLoaded && (!channels || channels.length === 0) && conversations.length === 0"
      class="flex flex-col items-center justify-center flex-1 w-full bg-card rounded-2xl border border-border/50 p-8 text-center shadow-xs"
    >
      <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Radio class="w-8 h-8 text-primary" />
      </div>
      <h2 class="text-xl font-bold text-foreground mb-2">
        {{ t('conversations.no_channels_connected', 'No Channels Connected') }}
      </h2>
      <p class="text-sm text-muted-foreground max-w-[440px] mb-6 leading-relaxed">
        {{ t('conversations.no_channels_desc', 'You have no active channels integrated yet. Connect a WhatsApp, Instagram, or Messenger channel to start receiving and replying to guest conversations.') }}
      </p>
      <Button
        class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-medium"
        @click="$router.push({ name: 'admin-channels' })"
      >
        {{ t('conversations.go_to_channels', 'Integrate Channels') }}
      </Button>
    </div>

    <!-- Main 3-Column Layout Container -->
    <div
      v-else
      id="chat-container"
      ref="containerRef"
      class="flex w-full h-full overflow-hidden relative bg-card rounded-2xl shadow-sm border border-border/40"
    >
      <!-- Left: Inbox Sidebar -->
      <div 
        :style="{ width: `${leftWidth}px` }" 
        class="flex-shrink-0 h-full p-3 bg-card/30 border-e border-border/50 transition-all duration-300 z-20"
        :class="selectedConversationId ? 'hidden lg:block' : 'w-full lg:w-auto flex-1 lg:flex-none'"
      >
        <ConversationInboxSidebar
          :conversations="filteredConversations"
          :selected-conversation-id="selectedConversationId"
          :search-query="searchQuery"
          :is-loading="isInboxLoading"
          :active-channel-id="activeChannelId"
          :provider-tabs="providerTabs"
          :has-more="hasMore"
          :is-fetching-more="isFetchingMore"
          @update:search-query="searchQuery = $event"
          @select-conversation="selectConversation"
          @set-channel-tab="setChannelTab"
          @load-more="loadMore"
        />
      </div>

      <!-- Left Drag Handle -->
      <div
        v-if="selectedConversationId"
        class="hidden lg:block w-[4px] h-full cursor-col-resize transition-colors z-10 flex-shrink-0 bg-transparent hover:bg-primary/20"
        @mousedown.prevent="startDragLeft"
        @dblclick.prevent="leftWidth = 320"
      />

      <!-- Center: Chat Panel -->
      <div 
        class="flex-1 min-w-0 h-full transition-all duration-300 overflow-hidden"
        :class="!selectedConversationId ? 'hidden lg:block' : 'block'"
      >
        <div v-if="!selectedConversationId" class="w-full h-full flex flex-col items-center justify-center bg-card/20 text-center px-4">
          <div class="w-18 h-18 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 text-primary shadow-xs">
            <HugeiconsIcon :icon="BubbleChatIcon" :size="36" />
          </div>
          <h2 class="text-xl font-bold tracking-tight text-foreground mb-2">{{ t('conversations.welcome_title', 'Inbox & Conversations') }}</h2>
          <p class="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {{ t('conversations.welcome_subtitle', 'Select a conversation from the left to start replying, or let AI handle it automatically.') }}
          </p>
        </div>
        <ConversationChatPanel
          v-else
          :conversation="activeConversation"
          :messages="messages"
          :status="status"
          :new-message="newMessage"
          :is-loading="isChatLoading"
          :is-sending="isSendingMessage"
          :chat-text-scale="chatTextScale"
          :is-fullscreen="isChatExpanded"
          :is-properties-visible="isPropertiesOpen"
          @update:new-message="newMessage = $event"
          @send-message="sendMessage"
          @toggle-handoff="requestHandoffToggle"
          @zoom-in="zoomIn"
          @zoom-out="zoomOut"
          @reset-zoom="resetZoom"
          @toggle-fullscreen="toggleFullscreen"
          @toggle-properties="toggleProperties"
          @back="clearSelectedConversation"
        />
      </div>

      <!-- Right Drag Handle -->
      <div
        v-if="selectedConversationId"
        v-show="isPropertiesVisible"
        class="hidden 2xl:block w-[4px] h-full cursor-col-resize transition-colors z-10 flex-shrink-0 bg-transparent hover:bg-primary/20"
        @mousedown.prevent="startDragRight"
        @dblclick.prevent="rightWidth = 300"
      />

      <!-- Right: Properties Sidebar (Desktop 2xl+) -->
      <div 
        v-if="selectedConversationId" 
        v-show="isPropertiesVisible" 
        :style="{ width: `${rightWidth}px` }" 
        class="hidden 2xl:block flex-shrink-0 h-full border-s border-border/50 transition-all duration-300"
      >
        <ConversationPropertiesSidebar
          v-if="activeConversation"
          :conversation="activeConversation"
          :is-loading="isPropsLoading"
        />
      </div>
    </div>

    <!-- Responsive Sheet Drawer for Guest Details (Mobile / Tablet < xl) -->
    <Sheet :open="showMobileProperties" @update:open="showMobileProperties = $event">
      <SheetContent side="right" class="w-[85vw] sm:w-[380px] p-0 flex flex-col h-full bg-background">
        <SheetHeader class="px-5 py-4 border-b border-border/50">
          <SheetTitle class="text-base font-bold text-foreground">
            {{ t('conversations.guest_details', 'Guest Details') }}
          </SheetTitle>
        </SheetHeader>
        <div class="flex-1 overflow-y-auto">
          <ConversationPropertiesSidebar
            v-if="activeConversation"
            :conversation="activeConversation"
            :is-loading="isPropsLoading"
          />
        </div>
      </SheetContent>
    </Sheet>

    <!-- AI Handoff Dialog -->
    <AlertDialog :open="showHandoffDialog" @update:open="showHandoffDialog = $event">
      <AlertDialogContent :to="isChatExpanded ? '#chat-container' : 'body'" class="max-w-md border-border/50">
        <!-- Taking over from AI -->
        <template v-if="pendingHandoffAction === 'handoff'">
          <AlertDialogHeader>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <HugeiconsIcon :icon="UserGroupIcon" :size="24" class="text-blue-400" />
              </div>
              <div>
                <AlertDialogTitle class="text-lg">{{ t('conversations.take_over_title', 'Take Over Conversation?') }}</AlertDialogTitle>
                <AlertDialogDescription class="text-sm mt-0.5">
                  {{ t('conversations.take_over_desc', 'Switch from AI to manual staff mode') }}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button variant="outline" class="gap-1.5" :disabled="isTogglingHandoff" @click="cancelHandoff">
              {{ t('common.cancel', 'Cancel') }}
            </Button>
            <Button
              class="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 min-w-[140px]"
              :disabled="isTogglingHandoff"
              @click="confirmHandoff"
            >
              <HugeiconsIcon v-if="!isTogglingHandoff" :icon="UserGroupIcon" :size="16" />
              {{ isTogglingHandoff ? t('common.loading', 'Loading...') : t('conversations.confirm_take_over', 'Yes, Take Over') }}
            </Button>
          </AlertDialogFooter>
        </template>

        <!-- Resuming AI -->
        <template v-else>
          <AlertDialogHeader>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <HugeiconsIcon :icon="SparklesIcon" :size="24" class="text-emerald-400" />
              </div>
              <div>
                <AlertDialogTitle class="text-lg">{{ t('conversations.resume_ai_title', 'Resume AI Bot?') }}</AlertDialogTitle>
                <AlertDialogDescription class="text-sm mt-0.5">
                  {{ t('conversations.resume_ai_desc', 'Switch back to automated AI responses') }}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button variant="outline" class="gap-1.5" :disabled="isTogglingHandoff" @click="cancelHandoff">
              {{ t('common.cancel', 'Cancel') }}
            </Button>
            <Button
              class="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 min-w-[140px]"
              :disabled="isTogglingHandoff"
              @click="confirmHandoff"
            >
              <HugeiconsIcon v-if="!isTogglingHandoff" :icon="SparklesIcon" :size="16" />
              {{ isTogglingHandoff ? t('common.loading', 'Loading...') : t('conversations.confirm_resume', 'Yes, Resume AI') }}
            </Button>
          </AlertDialogFooter>
        </template>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
