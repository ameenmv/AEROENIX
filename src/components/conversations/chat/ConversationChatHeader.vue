<script setup lang="ts">
import { SparklesIcon, UserGroupIcon, WhatsappIcon, InstagramIcon, FacebookIcon, BubbleChatIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ZoomIn, ZoomOut, Maximize, Minimize, PanelRight, PanelRightClose } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { InboxConversationDetail, ConversationStatusResponse } from '@/types/entities/conversation'

const props = defineProps<{
  conversation: InboxConversationDetail
  status: ConversationStatusResponse | null
  isFullscreen?: boolean
  isPropertiesVisible?: boolean
  chatTextScale?: number
}>()

const emit = defineEmits<{
  toggleHandoff: []
  zoomIn: []
  zoomOut: []
  resetZoom: []
  toggleFullscreen: []
  toggleProperties: []
}>()

const { t } = useI18n()

function getProviderIcon(channelBadgeName: string | null | undefined) {
  const name = (channelBadgeName || '').toLowerCase()
  if (name.includes('whatsapp')) return WhatsappIcon
  if (name.includes('instagram')) return InstagramIcon
  if (name.includes('facebook') || name.includes('messenger')) return FacebookIcon
  return BubbleChatIcon
}

function getProviderColorClass(channelBadgeName: string | null | undefined) {
  const name = (channelBadgeName || '').toLowerCase()
  if (name.includes('whatsapp')) return 'bg-emerald-500 text-white'
  if (name.includes('instagram')) return 'bg-pink-500 text-white'
  if (name.includes('facebook') || name.includes('messenger')) return 'bg-blue-500 text-white'
  return 'bg-primary text-primary-foreground'
}
</script>

<template>
  <div class="flex flex-col bg-background/95 backdrop-blur-md border-b border-border/50 shrink-0 rounded-t-2xl">
    <div class="px-4 py-2.5 flex items-center justify-between gap-4">
      
      <!-- ── Left: Contact Info ─────────────────────────────────────── -->
      <div class="flex items-center gap-3 min-w-0">
        <!-- Avatar with status indicator dot -->
        <div class="relative w-11 h-11 rounded-full bg-muted/60 flex items-center justify-center overflow-hidden border border-border/50 flex-shrink-0">
          <span class="text-sm font-bold text-foreground">{{ conversation.avatar_initials || '?' }}</span>
          <div class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
        </div>

        <div class="flex flex-col min-w-0 justify-center">
          <h3 class="text-[15px] font-bold text-foreground truncate leading-none mb-1.5">
            {{ conversation.contact_name || t('conversations.unknown_contact', 'Unknown') }}
          </h3>
          <div class="flex items-center gap-2">
            <!-- Dynamic Status Badge (In Progress) -->
            <div class="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500 flex-shrink-0">
              In Progress
            </div>
            <!-- Provider Icon -->
            <div class="w-4 h-4 rounded-full flex items-center justify-center p-[2px] flex-shrink-0" :class="getProviderColorClass(conversation.channel_badge_name)">
              <HugeiconsIcon :icon="getProviderIcon(conversation.channel_badge_name)" :size="10" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Right: Controls ────────────────────────────────────────── -->
      <div class="flex items-center gap-3">
        
        <!-- Zoom Controls -->
        <div class="hidden sm:flex items-center border border-border/60 rounded-full overflow-hidden bg-background/50 h-9">
          <button
            class="w-9 h-full flex items-center justify-center hover:bg-muted/50 transition-colors disabled:opacity-50"
            :disabled="(chatTextScale || 1) <= 0.7"
            @click="emit('zoomOut')"
          >
            <ZoomOut class="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
          <div
            class="px-2 h-full flex items-center justify-center border-x border-border/60 text-[11px] font-bold text-foreground cursor-pointer hover:bg-muted/50 transition-colors min-w-[36px]"
            @click="emit('resetZoom')"
          >
            {{ chatTextScale === 1 ? '1x' : Math.round((chatTextScale || 1) * 100) + '%' }}
          </div>
          <button
            class="w-9 h-full flex items-center justify-center hover:bg-muted/50 transition-colors disabled:opacity-50"
            :disabled="(chatTextScale || 1) >= 1.5"
            @click="emit('zoomIn')"
          >
            <ZoomIn class="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <div class="h-5 w-px bg-border/60 hidden sm:block" />

        <!-- AI Handoff Button (Aeroenix Specific) -->
        <button
          v-if="status"
          class="shrink-0 flex items-center justify-center w-9 h-9 sm:w-auto sm:px-3 rounded-full border transition-all duration-300"
          :class="status.is_ai_paused
            ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
            : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'"
          @click="emit('toggleHandoff')"
        >
          <HugeiconsIcon
            :icon="status.is_ai_paused ? UserGroupIcon : SparklesIcon"
            :size="16"
            :class="status.is_ai_paused ? 'text-blue-500' : 'text-emerald-500'"
          />
          <span class="hidden sm:inline-block text-[12px] font-bold ml-1.5" :class="status.is_ai_paused ? 'text-blue-500' : 'text-emerald-500'">
            {{ status.is_ai_paused ? t('conversations.staff_mode', 'Staff Mode') : t('conversations.ai_active', 'AI Active') }}
          </span>
        </button>

        <div class="h-5 w-px bg-border/60" />

        <!-- Layout Toggles -->
        <div class="flex items-center gap-1">
          <button
            class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            @click="emit('toggleFullscreen')"
          >
            <Minimize v-if="isFullscreen" class="w-4 h-4" />
            <Maximize v-else class="w-4 h-4" />
          </button>
          
          <button
            class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            @click="emit('toggleProperties')"
          >
            <PanelRightClose v-if="isPropertiesVisible" class="w-4 h-4" />
            <PanelRight v-else class="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>

    <!-- AI Status Strip (Visible if needed) -->
    <div
      v-if="status"
      class="px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold border-t transition-colors duration-300"
      :class="status.is_ai_paused
        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'"
    >
      <HugeiconsIcon :icon="status.is_ai_paused ? UserGroupIcon : SparklesIcon" :size="14" />
      <span v-if="status.is_ai_paused">{{ t('conversations.staff_paused_msg', 'AI is paused. You are replying manually.') }}</span>
      <span v-else>{{ t('conversations.ai_active_msg', 'AI is handling this conversation.') }}</span>
    </div>
  </div>
</template>
