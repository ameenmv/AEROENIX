import { ref, watch } from 'vue'
import { conversationsService } from '@/services/conversationsService'
import type { InboxConversationDetail } from '@/types/entities/conversation'

export function useConversationProperties(conversationId: Ref<number | null>) {
  const details = ref<InboxConversationDetail | null>(null)
  const isLoading = ref(false)

  async function loadDetails(id: number) {
    isLoading.value = true
    try {
      details.value = await conversationsService.getConversation(id).catch(() => null)
    } finally {
      isLoading.value = false
    }
  }

  watch(conversationId, (newId) => {
    if (newId) {
      loadDetails(newId)
    } else {
      details.value = null
    }
  }, { immediate: true })

  return {
    details,
    isLoading,
    loadDetails,
  }
}
