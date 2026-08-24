<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { AudienceType, NotificationChannel, NotificationType, SendTo } from '@/enums'
import { notificationFormSchema } from '@/modules/notifications/schema'
import { notificationsService } from '@/services/notificationsService'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const { data: item, isLoading } = useQuery({
  queryKey: ['notifications', id],
  queryFn: () => notificationsService.get(id, { scope: 'full' }),
  retry: false,
  refetchOnWindowFocus: false,
})

const form = useForm({
  resourceName: 'notifications',
  action: 'update',
  schema: notificationFormSchema(t),
  mutationFn: data => notificationsService.update(id, data),
  onSuccess: () => router.push({ name: 'admin-notifications' }),
})

watch(item, (newItem) => {
  if (newItem) {
    form.setValues(newItem)
  }
}, { immediate: true })

const typeOptions = [
  { value: NotificationType.GENERAL, label: t('notifications.types.general', 'General') },
  { value: NotificationType.MARKET, label: t('notifications.types.market', 'Market') },
  { value: NotificationType.WALLET, label: t('notifications.types.wallet', 'Wallet') },
  { value: NotificationType.OPERATIONS, label: t('notifications.types.operations', 'Operations') },
]

const audienceOptions = [
  { value: AudienceType.ADMINS, label: t('notifications.audience.admins', 'Admins') },
  { value: AudienceType.USERS, label: t('notifications.audience.users', 'Users') },
]

const sendToOptions = [
  { value: SendTo.ALL, label: t('notifications.send_to.all', 'All') },
  { value: SendTo.SPECIFIC_USER, label: t('notifications.send_to.specific_user', 'Specific User') },
  { value: SendTo.SPECIFIC_ROLE, label: t('notifications.send_to.specific_role', 'Specific Role') },
  { value: SendTo.SPECIFIC_ADMIN, label: t('notifications.send_to.specific_admin', 'Specific Admin') },
]

const channelOptions = [
  { value: NotificationChannel.EMAIL, label: t('notifications.channels.email', 'Email') },
  { value: NotificationChannel.IN_APP, label: t('notifications.channels.in_app', 'In-App') },
  { value: NotificationChannel.PUSH, label: t('notifications.channels.push', 'Push') },
  { value: NotificationChannel.SMS, label: t('notifications.channels.sms', 'SMS') },
]
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">
      {{ t('actions.edit') }} {{ t('notifications.title', 'Notification') }}
    </h1>

    <div v-if="isLoading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>

    <FormContainer
      v-else
      :form="form"
      :is-edit="true"
      @cancel="router.push({ name: 'admin-notifications' })"
    >
      <!-- Title (Translatable) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="title.en"
          :label="`${t('notifications.fields.title', 'Title')} (EN)`"
          :placeholder="t('notifications.placeholders.title_en', 'Enter title in English')"
          :error="form.errors.value['title.en']"
        />
        <InputField
          name="title.ar"
          :label="`${t('notifications.fields.title', 'Title')} (AR)`"
          :placeholder="t('notifications.placeholders.title_ar', 'Enter title in Arabic')"
          dir="rtl"
          :error="form.errors.value['title.ar']"
        />
      </div>

      <!-- Content (Translatable) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="text-sm font-medium">{{ t('notifications.fields.content', 'Content') }} {{ t('common.lang_en', '(EN)') }}</label>
          <textarea
            name="content.en"
            class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]"
            :placeholder="t('notifications.placeholders.content_en', 'Enter content in English')"
          />
        </div>
        <div>
          <label class="text-sm font-medium">{{ t('notifications.fields.content', 'Content') }} {{ t('common.lang_ar', '(AR)') }}</label>
          <textarea
            name="content.ar"
            dir="rtl"
            class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]"
            :placeholder="t('notifications.placeholders.content_ar', 'Enter content in Arabic')"
          />
        </div>
      </div>

      <!-- Configuration -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <SelectField
          name="type"
          :label="t('notifications.fields.type', 'Type')"
          :options="typeOptions"
          :error="form.errors.value.type"
        />
        <SelectField
          name="audience_type"
          :label="t('notifications.fields.audience_type', 'Audience Type')"
          :options="audienceOptions"
          :error="form.errors.value.audience_type"
        />
        <SelectField
          name="send_to"
          :label="t('notifications.fields.send_to', 'Send To')"
          :options="sendToOptions"
          :error="form.errors.value.send_to"
        />
      </div>

      <!-- Channels -->
      <div class="mt-4">
        <label class="text-sm font-medium">{{ t('notifications.fields.channels', 'Channels') }}</label>
        <div class="flex flex-wrap gap-3 mt-2">
          <label
            v-for="channel in channelOptions"
            :key="channel.value"
            class="flex items-center gap-2 text-sm cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-muted/50 transition-colors"
          >
            <input
              type="checkbox"
              :value="channel.value"
              name="channels"
              class="rounded border-border"
            >
            {{ channel.label }}
          </label>
        </div>
      </div>

      <!-- Schedule -->
      <div class="mt-4">
        <InputField
          name="send_at"
          type="datetime-local"
          :label="t('notifications.fields.send_at', 'Schedule Send At')"
          :error="form.errors.value.send_at"
        />
      </div>
    </FormContainer>
  </div>
</template>
