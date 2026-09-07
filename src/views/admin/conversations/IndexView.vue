<script setup lang="ts">
import type {
  InboxConversationDetail,
  InboxConversationItem,
  InboxMessageItem,
} from '@/types/entities/conversation'
import {
  SparklesIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/uic/button'
import { Card } from '@/components/uic/card'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/uic/alert-dialog'
import { conversationsService } from '@/services/conversationsService'
import { getEcho } from '@/services/echo'
import ConversationSidebar from './ConversationSidebar.vue'
import ChatThread from './ChatThread.vue'
import ContactPanel from './ContactPanel.vue'

// ── State ────────────────────────────────────────────────────────────────────
const conversations = ref<InboxConversationItem[]>([])
const activeConversationId = ref<number | null>(null)
const activeConversation = ref<InboxConversationDetail | null>(null)
const messages = ref<InboxMessageItem[]>([])

const isLoadingConversations = ref(false)
const isLoadingMessages = ref(false)
const isSendingMessage = ref(false)
const isTogglingHandoff = ref(false)

const selectedChannelFilter = ref<string>('all')
const searchQuery = ref<string>('')
const isAiPaused = ref<boolean>(false)

// Handoff confirmation dialog
const showHandoffDialog = ref(false)
const pendingHandoffAction = ref<'handoff' | 'resume' | null>(null)

// Real-time channel reference for cleanup
let realtimeChannel: any = null

// ── Data Fetching ────────────────────────────────────────────────────────────

async function fetchConversations() {
  isLoadingConversations.value = true
  try {
    const list = await conversationsService.getConversations({
      channel: selectedChannelFilter.value !== 'all' ? selectedChannelFilter.value : undefined,
      search: searchQuery.value || undefined,
    })
    conversations.value = list
    if (list && list.length > 0 && list[0]?.id && !activeConversationId.value) {
      selectConversation(list[0].id)
    }
  } catch (err: any) {
    console.error('Failed to load conversations:', err)
  } finally {
    isLoadingConversations.value = false
  }
}

async function selectConversation(id: number) {
  activeConversationId.value = id

  // Clear unread badge locally (user has opened the conversation)
  const convItem = conversations.value.find((c) => c.id === id)
  if (convItem) convItem.unread_count = 0

  isLoadingMessages.value = true
  try {
    const [detail, msgs, status] = await Promise.all([
      conversationsService.getConversation(id).catch(() => null),
      conversationsService.getMessages(id).catch(() => []),
      conversationsService.getStatus(id).catch(() => null),
    ])
    activeConversation.value = detail
    messages.value = msgs
    if (status) {
      isAiPaused.value = status.is_ai_paused || status.handoff_status === 'human'
    }
  } catch (err: any) {
    toast.error('Failed to load conversation messages.')
  } finally {
    isLoadingMessages.value = false
  }
}

async function handleSendMessage(text: string) {
  if (!text.trim() || !activeConversationId.value || isSendingMessage.value) return

  isSendingMessage.value = true
  try {
    const newMsg = await conversationsService.sendMessage(activeConversationId.value, text)
    messages.value.push(newMsg)
    toast.success('Reply sent successfully.')
    fetchConversations()
  } catch (err: any) {
    toast.error(err?.message || 'Failed to send message.')
  } finally {
    isSendingMessage.value = false
  }
}

// ── Handoff ──────────────────────────────────────────────────────────────────

function requestHandoffToggle() {
  if (!activeConversationId.value || isTogglingHandoff.value) return
  pendingHandoffAction.value = isAiPaused.value ? 'resume' : 'handoff'
  showHandoffDialog.value = true
}

async function confirmHandoff() {
  if (!activeConversationId.value || !pendingHandoffAction.value) return

  isTogglingHandoff.value = true
  try {
    if (pendingHandoffAction.value === 'handoff') {
      await conversationsService.handoff(activeConversationId.value)
      isAiPaused.value = true
      toast.info('AI paused — conversation taken over by staff.', {
        description: 'You can now send manual replies. Click "Resume AI" to re-enable the bot.',
      })
    } else {
      await conversationsService.resumeAi(activeConversationId.value)
      isAiPaused.value = false
      toast.success('AI bot auto-reply resumed.', {
        description: 'The AI assistant will handle incoming messages automatically.',
      })
    }
  } catch (err: any) {
    toast.error('Failed to update AI handoff status.')
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

function setupRealtimeListeners() {
  const echoInstance = getEcho()
  if (!echoInstance) return

  // Get hotel ID from the authenticated user
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}')
  const hotelId = authUser?.hotels?.[0]?.id

  if (!hotelId) {
    console.warn('[Realtime] No hotel ID found — skipping WebSocket subscription.')
    return
  }

  // Update Echo auth headers with current token
  echoInstance.connector.options.auth = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
      Accept: 'application/json',
    },
  }

  const channelName = `hotel.${hotelId}.inbox`
  realtimeChannel = echoInstance.private(channelName)

  // ── Event: New Message Received ──────────────────────────────────────────
  realtimeChannel.listen('.inbox.message.received', (event: any) => {
    console.log('[Realtime] 📩 inbox.message.received', event)
    const msg = event?.message
    const conv = event?.conversation

    if (!msg) return

    // If this message belongs to the active conversation, push it to the chat
    if (msg.conversation_id === activeConversationId.value) {
      // Avoid duplicates (in case we also sent it)
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

    // Update conversation list — update preview text and move to top
    if (conv) {
      const idx = conversations.value.findIndex((c) => c.id === conv.id)
      if (idx >= 0) {
        // Update existing conversation preview
        conversations.value[idx] = { ...conversations.value[idx], ...conv }
        // Move to top
        const [updated] = conversations.value.splice(idx, 1)
        conversations.value.unshift(updated!)
      } else {
        // New conversation — add to top
        conversations.value.unshift(conv)
      }
    }
  })

  // ── Event: Handoff Status Changed ────────────────────────────────────────
  realtimeChannel.listen('.conversation.handoff.updated', (event: any) => {
    console.log('[Realtime] 🔄 conversation.handoff.updated', event)
    if (!event?.conversation_id) return

    // If this is the currently active conversation, update the AI status
    if (event.conversation_id === activeConversationId.value) {
      isAiPaused.value = event.is_ai_paused || event.handoff_status === 'human'
    }
  })

  console.info(`[Realtime] Subscribed to private channel: ${channelName}`)
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
    console.info('[Realtime] Unsubscribed from inbox channel.')
  }
}

