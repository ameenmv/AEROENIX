<script setup lang="ts">
import { SparklesIcon, UserGroupIcon, WhatsappIcon, InstagramIcon, FacebookIcon, BubbleChatIcon, ArrowLeft01Icon } from '@hugeicons/core-free-icons'
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
  back: []
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
    <div class="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
      
      <!-- ── Left: Contact Info ─────────────────────────────────────── -->
      <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <!-- Back Button (Mobile Only) -->
        <button 
          class="lg:hidden w-9 h-9 -ml-1 rounded-full flex shrink-0 items-center justify-center hover:bg-muted/50 transition-colors text-foreground"
          @click="emit('back')"
          :title="t('common.back', 'Back')"
        >
          <HugeiconsIcon :icon="ArrowLeft01Icon" :size="18" class="rtl:rotate-180" />
        </button>

        <!-- Avatar with status indicator dot -->
        <div class="relative w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center overflow-hidden border border-border/50 shrink-0">
          <span class="text-xs sm:text-sm font-bold text-foreground">{{ conversation.avatar_initials || '?' }}</span>
          <div class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
        </div>

        <div class="flex flex-col min-w-0 justify-center flex-1">
          <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h3 class="text-[13px] sm:text-[15px] font-bold text-foreground truncate leading-tight">
              {{ conversation.contact_name || t('conversations.unknown_contact', 'Unknown') }}
            </h3>
            <!-- Channel pill badge -->
            <span
              v-if="conversation.channel_badge_name"
              class="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/50 shrink-0"
            >
              {{ conversation.channel_badge_name }}
            </span>
          </div>
          <div class="flex items-center gap-1.5 mt-0.5">
            <!-- Dynamic Status Badge (In Progress) -->
            <div class="px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] sm:text-[10px] font-bold text-amber-500 shrink-0 leading-tight">
              {{ t('conversations.in_progress', 'In Progress') }}
            </div>
            <!-- Provider Icon -->
            <div class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center p-[2px] shrink-0" :class="getProviderColorClass(conversation.channel_badge_name)">
              <HugeiconsIcon :icon="getProviderIcon(conversation.channel_badge_name)" :size="9" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Right: Controls ────────────────────────────────────────── -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        
        <!-- Zoom Controls: Only visible on 2xl where there's abundant width -->
        <div class="hidden 2xl:flex items-center border border-border/60 rounded-full overflow-hidden bg-background/50 h-8">
          <button
            class="w-8 h-full flex items-center justify-center hover:bg-muted/50 transition-colors disabled:opacity-50"
            :disabled="(chatTextScale || 1) <= 0.7"
            @click="emit('zoomOut')"
            title="Zoom Out"
          >
            <ZoomOut class="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
          <div
            class="px-2 h-full flex items-center justify-center border-x border-border/60 text-[10px] font-bold text-foreground cursor-pointer hover:bg-muted/50 transition-colors min-w-[32px]"
            @click="emit('resetZoom')"
            title="Reset Zoom"
          >
            {{ chatTextScale === 1 ? '1x' : Math.round((chatTextScale || 1) * 100) + '%' }}
          </div>
          <button
            class="w-8 h-full flex items-center justify-center hover:bg-muted/50 transition-colors disabled:opacity-50"
            :disabled="(chatTextScale || 1) >= 1.5"
            @click="emit('zoomIn')"
            title="Zoom In"
          >
            <ZoomIn class="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <div class="h-4 w-px bg-border/60 hidden 2xl:block" />

        <!-- AI Handoff Button -->
        <button
          v-if="status"
          class="shrink-0 flex items-center justify-center h-8 sm:h-9 px-2 sm:px-3 rounded-full border transition-all duration-300"
          :class="status.is_ai_paused
            ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
            : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'"
          @click="emit('toggleHandoff')"
          :title="status.is_ai_paused ? t('conversations.staff_mode', 'Staff Mode') : t('conversations.ai_active', 'AI Active')"
        >
          <HugeiconsIcon
            :icon="status.is_ai_paused ? UserGroupIcon : SparklesIcon"
            :size="15"
            :class="status.is_ai_paused ? 'text-blue-500' : 'text-emerald-500'"
          />
          <span class="hidden lg:inline-block text-[11px] sm:text-[12px] font-bold ml-1.5" :class="status.is_ai_paused ? 'text-blue-500' : 'text-emerald-500'">
            {{ status.is_ai_paused ? t('conversations.staff_mode', 'Staff Mode') : t('conversations.ai_active', 'AI Active') }}
          </span>
        </button>

        <div class="h-4 w-px bg-border/60" />

        <!-- Layout Toggles -->
        <div class="flex items-center gap-0.5 sm:gap-1">
          <button
            class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            @click="emit('toggleFullscreen')"
            :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
          >
            <Minimize v-if="isFullscreen" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <Maximize v-else class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          
          <button
            class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            @click="emit('toggleProperties')"
            :title="isPropertiesVisible ? 'Hide Guest Details' : 'Show Guest Details'"
          >
            <PanelRightClose v-if="isPropertiesVisible" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <PanelRight v-else class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

      </div>
    </div>

    <!-- AI Status Strip (Visible if needed) -->
    <div
      v-if="status"
      class="px-3 sm:px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold border-t transition-colors duration-300 text-center"
      :class="status.is_ai_paused
        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'"
    >
      <HugeiconsIcon :icon="status.is_ai_paused ? UserGroupIcon : SparklesIcon" :size="14" class="shrink-0" />
      <span class="truncate" v-if="status.is_ai_paused">{{ t('conversations.staff_paused_msg', 'AI is paused. You are replying manually.') }}</span>
      <span class="truncate" v-else>{{ t('conversations.ai_active_msg', 'AI is handling this conversation.') }}</span>
    </div>
  </div>
</template>
