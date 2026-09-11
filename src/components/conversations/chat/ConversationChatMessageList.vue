<script setup lang="ts">
import { SparklesIcon, UserGroupIcon, Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { CheckCheck } from 'lucide-vue-next'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ArrowDown } from 'lucide-vue-next'
import type { InboxMessageItem, ConversationStatusResponse } from '@/types/entities/conversation'

const props = defineProps<{
  messages: InboxMessageItem[]
  status: ConversationStatusResponse | null
  chatTextScale?: number
}>()

const listRef = ref<HTMLElement | null>(null)
const showScrollFab = ref(false)

// ── Date Grouping ────────────────────────────────────────────────────────────
function extractDateLabel(dateStr?: string | null): string {
  if (!dateStr) return 'Today'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return 'Today'

  const today = new Date()
  if (date.toDateString() === today.toDateString()) return 'Today'
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
  // Show FAB if user scrolled up more than 150px
  showScrollFab.value = distanceToBottom > 150
}

watch(() => props.messages, (_, oldVal) => {
  nextTick(() => {
    if (!listRef.value) return
    // If we were already at the bottom (or it's initial load), auto-scroll
    const { scrollTop, scrollHeight, clientHeight } = listRef.value
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    
    // Auto-scroll if close to bottom OR if it's the first load (oldVal empty)
    if (distanceToBottom < 200 || !oldVal || oldVal.length === 0) {
      scrollToBottom('smooth')
    }
  })
}, { deep: true })

onMounted(() => {
  if (listRef.value) {
    listRef.value.addEventListener('scroll', handleScroll)
    // Initial scroll
    setTimeout(() => scrollToBottom('auto'), 100)
  }
})

onUnmounted(() => {
  if (listRef.value) {
    listRef.value.removeEventListener('scroll', handleScroll)
  }
})

// ── Hover Actions ────────────────────────────────────────────────────────────
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(err => console.error('Copy failed', err))
}
</script>

<template>
  <div class="relative flex-1 min-h-0 flex flex-col h-full" :style="{ zoom: props.chatTextScale || 1 }">
    <div 
      ref="listRef" 
      class="flex-1 px-4 py-4 overflow-y-auto space-y-6 scroll-smooth"
    >
      <template v-for="(group, groupIdx) in groupedMessages" :key="'group-' + groupIdx">
        
        <!-- Date Separator -->
        <div class="flex justify-center my-4 sticky top-2 z-10">
          <div class="px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 text-[11px] font-bold text-muted-foreground shadow-sm">
            {{ group.dateLabel }}
          </div>
        </div>

        <div
          v-for="msg in group.messages"
          :key="msg.id"
          class="flex flex-col group relative"
          :class="msg.sender_type === 'customer' ? 'items-start' : 'items-end'"
        >
          <!-- Sender Info & Time -->
          <span class="text-[11px] text-muted-foreground mb-1.5 px-1 flex items-center gap-1.5 font-medium">
            <span v-if="msg.sender_type === 'ai'" class="text-purple-500 dark:text-purple-400 font-bold flex items-center gap-1">
              <HugeiconsIcon :icon="SparklesIcon" :size="12" /> AI Assistant
            </span>
            <span v-else-if="msg.sender_type === 'staff'" class="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
              <HugeiconsIcon :icon="UserGroupIcon" :size="12" /> Staff Agent
            </span>
            <span v-else class="font-bold text-foreground/80">Customer</span>
            <span class="opacity-80">• {{ msg.time }}</span>

            <!-- Status Ticks (for Outbound) -->
            <span v-if="msg.sender_type !== 'customer'" class="flex items-center ml-0.5">
              <CheckCheck 
                v-if="msg.status === 'read' || msg.status === 'delivered'" 
                class="w-[16px] h-[16px]" 
                :class="msg.status === 'read' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'" 
              />
              <HugeiconsIcon 
                v-else-if="msg.status === 'sent'" 
                :icon="Tick02Icon" 
                :size="16" 
                class="text-slate-500 dark:text-slate-400" 
              />
              <HugeiconsIcon 
                v-else 
                :icon="Tick02Icon" 
                :size="16" 
                class="text-slate-400/60 dark:text-slate-500/60" 
              />
            </span>
          </span>

          <!-- Bubble Container -->
          <div class="flex items-center gap-2 max-w-full" :class="msg.sender_type === 'customer' ? 'flex-row' : 'flex-row-reverse'">
            
            <!-- Message Bubble -->
            <div
              class="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm relative whitespace-pre-wrap break-words"
              :class="[
                msg.sender_type === 'customer'
                  ? 'bg-card text-foreground rounded-tl-sm border border-border/50'
                  : msg.sender_type === 'ai'
                    ? 'bg-purple-600/90 text-white rounded-tr-sm shadow-purple-600/20'
                    : 'bg-primary text-primary-foreground rounded-tr-sm shadow-primary/20',
              ]"
            >
              {{ msg.text }}
            </div>

            <!-- Hover Action: Copy -->
            <button 
              class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground shrink-0"
              @click="copyToClipboard(msg.text)"
              title="Copy message"
            >
              <HugeiconsIcon :icon="Copy01Icon" :size="16" />
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
        class="absolute bottom-4 right-4 w-10 h-10 bg-background/90 backdrop-blur-sm border border-border/50 rounded-full shadow-lg flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground z-20"
        @click="scrollToBottom('smooth')"
      >
        <ArrowDown class="w-5 h-5" />
      </button>
    </transition>
  </div>
</template>
