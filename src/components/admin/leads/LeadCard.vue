<script setup lang="ts">
import type { LeadCard as LeadCardType } from '@/types/entities/lead'
import {
  ArrowRight01Icon,
  Clock01Icon,
  Comment01Icon,
  FacebookIcon,
  InstagramIcon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed } from 'vue'

const props = defineProps<{
  lead: LeadCardType
}>()

const emit = defineEmits<{
  (e: 'select', lead: LeadCardType): void
}>()

const channelIcon = computed(() => {
  switch (props.lead.channel_type) {
    case 'whatsapp':
      return WhatsappIcon
    case 'messenger':
      return FacebookIcon
    case 'instagram':
      return InstagramIcon
    default:
      return Comment01Icon
  }
})

const channelTheme = computed(() => {
  switch (props.lead.channel_type) {
    case 'whatsapp':
      return {
        badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        glow: 'bg-emerald-500/15',
      }
    case 'messenger':
      return {
        badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        glow: 'bg-blue-500/15',
      }
    case 'instagram':
      return {
        badge: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
        glow: 'bg-pink-500/15',
      }
    default:
      return {
        badge: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
        glow: 'bg-sky-500/15',
      }
  }
})

const scoreBadgeClass = computed(() => {
  const score = props.lead.score || 0
  if (score >= 70) {
    return 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
  }
  if (score >= 40) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
  }
  return 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
})

const tagBadgeClass = computed(() => {
  switch (props.lead.tag_variant) {
    case 'warning':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'info':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20'
    default:
      return 'bg-muted/50 text-muted-foreground border-border/40'
  }
})
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/95 via-card/80 to-card/50 p-4 backdrop-blur-xl shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] hover:-translate-y-1 cursor-pointer select-none"
    @click="emit('select', lead)"
  >
    <!-- Ambient glow behind top corner -->
    <div
      class="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl transition-opacity duration-300 opacity-40 group-hover:opacity-100 pointer-events-none"
      :class="channelTheme.glow"
    />

    <!-- Header: Avatar, Name & Score -->
    <div class="flex items-center justify-between gap-2 mb-2.5">
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Channel Icon Box -->
        <div
          class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 border transition-transform group-hover:scale-105"
          :class="channelTheme.badge"
        >
          <HugeiconsIcon :icon="channelIcon" :size="15" />
        </div>

        <div class="min-w-0 truncate">
          <div class="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {{ lead.contact_name || lead.phone || 'Guest' }}
          </div>
          <div v-if="lead.phone && lead.contact_name" class="text-[11px] text-muted-foreground/70 font-mono truncate" dir="ltr">
            {{ lead.phone }}
          </div>
        </div>
      </div>

      <!-- Lead Score Pill -->
      <div
        v-if="lead.score > 0"
        class="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full border shrink-0 transition-transform group-hover:scale-105"
        :class="scoreBadgeClass"
      >
        {{ lead.score }}
      </div>
    </div>

    <!-- Inquiry Message Snippet -->
    <p class="text-xs text-muted-foreground line-clamp-2 leading-relaxed my-2.5 group-hover:text-foreground/90 transition-colors">
      {{ lead.inquiry || 'Inquiry details not provided' }}
    </p>

    <!-- Footer: Time, Tag & Hover Hint -->
    <div class="flex items-center justify-between gap-2 pt-2.5 border-t border-border/30 text-[11px]">
      <div class="flex items-center gap-1.5 text-muted-foreground font-mono">
        <HugeiconsIcon :icon="Clock01Icon" :size="13" class="shrink-0 text-muted-foreground/70" />
        <span>{{ lead.time }}</span>
      </div>

      <div class="flex items-center gap-1.5">
        <span
          class="px-2.5 py-0.5 rounded-md text-[10px] font-semibold border transition-colors"
          :class="tagBadgeClass"
        >
          {{ lead.tag || 'General' }}
        </span>

        <HugeiconsIcon
          :icon="ArrowRight01Icon"
          :size="13"
          class="text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
        />
      </div>
    </div>
  </div>
</template>
