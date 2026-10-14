<script setup lang="ts">
import {
  ArrowLeft01Icon,
  BubbleChatIcon,
  FacebookIcon,
  InstagramIcon,
  SparklesIcon,
  UserGroupIcon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Maximize, Minimize, PanelRight, PanelRightClose, ZoomIn, ZoomOut } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { ConversationStatusResponse, InboxConversationDetail } from '@/types/entities/conversation'

defineProps<{
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
  if (name.includes('instagram')) return 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-500 text-white'
  if (name.includes('facebook') || name.includes('messenger')) return 'bg-blue-600 text-white'
  return 'bg-primary text-primary-foreground'
}
</script>

<template>
  <div class="flex flex-col bg-card/80 backdrop-blur-xl border-b border-border/50 shrink-0">
    <div class="px-4 py-3 flex items-center justify-between gap-3 min-w-0">
      
      <!-- ── Left: Contact Info ─────────────────────────────────────── -->
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <!-- Back Button (Mobile Only) -->
        <button 
          class="lg:hidden w-8 h-8 rounded-xl flex shrink-0 items-center justify-center hover:bg-muted/50 transition-colors text-foreground border border-border/50"
          @click="emit('back')"
          :title="t('common.back', 'Back')"
        >
          <HugeiconsIcon :icon="ArrowLeft01Icon" :size="18" class="rtl:rotate-180" />
        </button>

        <!-- Monogram Avatar with Online Pulse -->
        <div class="relative shrink-0">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/30 flex items-center justify-center font-bold text-xs sm:text-sm text-primary shadow-xs">
            {{ conversation.avatar_initials || '?' }}
          </div>
          <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-card flex items-center justify-center">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </span>
        </div>

        <div class="flex flex-col min-w-0 justify-center">
          <div class="flex items-center gap-2 min-w-0">
            <h3 class="text-sm sm:text-base font-bold text-foreground truncate leading-tight">
              {{ conversation.contact_name || t('conversations.unknown_contact', 'Unknown') }}
            </h3>
            <!-- Channel pill badge -->
            <span
              v-if="conversation.channel_badge_name"
              class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-muted/60 text-muted-foreground border border-border/40 shrink-0"
            >
              <HugeiconsIcon :icon="getProviderIcon(conversation.channel_badge_name)" :size="11" />
              {{ conversation.channel_badge_name }}
            </span>
          </div>

          <div class="flex items-center gap-2 mt-1">
            <!-- Dynamic Status Badge (In Progress) -->
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] font-semibold text-amber-500 shrink-0">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {{ t('conversations.in_progress', 'In Progress') }}
            </span>
            <!-- Provider Icon -->
            <div
              class="w-4 h-4 rounded-full flex items-center justify-center p-[2px] shrink-0"
              :class="getProviderColorClass(conversation.channel_badge_name)"
            >
              <HugeiconsIcon :icon="getProviderIcon(conversation.channel_badge_name)" :size="9" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Right: Controls ────────────────────────────────────────── -->
      <div class="flex items-center gap-2 shrink-0">
        
        <!-- Zoom Controls: Available on desktop -->
        <div class="hidden xl:flex items-center border border-border/60 rounded-xl overflow-hidden bg-muted/20 h-8">
          <button
            class="w-7 h-full flex items-center justify-center hover:bg-muted/50 transition-colors disabled:opacity-40"
            :disabled="(chatTextScale || 1) <= 0.7"
            @click="emit('zoomOut')"
            title="Zoom Out"
          >
            <ZoomOut class="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
          <div
            class="px-2 h-full flex items-center justify-center border-x border-border/50 text-[11px] font-mono font-bold text-foreground cursor-pointer hover:bg-muted/50 transition-colors min-w-[32px]"
            @click="emit('resetZoom')"
            title="Reset Zoom"
          >
            {{ chatTextScale === 1 ? '1x' : Math.round((chatTextScale || 1) * 100) + '%' }}
          </div>
          <button
            class="w-7 h-full flex items-center justify-center hover:bg-muted/50 transition-colors disabled:opacity-40"
            :disabled="(chatTextScale || 1) >= 1.5"
            @click="emit('zoomIn')"
            title="Zoom In"
          >
            <ZoomIn class="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <div class="h-4 w-px bg-border/60 hidden xl:block" />

        <!-- AI Handoff Toggle Button -->
        <button
          v-if="status"
          class="shrink-0 flex items-center justify-center h-8 sm:h-9 px-3 rounded-xl border transition-all duration-300 shadow-xs cursor-pointer"
          :class="status.is_ai_paused
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 shadow-blue-500/10'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-emerald-500/10'"
          @click="emit('toggleHandoff')"
          :title="status.is_ai_paused ? t('conversations.resume_ai_tooltip', 'Click to resume AI') : t('conversations.take_over_tooltip', 'Click to take over')"
        >
          <span
            class="w-2 h-2 rounded-full mr-2"
            :class="status.is_ai_paused ? 'bg-blue-400' : 'bg-emerald-400 animate-pulse'"
          />
          <HugeiconsIcon
            :icon="status.is_ai_paused ? UserGroupIcon : SparklesIcon"
            :size="14"
            class="mr-1.5"
          />
          <span class="text-xs font-bold">
            {{ status.is_ai_paused ? t('conversations.staff_mode', 'Staff Mode') : t('conversations.ai_active', 'AI Active') }}
          </span>
        </button>

        <div class="h-4 w-px bg-border/60" />

        <!-- Layout Controls -->
        <div class="flex items-center gap-1">
          <button
            class="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground border border-border/40"
            @click="emit('toggleFullscreen')"
            :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
          >
            <Minimize v-if="isFullscreen" class="w-3.5 h-3.5" />
            <Maximize v-else class="w-3.5 h-3.5" />
          </button>
          
          <button
            class="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground border border-border/40"
            @click="emit('toggleProperties')"
            :title="isPropertiesVisible ? 'Hide Guest Details' : 'Show Guest Details'"
          >
            <PanelRightClose v-if="isPropertiesVisible" class="w-3.5 h-3.5" />
            <PanelRight v-else class="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>

    <!-- AI Status Strip -->
    <div
      v-if="status"
      class="px-4 py-1.5 flex items-center justify-between gap-2 text-xs font-semibold border-t transition-colors duration-300"
      :class="status.is_ai_paused
        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
    >
      <div class="flex items-center gap-2 truncate">
        <HugeiconsIcon :icon="status.is_ai_paused ? UserGroupIcon : SparklesIcon" :size="14" class="shrink-0" />
        <span class="truncate" v-if="status.is_ai_paused">{{ t('conversations.staff_paused_msg', 'AI is paused. You are replying manually.') }}</span>
        <span class="truncate" v-else>{{ t('conversations.ai_active_msg', 'AI is handling this conversation.') }}</span>
      </div>

      <button
        type="button"
        class="text-[11px] underline font-bold shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
        @click="emit('toggleHandoff')"
      >
        {{ status.is_ai_paused ? t('conversations.confirm_resume', 'Resume AI') : t('conversations.take_over_to_reply', 'Take Over to Reply') }}
      </button>
    </div>
  </div>
</template>
