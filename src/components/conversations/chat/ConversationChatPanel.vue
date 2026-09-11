<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { InboxMessageItem, ConversationStatusResponse, InboxConversationDetail } from '@/types/entities/conversation'
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
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col flex-1 min-w-0 h-full rounded-2xl overflow-hidden relative border border-border/50">
    <!-- Empty state -->
    <div v-if="!conversation" class="flex flex-col flex-1 overflow-hidden p-4 bg-white/50 dark:bg-card/60 border-[0.77px] border-white dark:border-border/20 backdrop-blur-[9px] items-center justify-center text-center">
      <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <MessageSquare class="w-10 h-10 text-primary" />
      </div>
      <h2 class="text-2xl font-light text-foreground mb-3">
        {{ t('conversations.welcome_title', 'Aeroenix Conversations') }}
      </h2>
      <p class="text-[14px] text-muted-foreground max-w-[400px]">
        {{ t('conversations.welcome_subtitle', 'Select a conversation from the inbox to start chatting and managing leads.') }}
      </p>
    </div>

    <template v-else>
      <!-- Chat background (similar to reference) -->
      <div class="absolute inset-0 bg-muted/20 dark:bg-background pointer-events-none" />

      <div class="relative z-10 flex flex-col flex-1 gap-2 overflow-hidden min-h-0 bg-card/40 backdrop-blur-[2px]">
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
        />

        <!-- Loading skeleton -->
        <div v-if="isLoading" class="flex flex-col flex-1 overflow-hidden gap-2">
          <div class="flex flex-col flex-1 gap-4 px-4 py-4 overflow-hidden justify-end">
            
            <!-- Contact bubble (left) -->
            <div class="flex flex-col items-start gap-1">
              <div class="w-[70%] sm:w-[60%] rounded-[18px] rounded-tl-sm p-3 bg-card border border-border/50 shadow-sm animate-pulse">
                <div class="h-3 w-full rounded-full bg-muted/60 mb-2" />
                <div class="h-3 w-[80%] rounded-full bg-muted/60 mb-2" />
                <div class="h-3 w-[40%] rounded-full bg-muted/60" />
              </div>
            </div>

            <!-- Agent bubble (right) -->
            <div class="flex flex-col items-end gap-1">
              <div class="w-[60%] sm:w-[50%] rounded-[18px] rounded-tr-sm p-3 bg-primary/15 shadow-sm animate-pulse">
                <div class="h-3 w-full rounded-full bg-primary/20 mb-2" />
                <div class="h-3 w-[60%] rounded-full bg-primary/20" />
              </div>
            </div>

            <!-- Contact bubble (left) -->
            <div class="flex flex-col items-start gap-1">
              <div class="w-[50%] sm:w-[40%] rounded-[18px] rounded-tl-sm p-3 bg-card border border-border/50 shadow-sm animate-pulse">
                <div class="h-3 w-full rounded-full bg-muted/60" />
              </div>
            </div>

            <!-- Agent bubble (right) -->
            <div class="flex flex-col items-end gap-1">
              <div class="w-[75%] sm:w-[65%] rounded-[18px] rounded-tr-sm p-3 bg-primary/15 shadow-sm animate-pulse">
                <div class="h-3 w-full rounded-full bg-primary/20 mb-2" />
                <div class="h-3 w-full rounded-full bg-primary/20 mb-2" />
                <div class="h-3 w-[70%] rounded-full bg-primary/20" />
              </div>
            </div>
            
          </div>
        </div>

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
          />
        </template>
      </div>
    </template>
  </div>
</template>
