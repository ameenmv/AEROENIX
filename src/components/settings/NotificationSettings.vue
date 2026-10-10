<script setup lang="ts">
import type { NotificationCategory, UserNotificationSettings } from '@/types/entities/platformNotification'
import { Bell, ChevronDown, Mail, Volume2 } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NOTIFICATION_CATEGORY_META,
  NOTIFICATION_TYPES,
} from '@/types/entities/platformNotification'
import { Separator } from '@/components/uic/separator'
import { Skeleton } from '@/components/uic/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/uic/collapsible'
import { Button } from '@/components/uic/button'
import SettingsToggle from '@/components/settings/SettingsToggle.vue'
import { useNotificationStore } from '@/stores/shared/notification'
import { useSonarStore } from '@/stores/sonar'

const { t, locale } = useI18n()
const store = useNotificationStore()
const sonar = useSonarStore()

// Track which toggle is currently saving (by key)
const savingKey = ref<string | null>(null)

const categoriesList = Object.entries(NOTIFICATION_CATEGORY_META).map(([key, meta]) => ({
  key: key as NotificationCategory,
  ...meta,
  settingKey: `notify_${key}` as keyof UserNotificationSettings,
}))

function isArabic() {
  return locale.value === 'ar'
}

function getCategoryEnabled(key: NotificationCategory): boolean {
  if (!store.settings) return true
  const settingKey = `notify_${key}` as keyof UserNotificationSettings
  return store.settings[settingKey] as boolean
}

async function handleCategoryToggle(key: NotificationCategory, val: boolean) {
  if (!store.settings || savingKey.value) return
  const settingKey = `notify_${key}` as keyof UserNotificationSettings
  savingKey.value = settingKey
  try {
    await store.updateSettings({ [settingKey]: val })
    const label = isArabic()
      ? categoriesList.find(c => c.key === key)?.labelAr
      : categoriesList.find(c => c.key === key)?.label
    sonar.success(
      val ? t('settings.enabled', 'Enabled') : t('settings.disabled', 'Disabled'),
      `${label || key} ${val ? t('settings.turned_on', 'turned on') : t('settings.turned_off', 'turned off')}`,
    )
  }
  catch {
    sonar.error(t('common.error', 'Error'), t('settings.toggle_failed', 'Failed to update setting.'))
  }
  finally {
    savingKey.value = null
  }
}

async function handleSettingToggle(key: keyof UserNotificationSettings, val: boolean, label: string) {
  if (!store.settings || savingKey.value) return
  savingKey.value = key
  try {
    await store.updateSettings({ [key]: val })
    sonar.success(
      val ? t('settings.enabled', 'Enabled') : t('settings.disabled', 'Disabled'),
      `${label} ${val ? t('settings.turned_on', 'turned on') : t('settings.turned_off', 'turned off')}`,
    )
  }
  catch {
    sonar.error(t('common.error', 'Error'), t('settings.toggle_failed', 'Failed to update setting.'))
  }
  finally {
    savingKey.value = null
  }
}

function isTypeDisabled(type: string): boolean {
  return store.settings?.disabled_types?.includes(type) ?? false
}

async function handleTypeToggle(type: string, checked: boolean) {
  if (!store.settings || savingKey.value) return
  const disabled = [...(store.settings.disabled_types || [])]
  if (checked) {
    const idx = disabled.indexOf(type)
    if (idx >= 0) disabled.splice(idx, 1)
  }
  else {
    if (!disabled.includes(type)) disabled.push(type)
  }
  savingKey.value = `type_${type}`
  try {
    await store.updateSettings({ disabled_types: disabled })
  }
  catch {
    sonar.error(t('common.error', 'Error'), t('settings.toggle_failed', 'Failed to update setting.'))
  }
  finally {
    savingKey.value = null
  }
}

onMounted(() => {
  if (!store.settings) {
    store.fetchSettings()
  }
})
</script>

