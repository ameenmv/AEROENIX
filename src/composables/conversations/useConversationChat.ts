import { ref, watch } from 'vue'
import { conversationsService } from '@/services/conversationsService'
import type { InboxMessageItem, ConversationStatusResponse } from '@/types/entities/conversation'

export function useConversationChat(conversationId: Ref<number | null>) {
  const messages = ref<InboxMessageItem[]>([])
  const status = ref<ConversationStatusResponse | null>(null)
  
  const isLoading = ref(false)
  const isSending = ref(false)
  const newMessage = ref('')

  async function loadMessages(id: number) {
    isLoading.value = true
    try {
      const [msgs, stat] = await Promise.all([
        conversationsService.getMessages(id).catch(() => []),
        conversationsService.getStatus(id).catch(() => null),
      ])
      messages.value = msgs
      status.value = stat
    } finally {
      isLoading.value = false
    }
  }

  async function sendMessage() {
    if (!conversationId.value || !newMessage.value.trim()) return

    isSending.value = true
    try {
      const sentMsg = await conversationsService.sendMessage(conversationId.value, newMessage.value)
      messages.value.push(sentMsg)
      newMessage.value = ''
    } finally {
      isSending.value = false
    }
  }

  async function toggleHandoff() {
    if (!conversationId.value || !status.value) return
    
    isSending.value = true
    try {
      if (status.value.is_ai_paused) {
        await conversationsService.resumeAi(conversationId.value)
      } else {
        await conversationsService.handoff(conversationId.value)
      }
      status.value = await conversationsService.getStatus(conversationId.value)
    } finally {
      isSending.value = false
    }
  }

  watch(conversationId, (newId) => {
    if (newId) {
      loadMessages(newId)
    } else {
      messages.value = []
      status.value = null
    }
  }, { immediate: true })

  return {
    messages,
    status,
    isLoading,
    isSending,
    newMessage,
    sendMessage,
    toggleHandoff,
    loadMessages,
  }
}
