<script setup lang="ts">
import { BubbleChatIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import type {
  ConversationStatusResponse,
  InboxConversationDetail,
  InboxMessageItem,
} from '@/types/entities/conversation'
import ConversationChatHeader from './ConversationChatHeader.vue'
import ConversationChatInput from './ConversationChatInput.vue'
import ConversationChatMessageList from './ConversationChatMessageList.vue'

defineProps<{
  conversation: InboxConversationDetail | null
  messages: InboxMessageItem[]
  status: ConversationStatusResponse | null
  newMessage: string
  isLoading: boolean
  isSending: boolean
  chatTextScale?: number
  isFullscreen?: boolean
  isPropertiesVisible?: boolean
}>()

const emit = defineEmits<{
  sendMessage: []
  'update:newMessage': [value: string]
  toggleHandoff: []
  zoomIn: []
  zoomOut: []
  resetZoom: []
  toggleFullscreen: []
  toggleProperties: []
  back: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col flex-1 min-w-0 h-full relative overflow-hidden bg-background/50">
    <!-- Empty State -->
    <div
      v-if="!conversation"
      class="flex flex-col flex-1 items-center justify-center p-8 text-center bg-card/40 backdrop-blur-md"
    >
      <div class="w-18 h-18 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 text-primary shadow-xs">
        <HugeiconsIcon :icon="BubbleChatIcon" :size="36" />
      </div>
      <h2 class="text-xl font-bold tracking-tight text-foreground mb-2">
        {{ t('conversations.welcome_title', 'Azul Conversations') }}
      </h2>
      <p class="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
        {{ t('conversations.welcome_subtitle', 'Select a conversation from the inbox to start chatting and managing leads.') }}
      </p>
    </div>

    <!-- Active Chat Panel -->
    <template v-else>
      <div class="flex flex-col flex-1 overflow-hidden min-h-0">
        <!-- Header -->
        <ConversationChatHeader
          :conversation="conversation"
          :status="status"
          :is-fullscreen="isFullscreen"
          :is-properties-visible="isPropertiesVisible"
          :chat-text-scale="chatTextScale"
          @toggle-handoff="emit('toggleHandoff')"
          @zoom-in="emit('zoomIn')"
          @zoom-out="emit('zoomOut')"
          @reset-zoom="emit('resetZoom')"
          @toggle-fullscreen="emit('toggleFullscreen')"
          @toggle-properties="emit('toggleProperties')"
          @back="emit('back')"
        />

        <!-- Loading Skeleton -->
        <div v-if="isLoading" class="flex flex-col flex-1 justify-end p-6 space-y-4">
          <div class="flex items-start gap-2 max-w-[60%]">
            <div class="w-full h-16 rounded-2xl rounded-tl-sm bg-muted/40 animate-pulse border border-border/40" />
          </div>
          <div class="flex items-end justify-end gap-2 ml-auto max-w-[55%]">
            <div class="w-full h-12 rounded-2xl rounded-tr-sm bg-primary/15 animate-pulse" />
          </div>
          <div class="flex items-start gap-2 max-w-[45%]">
            <div class="w-full h-10 rounded-2xl rounded-tl-sm bg-muted/40 animate-pulse border border-border/40" />
          </div>
          <div class="flex items-end justify-end gap-2 ml-auto max-w-[65%]">
            <div class="w-full h-14 rounded-2xl rounded-tr-sm bg-primary/15 animate-pulse" />
          </div>
        </div>

        <!-- Chat Stream & Input -->
        <template v-else>
          <ConversationChatMessageList
            :messages="messages"
            :status="status"
            :chat-text-scale="chatTextScale"
          />

          <ConversationChatInput
            :new-message="newMessage"
            :is-sending="isSending"
            :is-locked="status?.is_ai_paused === false" 
            @update:new-message="emit('update:newMessage', $event)"
            @send-message="emit('sendMessage')"
            @take-over="emit('toggleHandoff')"
          />
        </template>
      </div>
    </template>
  </div>
</template>