<template>
  <div class="space-y-6 max-w-[720px]">

    <!-- Loading Skeleton -->
    <template v-if="!store.settings">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-3 rounded-lg border border-border/40">
          <Skeleton class="w-9 h-9 rounded-lg" />
          <div class="flex-1 space-y-1.5">
            <Skeleton class="h-3.5 w-28" />
            <Skeleton class="h-2.5 w-48" />
          </div>
          <Skeleton class="w-8 h-[18px] rounded-full" />
        </div>
      </div>
    </template>

    <template v-else>

      <!-- Delivery Methods -->
      <div>
        <h3 class="text-sm font-semibold text-foreground mb-1">
          {{ t('settings.delivery_methods', 'Delivery Methods') }}
        </h3>
        <p class="text-xs text-muted-foreground mb-4">
          {{ t('settings.notification_preferences_desc', 'Choose which notifications you want to receive and how.') }}
        </p>

        <div class="space-y-3">
          <!-- In-App -->
          <div
            class="flex items-center gap-3 p-3.5 rounded-lg border border-border/40 hover:border-border/70 transition-colors"
            :class="{ 'opacity-60 pointer-events-none': savingKey === 'in_app_notifications' }"
          >
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              :class="store.settings?.in_app_notifications ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'"
            >
              <Bell :size="16" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground">
                {{ t('settings.in_app', 'In-App Notifications') }}
              </p>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ t('settings.in_app_desc', 'Show notifications in the bell menu') }}
              </p>
            </div>
            <!-- Loading spinner when saving -->
            <svg
              v-if="savingKey === 'in_app_notifications'"
              class="w-4 h-4 text-primary animate-spin shrink-0"
              viewBox="0 0 24 24" fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            <SettingsToggle
              v-else
              :checked="store.settings?.in_app_notifications ?? false"
              @update:checked="(val) => handleSettingToggle('in_app_notifications', val, t('settings.in_app', 'In-App Notifications'))"
            />
          </div>

          <!-- Email -->
          <div
            class="flex items-center gap-3 p-3.5 rounded-lg border border-border/40 hover:border-border/70 transition-colors"
            :class="{ 'opacity-60 pointer-events-none': savingKey === 'email_notifications' }"
          >
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              :class="store.settings?.email_notifications ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'"
            >
              <Mail :size="16" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground">
                {{ t('settings.email_notifications', 'Email Notifications') }}
              </p>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ t('settings.email_desc', 'Receive email alerts for important events') }}
              </p>
            </div>
            <svg
              v-if="savingKey === 'email_notifications'"
              class="w-4 h-4 text-primary animate-spin shrink-0"
              viewBox="0 0 24 24" fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            <SettingsToggle
              v-else
              :checked="store.settings?.email_notifications ?? false"
              @update:checked="(val) => handleSettingToggle('email_notifications', val, t('settings.email_notifications', 'Email Notifications'))"
            />
          </div>

          <!-- Sound -->
          <div
            class="flex items-center gap-3 p-3.5 rounded-lg border border-border/40 hover:border-border/70 transition-colors"
            :class="{ 'opacity-60 pointer-events-none': savingKey === 'sound_enabled' }"
          >
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              :class="store.settings?.sound_enabled ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'"
            >
              <Volume2 :size="16" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground">
                {{ t('settings.sound', 'Sound Alerts') }}
              </p>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ t('settings.sound_desc', 'Play a sound when new notifications arrive') }}
              </p>
            </div>
            <svg
              v-if="savingKey === 'sound_enabled'"
              class="w-4 h-4 text-primary animate-spin shrink-0"
              viewBox="0 0 24 24" fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            <SettingsToggle
              v-else
              :checked="store.settings?.sound_enabled ?? false"
              @update:checked="(val) => handleSettingToggle('sound_enabled', val, t('settings.sound', 'Sound Alerts'))"
            />
          </div>
        </div>
      </div>

      <Separator />

      <!-- Notification Categories -->
      <div>
        <h3 class="text-sm font-semibold text-foreground mb-1">
          {{ t('settings.notification_categories', 'Notification Categories') }}
        </h3>
        <p class="text-xs text-muted-foreground mb-4">
          {{ t('settings.categories_desc', 'Toggle entire categories or fine-tune individual notification types.') }}
        </p>

        <div class="space-y-3">
          <div
            v-for="cat in categoriesList"
            :key="cat.key"
            class="rounded-lg border border-border/40 overflow-hidden hover:border-border/70 transition-colors"
          >
            <!-- Category header -->
            <div
              class="flex items-center gap-3 p-3.5"
              :class="{ 'opacity-60 pointer-events-none': savingKey === cat.settingKey }"
            >
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                :style="{ backgroundColor: cat.color + '18' }"
              >
                <span
                  class="w-2.5 h-2.5 rounded-full"
                  :style="{ background: cat.color }"
                />
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground">
                  {{ isArabic() ? cat.labelAr : cat.label }}
                </p>
                <p class="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {{ cat.description }}
                </p>
              </div>

              <svg
                v-if="savingKey === cat.settingKey"
                class="w-4 h-4 text-primary animate-spin shrink-0"
                viewBox="0 0 24 24" fill="none"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
              </svg>
              <SettingsToggle
                v-else
                :checked="getCategoryEnabled(cat.key)"
                @update:checked="(val) => handleCategoryToggle(cat.key, val)"
              />
            </div>

            <!-- Fine-grained types (collapsible) -->
            <Collapsible v-if="NOTIFICATION_TYPES[cat.key]?.length > 1">
              <CollapsibleTrigger as-child>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="w-full justify-start gap-1.5 h-7 px-3.5 text-[11px] font-semibold text-primary rounded-none border-t border-border/30 hover:bg-muted/30"
                >
                  <ChevronDown :size="12" class="transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  {{ t('common.show_types', `Show ${NOTIFICATION_TYPES[cat.key].length} types`) }}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div class="border-t border-border/30">
                  <div
                    v-for="typeItem in NOTIFICATION_TYPES[cat.key]"
                    :key="typeItem.type"
                    class="flex items-center gap-3 px-4 py-2.5 ps-12 hover:bg-muted/20 transition-colors"
                    :class="{ 'opacity-60 pointer-events-none': savingKey === `type_${typeItem.type}` }"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-foreground">
                        {{ isArabic() ? typeItem.nameAr : typeItem.name }}
                      </p>
                      <p class="text-[10px] text-muted-foreground mt-0.5">
                        {{ typeItem.description }}
                      </p>
                    </div>
                    <svg
                      v-if="savingKey === `type_${typeItem.type}`"
                      class="w-3.5 h-3.5 text-primary animate-spin shrink-0"
                      viewBox="0 0 24 24" fill="none"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.2" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                    </svg>
                    <SettingsToggle
                      v-else
                      class="scale-[0.85]"
                      :checked="!isTypeDisabled(typeItem.type) && getCategoryEnabled(cat.key)"
                      @update:checked="(val) => handleTypeToggle(typeItem.type, val)"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>
