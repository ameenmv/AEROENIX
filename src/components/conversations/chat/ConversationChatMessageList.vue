<script setup lang="ts">
import {
  Copy01Icon,
  SparklesIcon,
  Tick02Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { CheckCheck } from 'lucide-vue-next'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ArrowDown } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ConversationStatusResponse, InboxMessageItem } from '@/types/entities/conversation'

const props = defineProps<{
  messages: InboxMessageItem[]
  status: ConversationStatusResponse | null
  chatTextScale?: number
}>()

const { t, locale } = useI18n()
const listRef = ref<HTMLElement | null>(null)
const showScrollFab = ref(false)

// ── Date Grouping ────────────────────────────────────────────────────────────
function extractDateLabel(dateStr?: string | null): string {
  if (!dateStr) return t('conversations.today', 'Today')
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return t('conversations.today', 'Today')

  const today = new Date()
  if (date.toDateString() === today.toDateString()) return t('conversations.today', 'Today')
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return t('conversations.yesterday', 'Yesterday')

  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })
}

const groupedMessages = computed(() => {
  const groups: { dateLabel: string, messages: InboxMessageItem[] }[] = []
  
  props.messages.forEach((msg) => {
    const label = extractDateLabel(msg.created_at)
    let lastGroup = groups[groups.length - 1]
    if (!lastGroup || lastGroup.dateLabel !== label) {
      lastGroup = { dateLabel: label, messages: [] }
      groups.push(lastGroup)
    }
    lastGroup.messages.push(msg)
  })
  
  return groups
})

// ── Auto-Scroll & FAB Logic ──────────────────────────────────────────────────
function scrollToBottom(behavior: ScrollBehavior = 'auto') {
  if (listRef.value) {
    listRef.value.scrollTo({
      top: listRef.value.scrollHeight,
      behavior,
    })
    showScrollFab.value = false
  }
}

function handleScroll() {
  if (!listRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = listRef.value
  const distanceToBottom = scrollHeight - scrollTop - clientHeight
  showScrollFab.value = distanceToBottom > 150
}

watch(() => props.messages, (_, oldVal) => {
  nextTick(() => {
    if (!listRef.value) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.value
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    
    if (distanceToBottom < 200 || !oldVal || oldVal.length === 0) {
      scrollToBottom('smooth')
    }
  })
}, { deep: true })

onMounted(() => {
  if (listRef.value) {
    listRef.value.addEventListener('scroll', handleScroll)
    setTimeout(() => scrollToBottom('auto'), 100)
  }
})

onUnmounted(() => {
  if (listRef.value) {
    listRef.value.removeEventListener('scroll', handleScroll)
  }
})

// ── Copy Message ─────────────────────────────────────────────────────────────
const copiedMsgId = ref<number | null>(null)
function copyToClipboard(id: number, text: string) {
  navigator.clipboard.writeText(text).then(() => {
    copiedMsgId.value = id
    setTimeout(() => {
      if (copiedMsgId.value === id) {
        copiedMsgId.value = null
      }
    }, 1500)
  }).catch(err => console.error('Copy failed', err))
}
</script>

<template>
  <div class="relative flex-1 min-h-0 flex flex-col h-full" :style="{ zoom: props.chatTextScale || 1 }">
    <div 
      ref="listRef" 
      class="flex-1 px-4 sm:px-6 py-6 overflow-y-auto space-y-6 scroll-smooth"
    >
      <template v-for="(group, groupIdx) in groupedMessages" :key="'group-' + groupIdx">
        
        <!-- Date Separator Floating Badge -->
        <div class="flex justify-center my-4 sticky top-2 z-10">
          <div class="px-3.5 py-1 rounded-full bg-card/85 backdrop-blur-md border border-border/50 text-[11px] font-bold text-muted-foreground shadow-xs">
            {{ group.dateLabel }}
          </div>
        </div>

        <div
          v-for="msg in group.messages"
          :key="msg.id"
          class="flex flex-col group relative msg-enter-anim"
          :class="msg.sender_type === 'customer' ? 'items-start' : 'items-end'"
        >
          <!-- Sender Info Header -->
          <span class="text-[11px] text-muted-foreground mb-1.5 px-1.5 flex items-center gap-1.5 font-medium">
            <span v-if="msg.sender_type === 'ai'" class="text-purple-400 font-bold flex items-center gap-1">
              <HugeiconsIcon :icon="SparklesIcon" :size="12" /> {{ t('conversations.ai_assistant', 'AI Assistant') }}
            </span>
            <span v-else-if="msg.sender_type === 'staff'" class="text-primary font-bold flex items-center gap-1">
              <HugeiconsIcon :icon="UserGroupIcon" :size="12" /> {{ t('conversations.staff_agent', 'Staff Agent') }}
            </span>
            <span v-else class="font-bold text-foreground/80">{{ t('conversations.customer', 'Customer') }}</span>
            <span class="opacity-70 font-mono">• {{ msg.time }}</span>

            <!-- Outbound Delivery Ticks -->
            <span v-if="msg.sender_type !== 'customer'" class="flex items-center ml-0.5">
              <CheckCheck 
                v-if="msg.status === 'read' || msg.status === 'delivered'" 
                class="w-3.5 h-3.5" 
                :class="msg.status === 'read' ? 'text-primary' : 'text-muted-foreground/60'" 
              />
              <HugeiconsIcon 
                v-else 
                :icon="Tick02Icon" 
                :size="14" 
                class="text-muted-foreground/60" 
              />
            </span>
          </span>

          <!-- Bubble Container -->
          <div class="flex items-center gap-2 max-w-full" :class="msg.sender_type === 'customer' ? 'flex-row' : 'flex-row-reverse'">
            
            <!-- Message Bubble -->
            <div
              class="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm relative whitespace-pre-wrap break-words border"
              :class="[
                msg.sender_type === 'customer'
                  ? 'bg-card/90 text-foreground rounded-tl-sm border-border/50 shadow-xs'
                  : msg.sender_type === 'ai'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm border-purple-500/30 shadow-xs'
                    : 'bg-primary text-primary-foreground rounded-tr-sm border-primary/40 shadow-xs shadow-primary/20',
              ]"
            >
              {{ msg.text }}
            </div>

            <!-- Hover Action: Copy -->
            <button 
              class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer border border-transparent hover:border-border/40"
              :class="{ '!opacity-100 text-emerald-400': copiedMsgId === msg.id }"
              @click="copyToClipboard(msg.id, msg.text)"
              :title="copiedMsgId === msg.id ? t('conversations.copied', 'Copied') : t('conversations.copy_message', 'Copy message')"
            >
              <HugeiconsIcon :icon="copiedMsgId === msg.id ? Tick02Icon : Copy01Icon" :size="15" />
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Scroll to bottom FAB -->
    <transition
      enter-active-class="transition ease-out duration-200 transform"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-150 transform"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <button
        v-if="showScrollFab"
        class="absolute bottom-4 right-4 w-9 h-9 bg-card/90 backdrop-blur-md border border-border/50 rounded-full shadow-lg flex items-center justify-center text-foreground hover:bg-muted transition-all z-20 cursor-pointer"
        @click="scrollToBottom('smooth')"
      >
        <ArrowDown class="w-4 h-4" />
      </button>
    </transition>
  </div>
</template>

<style scoped>
@keyframes msgEnter {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.msg-enter-anim {
  animation: msgEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
