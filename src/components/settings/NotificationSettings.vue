<script setup lang="ts">
import type { NotificationCategory, UserNotificationSettings } from '@/types/entities/platformNotification'
import { Bell, ChevronDown, ChevronUp, Mail, Volume2 } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NOTIFICATION_CATEGORY_META,
  NOTIFICATION_TYPES,
} from '@/types/entities/platformNotification'
import { useNotificationStore } from '@/stores/shared/notification'

const { t, locale } = useI18n()
const store = useNotificationStore()

const isSaving = ref(false)
const expandedCategory = ref<string | null>(null)

// Categories list for rendering
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

async function toggleCategory(key: NotificationCategory) {
  if (!store.settings) return
  const settingKey = `notify_${key}` as keyof UserNotificationSettings
  const newValue = !store.settings[settingKey]
  isSaving.value = true
  try {
    await store.updateSettings({ [settingKey]: newValue })
  }
  finally {
    isSaving.value = false
  }
}

async function toggleSetting(key: keyof UserNotificationSettings) {
  if (!store.settings) return
  const newValue = !store.settings[key]
  isSaving.value = true
  try {
    await store.updateSettings({ [key]: newValue })
  }
  finally {
    isSaving.value = false
  }
}

function isTypeDisabled(type: string): boolean {
  return store.settings?.disabled_types?.includes(type) ?? false
}

async function toggleType(type: string) {
  if (!store.settings) return
  const disabled = [...(store.settings.disabled_types || [])]
  const idx = disabled.indexOf(type)
  if (idx >= 0) {
    disabled.splice(idx, 1)
  }
  else {
    disabled.push(type)
  }
  isSaving.value = true
  try {
    await store.updateSettings({ disabled_types: disabled })
  }
  finally {
    isSaving.value = false
  }
}

function toggleExpand(key: string) {
  expandedCategory.value = expandedCategory.value === key ? null : key
}

onMounted(() => {
  if (!store.settings) {
    store.fetchSettings()
  }
})
</script>

<template>
  <div class="ns-container">
    <h3 class="text-lg font-bold text-foreground mb-1">
      {{ t('settings.notification_preferences', 'Notification Preferences') }}
    </h3>
    <p class="text-sm text-muted-foreground mb-6">
      {{ t('settings.notification_preferences_desc', 'Choose which notifications you want to receive and how.') }}
    </p>

    <!-- Loading -->
    <div v-if="!store.settings" class="ns-loading">
      <div v-for="i in 4" :key="i" class="ns-skeleton-row">
        <div class="ns-skeleton-icon skeleton-shimmer" />
        <div class="flex-1 space-y-2">
          <div class="h-3.5 w-1/3 rounded-full skeleton-shimmer" />
          <div class="h-2.5 w-2/3 rounded-full skeleton-shimmer" />
        </div>
        <div class="h-5 w-10 rounded-full skeleton-shimmer" />
      </div>
    </div>

    <template v-else>
      <!-- Delivery Methods -->
      <div class="ns-section">
        <h4 class="ns-section__title">
          {{ t('settings.delivery_methods', 'Delivery Methods') }}
        </h4>
        <div class="ns-delivery-grid">
          <div class="ns-delivery-card" @click="toggleSetting('in_app_notifications')">
            <div class="ns-delivery-card__icon" :class="{ 'ns-delivery-card__icon--active': store.settings?.in_app_notifications }">
              <Bell :size="18" />
            </div>
            <div class="ns-delivery-card__text">
              <span class="ns-delivery-card__label">{{ t('settings.in_app', 'In-App Notifications') }}</span>
              <span class="ns-delivery-card__desc">{{ t('settings.in_app_desc', 'Show notifications in the bell menu') }}</span>
            </div>
            <div class="ns-toggle" :class="{ 'ns-toggle--on': store.settings?.in_app_notifications }" />
          </div>

          <div class="ns-delivery-card" @click="toggleSetting('email_notifications')">
            <div class="ns-delivery-card__icon" :class="{ 'ns-delivery-card__icon--active': store.settings?.email_notifications }">
              <Mail :size="18" />
            </div>
            <div class="ns-delivery-card__text">
              <span class="ns-delivery-card__label">{{ t('settings.email_notifications', 'Email Notifications') }}</span>
              <span class="ns-delivery-card__desc">{{ t('settings.email_desc', 'Receive email alerts for important events') }}</span>
            </div>
            <div class="ns-toggle" :class="{ 'ns-toggle--on': store.settings?.email_notifications }" />
          </div>

          <div class="ns-delivery-card" @click="toggleSetting('sound_enabled')">
            <div class="ns-delivery-card__icon" :class="{ 'ns-delivery-card__icon--active': store.settings?.sound_enabled }">
              <Volume2 :size="18" />
            </div>
            <div class="ns-delivery-card__text">
              <span class="ns-delivery-card__label">{{ t('settings.sound', 'Sound Alerts') }}</span>
              <span class="ns-delivery-card__desc">{{ t('settings.sound_desc', 'Play a sound when new notifications arrive') }}</span>
            </div>
            <div class="ns-toggle" :class="{ 'ns-toggle--on': store.settings?.sound_enabled }" />
          </div>
        </div>
      </div>

      <!-- Category Toggles -->
      <div class="ns-section">
        <h4 class="ns-section__title">
          {{ t('settings.notification_categories', 'Notification Categories') }}
        </h4>
        <div class="ns-categories">
          <div
            v-for="cat in categoriesList"
            :key="cat.key"
            class="ns-cat-card"
          >
            <!-- Category header row -->
            <div class="ns-cat-card__header" @click="toggleCategory(cat.key)">
              <div
                class="ns-cat-card__icon"
                :style="{ backgroundColor: cat.color + '12', color: cat.color }"
              >
                <span class="ns-cat-dot" :style="{ background: cat.color }" />
              </div>
              <div class="ns-cat-card__text">
                <span class="ns-cat-card__label">
                  {{ isArabic() ? cat.labelAr : cat.label }}
                </span>
                <span class="ns-cat-card__desc">
                  {{ cat.description }}
                </span>
              </div>
              <div class="ns-toggle" :class="{ 'ns-toggle--on': getCategoryEnabled(cat.key) }" />
            </div>

            <!-- Expand/collapse for individual types -->
            <button
              v-if="NOTIFICATION_TYPES[cat.key]?.length > 1"
              class="ns-cat-card__expand"
              @click="toggleExpand(cat.key)"
            >
              <component :is="expandedCategory === cat.key ? ChevronUp : ChevronDown" :size="13" />
              <span class="text-[11px]">
                {{ expandedCategory === cat.key
                  ? t('common.hide_types', 'Hide types')
                  : t('common.show_types', `Show ${NOTIFICATION_TYPES[cat.key].length} types`)
                }}
              </span>
            </button>

            <!-- Fine-grained type toggles -->
            <div
              v-if="expandedCategory === cat.key && NOTIFICATION_TYPES[cat.key]"
              class="ns-types"
            >
              <div
                v-for="typeItem in NOTIFICATION_TYPES[cat.key]"
                :key="typeItem.type"
                class="ns-type-row"
                @click="toggleType(typeItem.type)"
              >
                <div class="ns-type-row__text">
                  <span class="ns-type-row__name">
                    {{ isArabic() ? typeItem.nameAr : typeItem.name }}
                  </span>
                  <span class="ns-type-row__desc">{{ typeItem.description }}</span>
                </div>
                <div
                  class="ns-toggle ns-toggle--sm"
                  :class="{ 'ns-toggle--on': !isTypeDisabled(typeItem.type) && getCategoryEnabled(cat.key) }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ns-container {
  max-width: 680px;
}

