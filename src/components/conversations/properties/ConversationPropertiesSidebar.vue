<script setup lang="ts">
import { Building01Icon, CallIcon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import type { InboxConversationDetail } from '@/types/entities/conversation'

defineProps<{
  conversation: InboxConversationDetail
  isLoading: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col w-full h-full min-h-0 bg-background overflow-y-auto scroll-smooth">
    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="flex flex-col w-full h-full min-h-0 bg-background overflow-y-auto">
      <!-- Contact Info Section Skeleton -->
      <div class="p-5 flex flex-col items-center border-b border-border/50 bg-card/20">
        <div class="w-[84px] h-[84px] rounded-full bg-muted/60 animate-pulse mb-4 shadow-sm" />
        <div class="h-5 bg-muted/60 rounded-full w-32 animate-pulse mb-2" />
        <div class="h-3.5 bg-muted/40 rounded-full w-24 animate-pulse mb-5" />

        <!-- Stats Row Skeleton -->
        <div class="flex items-center gap-3 w-full justify-center">
          <div class="flex flex-col items-center bg-muted/30 rounded-xl px-4 py-2 border border-border/50 w-24 h-14 animate-pulse" />
          <div class="flex flex-col items-center bg-muted/30 rounded-xl px-4 py-2 border border-border/50 w-24 h-14 animate-pulse" />
        </div>
      </div>

      <!-- About Section Skeleton -->
      <div class="p-5 flex flex-col gap-5">
        <div class="h-3 bg-muted/60 rounded-full w-24 animate-pulse mb-1" />
        
        <div v-for="i in 3" :key="i" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-muted/40 animate-pulse shrink-0" />
          <div class="flex flex-col gap-1.5 w-full">
            <div class="h-2.5 bg-muted/40 rounded-full w-20 animate-pulse" />
            <div class="h-3.5 bg-muted/60 rounded-full w-32 animate-pulse" />
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Contact Info Section -->
      <div class="p-5 flex flex-col items-center border-b border-border/50 bg-card/20">
        <div class="w-[84px] h-[84px] rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mb-4 shadow-sm border border-primary/20">
          {{ conversation.avatar_initials || '?' }}
        </div>
        <h2 class="text-lg font-bold text-foreground mb-1 text-center">
          {{ conversation.contact_name || t('conversations.unknown_contact', 'Unknown') }}
        </h2>
        <p class="text-sm text-muted-foreground flex items-center gap-1.5 mb-4">
          <HugeiconsIcon :icon="CallIcon" :size="14" />
          {{ conversation.phone || t('common.na', 'N/A') }}
        </p>

        <!-- Stats Row -->
        <div class="flex items-center gap-3 w-full justify-center">
          <div class="flex flex-col items-center bg-muted/30 rounded-xl px-4 py-2 border border-border/50">
            <span class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">{{ t('conversations.bookings', 'Bookings') }}</span>
            <span class="text-base font-black text-foreground">{{ conversation.stats?.bookings || 0 }}</span>
          </div>
          <div class="flex flex-col items-center bg-muted/30 rounded-xl px-4 py-2 border border-border/50">
            <span class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">{{ t('conversations.lead_score', 'Score') }}</span>
            <span class="text-base font-black text-foreground">{{ conversation.lead_score || '0%' }}</span>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="p-5 flex flex-col gap-4">
        <h3 class="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">
          {{ t('conversations.about_contact', 'About Contact') }}
        </h3>
        
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center shrink-0">
            <HugeiconsIcon :icon="UserIcon" :size="16" class="text-foreground/70" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-muted-foreground">{{ t('conversations.full_name', 'Full Name') }}</span>
            <span class="text-sm font-semibold text-foreground">{{ conversation.contact_name || t('common.na', 'N/A') }}</span>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center shrink-0">
            <HugeiconsIcon :icon="CallIcon" :size="16" class="text-foreground/70" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-muted-foreground">{{ t('conversations.phone_number', 'Phone Number') }}</span>
            <span class="text-sm font-semibold text-foreground">{{ conversation.phone || t('common.na', 'N/A') }}</span>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center shrink-0">
            <HugeiconsIcon :icon="Building01Icon" :size="16" class="text-foreground/70" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-muted-foreground">{{ t('conversations.channel', 'Channel') }}</span>
            <span class="text-sm font-semibold text-foreground capitalize">{{ conversation.channel_badge_name || t('common.na', 'N/A') }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