// ── Watchers ─────────────────────────────────────────────────────────────────

watch([selectedChannelFilter, searchQuery], () => {
  fetchConversations()
})

onMounted(() => {
  fetchConversations()
  setupRealtimeListeners()
})

onUnmounted(() => {
  cleanupRealtimeListeners()
})
</script>

<template>
  <div class="p-4 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background">
    <div class="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

      <!-- Main 3-Panel Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-120px)] min-h-[600px]">

        <!-- 1. Left: Conversation Sidebar (3.5 cols) -->
        <Card class="lg:col-span-4 xl:col-span-3 flex flex-col border-border/30 shadow-sm overflow-hidden h-full rounded-2xl">
          <ConversationSidebar
            :conversations="conversations"
            :active-conversation-id="activeConversationId"
            :is-loading="isLoadingConversations"
            :selected-channel-filter="selectedChannelFilter"
            :search-query="searchQuery"
            @select="selectConversation"
            @update:selected-channel-filter="selectedChannelFilter = $event"
            @update:search-query="searchQuery = $event"
          />
        </Card>

        <!-- 2. Center: Chat Thread (6 cols) -->
        <Card class="lg:col-span-5 xl:col-span-6 flex flex-col border-border/30 shadow-sm overflow-hidden h-full rounded-2xl">
          <ChatThread
            :conversation="activeConversation"
            :messages="messages"
            :is-ai-paused="isAiPaused"
            :is-loading-messages="isLoadingMessages"
            :is-sending-message="isSendingMessage"
            :is-toggling-handoff="isTogglingHandoff"
            :has-active-conversation="!!activeConversationId"
            @send-message="handleSendMessage"
            @request-handoff-toggle="requestHandoffToggle"
          />
        </Card>

        <!-- 3. Right: Contact Panel (3 cols) -->
        <Card class="lg:col-span-3 flex flex-col border-border/30 shadow-sm overflow-hidden h-full rounded-2xl">
          <ContactPanel
            :conversation="activeConversation"
            :is-ai-paused="isAiPaused"
            :is-toggling-handoff="isTogglingHandoff"
            :is-loading="isLoadingMessages"
            @request-handoff-toggle="requestHandoffToggle"
          />
        </Card>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         AI Handoff Confirmation Dialog
         ═══════════════════════════════════════════════════════════════════════ -->
    <AlertDialog :open="showHandoffDialog">
      <AlertDialogContent class="max-w-md border-border/50">
        <!-- Taking over from AI -->
        <template v-if="pendingHandoffAction === 'handoff'">
          <AlertDialogHeader>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <HugeiconsIcon :icon="UserGroupIcon" :size="24" class="text-blue-400" />
              </div>
              <div>
                <AlertDialogTitle class="text-lg">Take Over Conversation?</AlertDialogTitle>
                <AlertDialogDescription class="text-sm mt-0.5">
                  Switch from AI to manual staff mode
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div class="space-y-3 py-2">
            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
              ⚠️ The AI bot will <strong>stop replying</strong> to this conversation. You will need to respond manually as a staff agent.
            </div>
            <div class="text-xs text-muted-foreground space-y-1.5">
              <p class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400" />
                All new messages will wait for your manual reply
              </p>
              <p class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400" />
                You can resume AI at any time from the chat header
              </p>
              <p class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Chat history and context will be preserved
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <Button variant="outline" class="gap-1.5" :disabled="isTogglingHandoff" @click="cancelHandoff">
              Cancel
            </Button>
            <Button
              class="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 min-w-[140px]"
              :disabled="isTogglingHandoff"
              @click="confirmHandoff"
            >
              <svg v-if="isTogglingHandoff" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <HugeiconsIcon v-else :icon="UserGroupIcon" :size="16" />
              {{ isTogglingHandoff ? 'Taking Over...' : 'Yes, Take Over' }}
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
                <AlertDialogTitle class="text-lg">Resume AI Bot?</AlertDialogTitle>
                <AlertDialogDescription class="text-sm mt-0.5">
                  Switch back to automated AI responses
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div class="space-y-3 py-2">
            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
              ✨ The AI assistant will <strong>resume auto-replying</strong> to incoming messages in this conversation.
            </div>
            <div class="text-xs text-muted-foreground space-y-1.5">
              <p class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                AI will use hotel knowledge base for responses
              </p>
              <p class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                You can take over again at any time
              </p>
              <p class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Your staff messages will remain in the history
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <Button variant="outline" class="gap-1.5" :disabled="isTogglingHandoff" @click="cancelHandoff">
              Cancel
            </Button>
            <Button
              class="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 min-w-[140px]"
              :disabled="isTogglingHandoff"
              @click="confirmHandoff"
            >
              <svg v-if="isTogglingHandoff" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <HugeiconsIcon v-else :icon="SparklesIcon" :size="16" />
              {{ isTogglingHandoff ? 'Resuming...' : 'Yes, Resume AI' }}
            </Button>
          </AlertDialogFooter>
        </template>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