.ns-loading {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ns-skeleton-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
}

.ns-skeleton-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
}

.ns-section {
  margin-bottom: 28px;
}

.ns-section__title {
  font-size: 13px;
  font-weight: 700;
  color: hsl(var(--foreground));
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

/* Delivery cards */
.ns-delivery-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ns-delivery-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.ns-delivery-card:hover {
  border-color: hsl(var(--primary) / 0.3);
}

.ns-delivery-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--muted) / 0.5);
  color: hsl(var(--muted-foreground));
  transition: all 0.2s;
}
.ns-delivery-card__icon--active {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.ns-delivery-card__text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ns-delivery-card__label {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.ns-delivery-card__desc {
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
  margin-top: 1px;
}

/* Toggle switch */
.ns-toggle {
  width: 36px;
  height: 20px;
  border-radius: 9999px;
  background: hsl(var(--muted));
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s;
  cursor: pointer;
}
.ns-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.ns-toggle--on {
  background: hsl(var(--primary));
}
.ns-toggle--on::after {
  transform: translateX(16px);
}
.ns-toggle--sm {
  width: 30px;
  height: 16px;
}
.ns-toggle--sm::after {
  width: 12px;
  height: 12px;
}
.ns-toggle--sm.ns-toggle--on::after {
  transform: translateX(14px);
}

/* Category cards */
.ns-categories {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ns-cat-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 14px;
  overflow: hidden;
}

.ns-cat-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.15s;
}
.ns-cat-card__header:hover {
  background: hsl(var(--muted) / 0.2);
}

.ns-cat-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ns-cat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.ns-cat-card__text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ns-cat-card__label {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.ns-cat-card__desc {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-top: 2px;
  line-height: 1.4;
}

.ns-cat-card__expand {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px 8px;
  color: hsl(var(--primary));
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.ns-cat-card__expand:hover {
  opacity: 0.7;
}

/* Fine-grained types */
.ns-types {
  border-top: 1px solid hsl(var(--border) / 0.5);
  padding: 4px 0;
}

.ns-type-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 10px 52px;
  cursor: pointer;
  transition: background 0.15s;
}
.ns-type-row:hover {
  background: hsl(var(--muted) / 0.2);
}

.ns-type-row__text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ns-type-row__name {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.ns-type-row__desc {
  font-size: 10.5px;
  color: hsl(var(--muted-foreground));
  margin-top: 1px;
}

/* Shimmer */
.skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background: hsl(var(--muted) / 0.7);
}
.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%);
  animation: shimmer 1.8s ease-in-out infinite;
}
:global(.dark) .skeleton-shimmer::after {
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.06) 50%, transparent 100%);
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
