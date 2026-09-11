<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { SparklesIcon, UserGroupIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { InboxMessageItem, ConversationStatusResponse } from '@/types/entities/conversation'

const props = defineProps<{
  messages: InboxMessageItem[]
  status: ConversationStatusResponse | null
  chatTextScale?: number
}>()

const listRef = ref<HTMLElement | null>(null)

watch(() => props.messages, () => {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight
    }
  })
}, { deep: true })
</script>

<template>
  <div ref="listRef" class="flex-1 px-4 py-4 overflow-y-auto space-y-4 scroll-smooth" :style="{ zoom: props.chatTextScale || 1 }">
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="flex flex-col"
      :class="msg.sender_type === 'customer' ? 'items-start' : 'items-end'"
    >
      <!-- Sender -->
      <span class="text-[10px] text-muted-foreground/80 mb-1.5 px-1 flex items-center gap-1">
        <span v-if="msg.sender_type === 'ai'" class="text-purple-500 dark:text-purple-400 font-semibold flex items-center gap-0.5">
          <HugeiconsIcon :icon="SparklesIcon" :size="10" /> AI Assistant
        </span>
        <span v-else-if="msg.sender_type === 'staff'" class="text-blue-500 dark:text-blue-400 font-semibold flex items-center gap-0.5">
          <HugeiconsIcon :icon="UserGroupIcon" :size="10" /> Staff Agent
        </span>
        <span v-else class="font-medium">Customer</span>
        <span>• {{ msg.time }}</span>
      </span>

      <!-- Bubble -->
      <div
        class="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm"
        :class="[
          msg.sender_type === 'customer'
            ? 'bg-card text-foreground rounded-tl-sm border border-border'
            : msg.sender_type === 'ai'
              ? 'bg-purple-600/90 text-white rounded-tr-sm shadow-purple-600/20'
              : 'bg-primary text-primary-foreground rounded-tr-sm shadow-primary/20',
        ]"
      >
        {{ msg.text }}
      </div>
    </div>
  </div>
</template>
