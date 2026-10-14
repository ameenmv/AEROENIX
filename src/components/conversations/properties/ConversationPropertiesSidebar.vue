<script setup lang="ts">
import {
  Building01Icon,
  Calendar03Icon,
  Call02Icon,
  CheckmarkBadge01Icon,
  Copy01Icon,
  FireIcon,
  Message01Icon,
  Tick01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import type { InboxConversationDetail } from '@/types/entities/conversation'

const props = defineProps<{
  conversation: InboxConversationDetail
  isLoading: boolean
}>()

const { t } = useI18n()

const copiedPhone = ref(false)
function copyPhone() {
  if (!props.conversation.phone) return
  navigator.clipboard.writeText(props.conversation.phone)
  copiedPhone.value = true
  toast.success(t('conversations.copied_phone', 'Phone number copied'))
  setTimeout(() => (copiedPhone.value = false), 2000)
}
</script>

<template>
  <div class="flex flex-col w-full h-full min-h-0 bg-card/60 backdrop-blur-md overflow-y-auto scrollbar-thin select-none">
    <!-- ── Loading Skeleton ─────────────────────────────────────────────── -->
    <div v-if="isLoading" class="p-6 space-y-6">
      <div class="flex flex-col items-center">
        <div class="w-20 h-20 rounded-2xl bg-muted/50 animate-pulse mb-4" />
        <div class="h-5 w-32 bg-muted/60 rounded-full animate-pulse mb-2" />
        <div class="h-3.5 w-24 bg-muted/40 rounded-full animate-pulse mb-6" />
        <div class="grid grid-cols-2 gap-3 w-full">
          <div class="h-16 rounded-xl bg-muted/30 animate-pulse" />
          <div class="h-16 rounded-xl bg-muted/30 animate-pulse" />
        </div>
      </div>
    </div>

    <!-- ── Dossier Content ──────────────────────────────────────────────── -->
    <template v-else>
      <!-- Hero Guest Profile Section -->
      <div class="p-6 flex flex-col items-center border-b border-border/50 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        <!-- Monogram Avatar -->
        <div class="relative mb-3.5">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/30 flex items-center justify-center text-primary text-2xl font-bold shadow-xs">
            {{ conversation.avatar_initials || '?' }}
          </div>
          <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-card flex items-center justify-center shadow-xs">
            <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="12" class="text-white" />
          </span>
        </div>

        <h2 class="text-base font-bold text-foreground text-center truncate max-w-full">
          {{ conversation.contact_name || t('conversations.unknown_contact', 'Unknown') }}
        </h2>

        <!-- Phone with Copy Button -->
        <div class="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-mono">
          <span dir="ltr">{{ conversation.phone || t('common.na', 'N/A') }}</span>
          <button
            v-if="conversation.phone"
            type="button"
            class="p-1 hover:text-foreground transition-colors cursor-pointer"
            :title="t('conversations.copy_phone', 'Copy Phone')"
            @click="copyPhone"
          >
            <HugeiconsIcon
              :icon="copiedPhone ? Tick01Icon : Copy01Icon"
              :size="13"
              :class="{ 'text-emerald-400': copiedPhone }"
            />
          </button>
        </div>

        <!-- 2 KPI Mini-Tiles -->
        <div class="grid grid-cols-2 gap-3 w-full mt-5">
          <!-- Tile 1: Bookings -->
          <div class="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/20 border border-border/40 text-center">
            <div class="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              <HugeiconsIcon :icon="Calendar03Icon" :size="12" class="text-primary" />
              <span>{{ t('conversations.bookings', 'Bookings') }}</span>
            </div>
            <span class="text-lg font-black text-foreground">{{ conversation.stats?.bookings || 0 }}</span>
          </div>

          <!-- Tile 2: Score -->
          <div class="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/20 border border-border/40 text-center">
            <div class="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              <HugeiconsIcon :icon="FireIcon" :size="12" class="text-amber-500" />
              <span>{{ t('conversations.lead_score', 'Score') }}</span>
            </div>
            <span class="text-lg font-black text-amber-400 flex items-center gap-1">
              {{ conversation.lead_score || 'Hot' }}
            </span>
          </div>
        </div>
      </div>

      <!-- About Contact Section -->
      <div class="p-5 space-y-4 border-b border-border/40">
        <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <HugeiconsIcon :icon="UserIcon" :size="14" class="text-primary" />
          {{ t('conversations.about_contact', 'About Contact') }}
        </h3>

        <div class="space-y-3 text-xs">
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/30">
            <span class="text-muted-foreground">{{ t('conversations.full_name', 'Full Name') }}</span>
            <span class="font-semibold text-foreground truncate max-w-[150px]">{{ conversation.contact_name || '—' }}</span>
          </div>

          <div class="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/30">
            <span class="text-muted-foreground">{{ t('conversations.phone_number', 'Phone') }}</span>
            <span class="font-mono font-medium text-foreground" dir="ltr">{{ conversation.phone || '—' }}</span>
          </div>

          <div class="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/30">
            <span class="text-muted-foreground">{{ t('conversations.channel', 'Channel') }}</span>
            <span class="inline-flex items-center gap-1 font-semibold text-primary capitalize">
              <HugeiconsIcon :icon="Building01Icon" :size="12" />
              {{ conversation.channel_badge_name || 'Chat' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Engagement Details Section -->
      <div class="p-5 space-y-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <HugeiconsIcon :icon="Message01Icon" :size="14" class="text-primary" />
          {{ t('conversations.conversation_info', 'Conversation Details') }}
        </h3>

        <div class="space-y-3 text-xs">
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/30">
            <span class="text-muted-foreground">{{ t('conversations.total_conversations', 'Total Chats') }}</span>
            <span class="font-bold text-foreground font-mono">{{ conversation.stats?.conversations || 1 }}</span>
          </div>

          <div v-if="conversation.stats?.first_contact" class="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/30">
            <span class="text-muted-foreground">{{ t('conversations.first_contact', 'First Contact') }}</span>
            <span class="font-medium text-muted-foreground font-mono">{{ conversation.stats.first_contact }}</span>
          </div>

          <div v-if="conversation.phone" class="pt-2">
            <a
              :href="'tel:' + conversation.phone"
              class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 font-semibold text-xs transition-colors"
            >
              <HugeiconsIcon :icon="Call02Icon" :size="15" />
              <span>{{ t('conversations.call_guest', 'Call Guest') }}</span>
            </a>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
