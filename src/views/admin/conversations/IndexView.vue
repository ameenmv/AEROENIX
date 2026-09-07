<script setup lang="ts">
import type {
  InboxConversationDetail,
  InboxConversationItem,
  InboxMessageItem,
} from '@/types/entities/conversation'
import {
  BubbleChatIcon,
  Comment01Icon,
  FacebookIcon,
  InstagramIcon,
  MailSend01Icon,
  RefreshIcon,
  Search01Icon,
  SmartPhone01Icon,
  SparklesIcon,
  UserGroupIcon,
  UserIcon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/uic/card'
import { Input } from '@/components/uic/input'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/uic/alert-dialog'
import { conversationsService } from '@/services/conversationsService'

const { t } = useI18n()

// State
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
const newMessageText = ref<string>('')
const isAiPaused = ref<boolean>(false)

// Handoff confirmation dialog state
const showHandoffDialog = ref(false)
const pendingHandoffAction = ref<'handoff' | 'resume' | null>(null)

// Fetch Conversations List
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

// Select Conversation & Load Thread
async function selectConversation(id: number) {
  activeConversationId.value = id
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

// Send Reply Message
async function handleSendMessage() {
  if (!newMessageText.value.trim() || !activeConversationId.value || isSendingMessage.value) {
    return
  }

  const textToSend = newMessageText.value.trim()
  newMessageText.value = ''
  isSendingMessage.value = true

  try {
    const newMsg = await conversationsService.sendMessage(activeConversationId.value, textToSend)
    messages.value.push(newMsg)
    toast.success('Reply sent successfully.')
    // Refresh conversations list to update preview text
    fetchConversations()
  } catch (err: any) {
    toast.error(err?.message || 'Failed to send message.')
    newMessageText.value = textToSend
  } finally {
    isSendingMessage.value = false
  }
}

// ── AI Handoff with Confirmation Popup ───────────────────────────────────────

/** Called when user clicks the handoff toggle button — opens confirmation popup */
function requestHandoffToggle() {
  if (!activeConversationId.value || isTogglingHandoff.value) return
  pendingHandoffAction.value = isAiPaused.value ? 'resume' : 'handoff'
  showHandoffDialog.value = true
}

/** Called when user confirms the action in the popup */
async function confirmHandoff() {
  if (!activeConversationId.value || !pendingHandoffAction.value) return

  showHandoffDialog.value = false
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
    pendingHandoffAction.value = null
  }
}

/** Called when user cancels/rejects the popup */
function cancelHandoff() {
  showHandoffDialog.value = false
  pendingHandoffAction.value = null
}

// Watch filters
watch([selectedChannelFilter, searchQuery], () => {
  fetchConversations()
})

onMounted(() => {
  fetchConversations()
})

function getChannelIcon(badgeName: string) {
  const name = (badgeName || '').toLowerCase()
  if (name.includes('whatsapp')) return WhatsappIcon
  if (name.includes('instagram')) return InstagramIcon
  if (name.includes('messenger') || name.includes('facebook')) return FacebookIcon
  return BubbleChatIcon
}

function getChannelColorClass(badgeName: string) {
  const name = (badgeName || '').toLowerCase()
  if (name.includes('whatsapp')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  if (name.includes('instagram')) return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
  if (name.includes('messenger') || name.includes('facebook')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  return 'bg-primary/10 text-primary border-primary/20'
}
</script>

<template>
  <div class="p-6 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background">
    <div class="max-w-[1500px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
            <HugeiconsIcon :icon="Comment01Icon" :size="32" class="text-primary" />
            <span>{{ t('menu.conversations', 'Unified Inbox & AI Handoff') }}</span>
          </h1>
          <p class="text-muted-foreground mt-1 text-sm">
            Manage real-time customer conversations across WhatsApp, Instagram, and Messenger with AI assist.
          </p>
        </div>
        <Button variant="outline" size="sm" class="gap-2" @click="fetchConversations">
          <HugeiconsIcon :icon="RefreshIcon" :size="16" />
          <span>Refresh Inbox</span>
        </Button>
      </div>

      <!-- Main Layout Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        <!-- 1. Left Sidebar: Conversations List (4 cols) -->
        <Card class="lg:col-span-4 flex flex-col border-border/50 shadow-sm overflow-hidden h-full">
          <CardHeader class="p-4 border-b border-border/40 space-y-3 shrink-0">
            <!-- Search Input -->
            <div class="relative">
              <HugeiconsIcon
                :icon="Search01Icon"
                :size="18"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                v-model="searchQuery"
                type="text"
                placeholder="Search conversations..."
                class="pl-9 bg-muted/40 border-border/40 text-sm"
              />
            </div>

            <!-- Channel Filters -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                class="px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0"
                :class="selectedChannelFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground'"
                @click="selectedChannelFilter = 'all'"
              >
                All
              </button>
              <button
                class="px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5"
                :class="selectedChannelFilter === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground'"
                @click="selectedChannelFilter = 'whatsapp'"
              >
                <HugeiconsIcon :icon="WhatsappIcon" :size="14" />
                <span>WhatsApp</span>
              </button>
              <button
                class="px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5"
                :class="selectedChannelFilter === 'instagram'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground'"
                @click="selectedChannelFilter = 'instagram'"
              >
                <HugeiconsIcon :icon="InstagramIcon" :size="14" />
                <span>Instagram</span>
              </button>
              <button
                class="px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5"
                :class="selectedChannelFilter === 'messenger'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground'"
                @click="selectedChannelFilter = 'messenger'"
              >
                <HugeiconsIcon :icon="FacebookIcon" :size="14" />
                <span>Messenger</span>
              </button>
            </div>
          </CardHeader>

          <!-- Conversation List -->
          <div class="flex-1 overflow-y-auto divide-y divide-border/30">
            <div v-if="isLoadingConversations" class="p-8 text-center text-muted-foreground text-sm space-y-2">
              <p>Loading conversations...</p>
            </div>
            <div
              v-else-if="conversations.length === 0"
              class="p-8 text-center text-muted-foreground text-sm space-y-2"
            >
              <HugeiconsIcon :icon="Comment01Icon" :size="36" class="mx-auto text-muted-foreground/40" />
              <p>No conversations found.</p>
            </div>

            <div
              v-for="item in conversations"
              :key="item.id"
              class="p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/40 transition-colors"
              :class="activeConversationId === item.id ? 'bg-primary/5 border-l-4 border-primary' : ''"
              @click="selectConversation(item.id)"
            >
              <!-- Avatar -->
              <div class="relative shrink-0">
                <div class="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                  {{ item.avatar_initials }}
                </div>
                <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center p-0.5 border border-border">
                  <HugeiconsIcon :icon="getChannelIcon(item.channel_badge_name)" :size="12" />
                </span>
              </div>

              <!-- Content Preview -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1 mb-1">
                  <h4 class="text-sm font-semibold text-foreground truncate">
                    {{ item.contact_name }}
                  </h4>
                  <span class="text-[11px] text-muted-foreground shrink-0">
                    {{ item.time }}
                  </span>
                </div>
                <p class="text-xs text-muted-foreground truncate">
                  {{ item.text || 'No messages yet' }}
                </p>
              </div>

              <!-- Unread badge -->
              <div v-if="item.unread_count > 0" class="shrink-0">
                <span class="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {{ item.unread_count }}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <!-- 2. Center Panel: Live Chat Thread (5 cols) -->
        <Card class="lg:col-span-5 flex flex-col border-border/50 shadow-sm overflow-hidden h-full">
          <template v-if="activeConversationId">
            <!-- Header -->
            <CardHeader class="p-4 border-b border-border/40 flex flex-row items-center justify-between gap-2 shrink-0">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                  {{ activeConversation?.avatar_initials || 'G' }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-bold text-foreground truncate">
                      {{ activeConversation?.contact_name || 'Guest' }}
                    </h3>
                    <Badge
                      variant="outline"
                      class="text-[10px] uppercase font-semibold border px-2 py-0.2"
                      :class="getChannelColorClass(activeConversation?.channel_badge_name || '')"
                    >
                      {{ activeConversation?.channel_badge_name || 'Channel' }}
                    </Badge>
                  </div>
                  <p class="text-xs text-muted-foreground truncate">
                    {{ activeConversation?.phone }}
                  </p>
                </div>
              </div>

              <!-- ═══════════════════════════════════════════════════════════
                   AI Handoff Control — Prominent Banner Button
                   ═══════════════════════════════════════════════════════════ -->
              <button
                class="shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 group/handoff"
                :class="isAiPaused
                  ? 'bg-blue-500/10 border-blue-500/40 hover:border-blue-500/70 hover:bg-blue-500/15'
                  : 'bg-emerald-500/10 border-emerald-500/40 hover:border-emerald-500/70 hover:bg-emerald-500/15'"
                :disabled="isTogglingHandoff"
                @click="requestHandoffToggle"
              >
                <!-- Status Icon -->
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                  :class="isAiPaused ? 'bg-blue-500/20' : 'bg-emerald-500/20'"
                >
                  <HugeiconsIcon
                    :icon="isAiPaused ? UserGroupIcon : SparklesIcon"
                    :size="18"
                    :class="isAiPaused ? 'text-blue-400' : 'text-emerald-400'"
                  />
                </div>

                <!-- Label -->
                <div class="text-left">
                  <p
                    class="text-sm font-bold leading-tight"
                    :class="isAiPaused ? 'text-blue-400' : 'text-emerald-400'"
                  >
                    {{ isAiPaused ? 'Staff Mode' : 'AI Active' }}
                  </p>
                  <p class="text-[10px] text-muted-foreground font-medium">
                    {{ isAiPaused ? 'Click to resume AI' : 'Click to take over' }}
                  </p>
                </div>

                <!-- Pulsing dot -->
                <div class="relative ml-1">
                  <span
                    class="block w-2.5 h-2.5 rounded-full"
                    :class="isAiPaused ? 'bg-blue-400' : 'bg-emerald-400'"
                  />
                  <span
                    class="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-75"
                    :class="isAiPaused ? 'bg-blue-400' : 'bg-emerald-400'"
                  />
                </div>
              </button>
            </CardHeader>

            <!-- AI status banner — visible indicator below header -->
            <div
              class="px-4 py-2 flex items-center justify-center gap-2 text-xs font-semibold border-b transition-colors duration-300"
              :class="isAiPaused
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
            >
              <HugeiconsIcon
                :icon="isAiPaused ? UserGroupIcon : SparklesIcon"
                :size="14"
              />
              <span v-if="isAiPaused">
                🛑 AI is paused — You are replying manually as staff
              </span>
              <span v-else>
                ✨ AI is auto-replying to this conversation
              </span>
            </div>

            <!-- Chat Thread Messages -->
            <div class="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/10">
              <div v-if="isLoadingMessages" class="p-8 text-center text-muted-foreground text-sm">
                Loading chat history...
              </div>

              <div
                v-for="msg in messages"
                :key="msg.id"
                class="flex flex-col"
                :class="msg.sender_type === 'customer' ? 'items-start' : 'items-end'"
              >
                <!-- Sender Badge -->
                <span class="text-[10px] text-muted-foreground mb-1 px-1 flex items-center gap-1">
                  <span v-if="msg.sender_type === 'ai'" class="text-purple-400 font-semibold flex items-center gap-0.5">
                    <HugeiconsIcon :icon="SparklesIcon" :size="10" /> AI Assistant
                  </span>
                  <span v-else-if="msg.sender_type === 'staff'" class="text-blue-400 font-semibold flex items-center gap-0.5">
                    <HugeiconsIcon :icon="UserGroupIcon" :size="10" /> Staff Agent
                  </span>
                  <span v-else class="font-medium">
                    Customer
                  </span>
                  <span>• {{ msg.time }}</span>
                </span>

                <!-- Message Bubble -->
                <div
                  class="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs"
                  :class="[
                    msg.sender_type === 'customer'
                      ? 'bg-card text-foreground rounded-tl-xs border border-border/50'
                      : msg.sender_type === 'ai'
                        ? 'bg-purple-600/90 text-white rounded-tr-xs shadow-purple-600/20'
                        : 'bg-primary text-primary-foreground rounded-tr-xs shadow-primary/20',
                  ]"
                >
                  {{ msg.text }}
                </div>
              </div>
            </div>

            <!-- Message Composer Form -->
            <div class="p-3 border-t border-border/40 bg-background flex items-center gap-2 shrink-0">
              <Input
                v-model="newMessageText"
                type="text"
                placeholder="Type staff reply..."
                class="flex-1 bg-muted/30 border-border/40 text-sm"
                @keyup.enter="handleSendMessage"
              />
              <Button
                class="gap-1 bg-primary text-primary-foreground"
                :disabled="!newMessageText.trim() || isSendingMessage"
                @click="handleSendMessage"
              >
                <HugeiconsIcon :icon="MailSend01Icon" :size="16" />
                <span>Send</span>
              </Button>
            </div>
          </template>

          <div v-else class="p-12 text-center text-muted-foreground text-sm my-auto">
            Select a conversation from the sidebar to view chat.
          </div>
        </Card>

        <!-- 3. Right Side Panel: Customer CRM Info (3 cols) -->
        <Card class="lg:col-span-3 flex flex-col border-border/50 shadow-sm h-full overflow-y-auto">
          <CardHeader class="p-4 border-b border-border/40">
            <CardTitle class="text-base font-bold flex items-center gap-2">
              <HugeiconsIcon :icon="UserIcon" :size="18" class="text-primary" />
              <span>Customer Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="p-4 space-y-6">
            <template v-if="activeConversation">
              <!-- Guest Header -->
              <div class="text-center space-y-2 py-2">
                <div class="w-16 h-16 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xl mx-auto shadow-inner">
                  {{ activeConversation.avatar_initials }}
                </div>
                <div>
                  <h3 class="text-base font-bold text-foreground">
                    {{ activeConversation.contact_name }}
                  </h3>
                  <p class="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                    <HugeiconsIcon :icon="SmartPhone01Icon" :size="12" />
                    <span>{{ activeConversation.phone }}</span>
                  </p>
                </div>
                <Badge variant="outline" class="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs px-3 py-1 font-semibold">
                  {{ activeConversation.lead_score || '🔥 Hot Lead' }}
                </Badge>
              </div>

              <!-- AI Mode Indicator Card -->
              <div
                class="p-3 rounded-xl border-2 transition-all duration-300"
                :class="isAiPaused
                  ? 'bg-blue-500/5 border-blue-500/30'
                  : 'bg-emerald-500/5 border-emerald-500/30'"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center"
                    :class="isAiPaused ? 'bg-blue-500/15' : 'bg-emerald-500/15'"
                  >
                    <HugeiconsIcon
                      :icon="isAiPaused ? UserGroupIcon : SparklesIcon"
                      :size="20"
                      :class="isAiPaused ? 'text-blue-400' : 'text-emerald-400'"
                    />
                  </div>
                  <div class="flex-1">
                    <p
                      class="text-sm font-bold"
                      :class="isAiPaused ? 'text-blue-400' : 'text-emerald-400'"
                    >
                      {{ isAiPaused ? 'Staff Handling' : 'AI Auto-Reply' }}
                    </p>
                    <p class="text-[10px] text-muted-foreground">
                      {{ isAiPaused ? 'AI bot is paused for this conversation' : 'Bot is handling replies automatically' }}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  class="w-full mt-2.5 gap-2 text-xs font-semibold h-8"
                  :class="isAiPaused
                    ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                    : 'border-blue-500/40 text-blue-400 hover:bg-blue-500/10'"
                  :disabled="isTogglingHandoff"
                  @click="requestHandoffToggle"
                >
                  <HugeiconsIcon :icon="isAiPaused ? SparklesIcon : UserGroupIcon" :size="14" />
                  {{ isAiPaused ? 'Resume AI Bot' : 'Take Over (Staff)' }}
                </Button>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                <div class="bg-muted/30 p-3 rounded-xl border border-border/30 text-center">
                  <p class="text-[10px] text-muted-foreground uppercase font-medium">Conversations</p>
                  <p class="text-lg font-bold text-foreground mt-0.5">
                    {{ activeConversation.stats?.conversations || 1 }}
                  </p>
                </div>
                <div class="bg-muted/30 p-3 rounded-xl border border-border/30 text-center">
                  <p class="text-[10px] text-muted-foreground uppercase font-medium">Bookings</p>
                  <p class="text-lg font-bold text-foreground mt-0.5">
                    {{ activeConversation.stats?.bookings || 1 }}
                  </p>
                </div>
              </div>

              <!-- First Contact Date -->
              <div class="space-y-2 pt-2 border-t border-border/40 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">First Contact:</span>
                  <span class="font-semibold text-foreground">{{ activeConversation.stats?.first_contact || 'Aug 15' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Channel:</span>
                  <span class="font-semibold text-foreground">{{ activeConversation.channel_badge_name }}</span>
                </div>
              </div>
            </template>

            <div v-else class="text-center text-muted-foreground text-xs py-8">
              Select a conversation to load customer CRM details.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         AI Handoff Confirmation Dialog (Popup)
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
            <Button variant="outline" class="gap-1.5" @click="cancelHandoff">
              Cancel
            </Button>
            <Button
              class="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              :disabled="isTogglingHandoff"
              @click="confirmHandoff"
            >
              <HugeiconsIcon :icon="UserGroupIcon" :size="16" />
              Yes, Take Over
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
            <Button variant="outline" class="gap-1.5" @click="cancelHandoff">
              Cancel
            </Button>
            <Button
              class="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              :disabled="isTogglingHandoff"
              @click="confirmHandoff"
            >
              <HugeiconsIcon :icon="SparklesIcon" :size="16" />
              Yes, Resume AI
            </Button>
          </AlertDialogFooter>
        </template>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
