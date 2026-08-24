<script setup lang="ts">
import type { ManualNotification } from '@/types/entities/notification'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDetails } from '@/composables'
import { NotificationStatusColor, NotificationStatusLabel } from '@/enums'
import { notificationsService } from '@/services/notificationsService'

const { t } = useI18n()
const router = useRouter()

const { item, loading } = useDetails<ManualNotification>({
  resourceName: 'notifications',
  getFn: id => notificationsService.get(id, { scope: 'full' }),
  autoLoadId: true,
})

const statusColorClass: Record<string, string> = {
  gray: 'bg-gray-500/10 text-gray-400',
  yellow: 'bg-amber-500/10 text-amber-500',
  green: 'bg-emerald-500/10 text-emerald-500',
  red: 'bg-red-500/10 text-red-400',
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        {{ t('notifications.title', 'Notification') }} {{ t('common.details', 'Details') }}
      </h1>
      <Button variant="ghost" @click="router.push({ name: 'admin-notifications' })">
        {{ t('actions.back', 'Back') }}
      </Button>
    </div>

    <div class="rounded-xl border border-border bg-card">
      <div v-if="loading" class="py-12 text-center text-muted-foreground">
        {{ t('common.loading', 'Loading...') }}
      </div>
      <div v-else-if="item" class="p-6 space-y-8">
        <!-- Notification Header -->
        <div>
          <h2 class="text-xl font-semibold">
            {{ item.title?.en || '—' }}
          </h2>
          <p v-if="item.title?.ar" class="text-sm text-muted-foreground mt-1" dir="rtl">
            {{ item.title.ar }}
          </p>
          <div class="mt-3 flex items-center gap-2">
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="statusColorClass[NotificationStatusColor[item.status] || 'gray']"
            >
              {{ NotificationStatusLabel[item.status] || 'Unknown' }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="space-y-4">
          <div>
            <span class="text-sm text-muted-foreground">{{ t('notifications.fields.content', 'Content') }}
              {{ t('common.lang_en', '(EN)') }}</span>
            <p class="font-medium mt-1 whitespace-pre-wrap">
              {{ item.content?.en || '—' }}
            </p>
          </div>
          <div v-if="item.content?.ar">
            <span class="text-sm text-muted-foreground">{{ t('notifications.fields.content', 'Content') }}
              {{ t('common.lang_ar', '(AR)') }}</span>
            <p class="font-medium mt-1 whitespace-pre-wrap" dir="rtl">
              {{ item.content.ar }}
            </p>
          </div>
        </div>

        <!-- Detail Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <span class="text-sm text-muted-foreground">{{
              t('notifications.fields.type', 'Type')
            }}</span>
            <p class="font-medium mt-1">
              {{ item.type }}
            </p>
          </div>
          <div>
            <span class="text-sm text-muted-foreground">{{
              t('notifications.fields.audience_type', 'Audience')
            }}</span>
            <p class="font-medium mt-1">
              {{ item.audience_type }}
            </p>
          </div>
          <div>
            <span class="text-sm text-muted-foreground">{{
              t('notifications.fields.send_to', 'Send To')
            }}</span>
            <p class="font-medium mt-1">
              {{ item.send_to }}
            </p>
          </div>
          <div>
            <span class="text-sm text-muted-foreground">{{
              t('notifications.fields.send_at', 'Send At')
            }}</span>
            <p class="font-medium mt-1">
              {{
                item.send_at
                  ? new Date(item.send_at).toLocaleString()
                  : t('common.not_scheduled', '—')
              }}
            </p>
          </div>
          <div>
            <span class="text-sm text-muted-foreground">{{
              t('notifications.fields.sent_at', 'Sent At')
            }}</span>
            <p class="font-medium mt-1">
              {{
                item.sent_at
                  ? new Date(item.sent_at).toLocaleString()
                  : t('common.not_available', '—')
              }}
            </p>
          </div>
          <div>
            <span class="text-sm text-muted-foreground">{{
              t('notifications.fields.created_at', 'Created At')
            }}</span>
            <p class="font-medium mt-1">
              {{ new Date(item.created_at).toLocaleString() }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 pt-4 border-t border-border">
          <Button
            @click="
              router.push({ name: 'admin-notifications-edit', params: { id: String(item.id) } })
            "
          >
            {{ t('actions.edit', 'Edit') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
