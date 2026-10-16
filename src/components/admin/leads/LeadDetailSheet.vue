<script setup lang="ts">
import type { LeadCard, LeadDetailsResponse } from '@/types/entities/lead'
import {
  Building04Icon,
  Calendar03Icon,
  Call02Icon,
  Chat01Icon,
  Comment01Icon,
  FacebookIcon,
  InstagramIcon,
  LinkSquare02Icon,
  Time02Icon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Button } from '@/components/uic/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/uic/sheet'
import { Skeleton } from '@/components/uic/skeleton'
import { leadsService } from '@/services/leadsService'

const props = defineProps<{
  open: boolean
  lead: LeadCard | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { t, locale } = useI18n()
const router = useRouter()

const loading = ref(false)
const details = ref<LeadDetailsResponse | null>(null)

watch(
  () => props.lead,
  async (newLead) => {
    if (!newLead) {
      details.value = null
      return
    }
    loading.value = true
    try {
      details.value = await leadsService.get(newLead.conversation_id)
    }
    catch (err) {
      console.error('Failed to fetch lead details:', err)
      details.value = null
    }
    finally {
      loading.value = false
    }
  },
  { immediate: true },
)

function navigateToInbox() {
  if (!props.lead) return
  emit('update:open', false)
  router.push({
    name: 'admin-conversations',
    query: { conversation_id: String(props.lead.conversation_id) },
  })
}

const channelIcon = computed(() => {
  const p = details.value?.channel?.provider || props.lead?.channel_type
  if (p?.includes('whatsapp')) return WhatsappIcon
  if (p?.includes('messenger') || p?.includes('facebook')) return FacebookIcon
  if (p?.includes('instagram')) return InstagramIcon
  return Comment01Icon
})
</script>

<template>
  <Sheet :open="open" @update:open="(val: boolean) => emit('update:open', val)">
    <SheetContent
      :side="locale === 'ar' ? 'left' : 'right'"
      class="w-full sm:max-w-lg p-0 flex flex-col bg-background/95 backdrop-blur-xl border-border/60"
    >
      <!-- Sheet Header -->
      <SheetHeader class="p-6 border-b border-border/40">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shrink-0"
          >
            {{ lead?.avatar_initials || 'G' }}
          </div>
          <div class="min-w-0 flex-1">
            <SheetTitle class="text-lg font-bold truncate text-foreground">
              {{ lead?.contact_name || lead?.phone || 'Guest' }}
            </SheetTitle>
            <SheetDescription class="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-2">
              <span class="inline-flex items-center gap-1">
                <HugeiconsIcon :icon="channelIcon" :size="12" class="text-primary" />
                {{ details?.channel?.badge_name || lead?.channel_badge_name }}
              </span>
              <span>•</span>
              <span>{{ lead?.time }}</span>
            </SheetDescription>
          </div>

          <div v-if="lead?.score !== undefined" class="text-right">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full border bg-primary/10 text-primary border-primary/20">
              {{ t('leads.score', 'Score') }}: {{ lead.score }}
            </span>
          </div>
        </div>
      </SheetHeader>

      <!-- Sheet Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <Skeleton class="h-24 w-full rounded-2xl" />
          <Skeleton class="h-36 w-full rounded-2xl" />
          <Skeleton class="h-48 w-full rounded-2xl" />
        </div>

        <template v-else>
          <!-- Quick CRM Overview Stats -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3.5 rounded-2xl bg-card/60 border border-border/40">
              <div class="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <HugeiconsIcon :icon="Calendar03Icon" :size="14" class="text-emerald-400" />
                <span>{{ t('leads.related_bookings', 'Related Bookings') }}</span>
              </div>
              <div class="text-lg font-bold text-foreground">
                {{ details?.stats?.related_bookings_count ?? 0 }}
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-card/60 border border-border/40">
              <div class="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <HugeiconsIcon :icon="Chat01Icon" :size="14" class="text-sky-400" />
                <span>{{ t('leads.total_messages', 'Total Messages') }}</span>
              </div>
              <div class="text-lg font-bold text-foreground">
                {{ details?.stats?.total_messages_count ?? 0 }}
              </div>
            </div>
          </div>

          <!-- Contact & Channel Info Box -->
          <div class="p-4 rounded-2xl bg-card/40 border border-border/40 space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {{ t('leads.contact_info', 'Contact Information') }}
            </h4>

            <div v-if="lead?.phone" class="flex items-center justify-between text-xs py-1 border-b border-border/30">
              <span class="text-muted-foreground flex items-center gap-1.5">
                <HugeiconsIcon :icon="Call02Icon" :size="13" />
                {{ t('leads.phone', 'Phone') }}
              </span>
              <span class="font-semibold text-foreground font-mono" dir="ltr">{{ lead.phone }}</span>
            </div>

            <div v-if="details?.channel?.hotel_name" class="flex items-center justify-between text-xs py-1 border-b border-border/30">
              <span class="text-muted-foreground flex items-center gap-1.5">
                <HugeiconsIcon :icon="Building04Icon" :size="13" />
                {{ t('leads.hotel', 'Hotel') }}
              </span>
              <span class="font-semibold text-foreground">{{ details.channel.hotel_name }}</span>
            </div>

            <div class="flex items-center justify-between text-xs py-1">
              <span class="text-muted-foreground flex items-center gap-1.5">
                <HugeiconsIcon :icon="Time02Icon" :size="13" />
                {{ t('leads.first_contact', 'First Contact') }}
              </span>
              <span class="font-medium text-foreground">
                {{ details?.stats?.first_contact_at ? new Date(details.stats.first_contact_at).toLocaleDateString() : '—' }}
              </span>
            </div>
          </div>

          <!-- Recent Inquiry / Messages Transcript -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {{ t('leads.recent_messages', 'Recent Conversation') }}
            </h4>

            <div v-if="details?.messages?.length" class="space-y-2.5 max-h-[320px] overflow-y-auto p-1 custom-scrollbar">
              <div
                v-for="msg in details.messages"
                :key="msg.id"
                class="flex flex-col text-xs"
                :class="msg.direction === 'outbound' ? 'items-end' : 'items-start'"
              >
                <div
                  class="max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs"
                  :class="[
                    msg.direction === 'outbound'
                      ? 'bg-primary text-primary-foreground rounded-br-xs'
                      : 'bg-card border border-border/40 text-foreground rounded-bl-xs',
                  ]"
                >
                  <p class="leading-relaxed whitespace-pre-wrap">{{ msg.text }}</p>
                </div>
                <span class="text-[10px] text-muted-foreground mt-1 px-1">
                  {{ msg.sender_type === 'ai' ? '🤖 AI • ' : msg.sender_type === 'staff' ? '👤 Staff • ' : '' }}
                  {{ msg.time }}
                </span>
              </div>
            </div>

            <div v-else class="p-6 text-center text-xs text-muted-foreground rounded-2xl bg-card/20 border border-border/30">
              {{ lead?.inquiry || 'No messages recorded yet.' }}
            </div>
          </div>
        </template>
      </div>

      <!-- Sheet Footer: Action button to open unified inbox -->
      <div class="p-4 border-t border-border/40 bg-card/30 flex items-center gap-3">
        <Button
          class="w-full gap-2 font-semibold shadow-xs"
          @click="navigateToInbox"
        >
          <HugeiconsIcon :icon="LinkSquare02Icon" :size="16" />
          {{ t('leads.open_in_inbox', 'Open in Unified Inbox') }}
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>
