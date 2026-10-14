<script setup lang="ts">
import {
  Notification03Icon,
  Settings01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import NotificationSettings from '@/components/settings/NotificationSettings.vue'
import ProfileSettings from '@/components/settings/ProfileSettings.vue'
import { Card } from '@/components/uic/card'
import { useSettingsStore } from '@/stores/shared/settingsStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useSettingsStore()

const activeTab = ref<'profile' | 'notifications'>('profile')

onMounted(() => {
  const tab = route.query.tab as string
  if (tab === 'notifications') {
    activeTab.value = 'notifications'
  }
  if (!store.profile) {
    store.fetchAll()
  }
})

function switchTab(tab: 'profile' | 'notifications') {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
}
</script>

<template>
  <div class="p-4 sm:p-7 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background select-none">
    <div class="max-w-4xl mx-auto space-y-7 animate-in fade-in duration-300">

      <!-- ── Page Header ────────────────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/25 flex items-center justify-center shrink-0 text-primary shadow-xs">
            <HugeiconsIcon :icon="Settings01Icon" :size="24" />
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-2xl font-bold tracking-tight text-foreground">
                {{ t('settings.title', 'Settings') }}
              </h1>
              <span
                v-if="store.profile?.role"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-primary" />
                {{ store.profile.role.name }}
              </span>
            </div>
            <p class="text-muted-foreground mt-0.5 text-xs sm:text-sm">
              {{ t('settings.subtitle', 'Manage your account preferences, profile, and notification settings.') }}
            </p>
          </div>
        </div>

        <!-- Luxury Segmented Tab Switcher -->
        <div class="flex items-center gap-1.5 p-1 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-md shadow-xs">
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border"
            :class="activeTab === 'profile'
              ? 'bg-primary text-primary-foreground border-primary shadow-xs shadow-primary/25'
              : 'bg-transparent text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/30'"
            @click="switchTab('profile')"
          >
            <HugeiconsIcon :icon="UserIcon" :size="16" />
            <span>{{ t('settings.profile_security', 'Profile & Security') }}</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border"
            :class="activeTab === 'notifications'
              ? 'bg-primary text-primary-foreground border-primary shadow-xs shadow-primary/25'
              : 'bg-transparent text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/30'"
            @click="switchTab('notifications')"
          >
            <HugeiconsIcon :icon="Notification03Icon" :size="16" />
            <span>{{ t('settings.notifications_alerts', 'Notifications & Alerts') }}</span>
          </button>
        </div>
      </div>

      <!-- ── Tab Content Card ───────────────────────────────────────────── -->
      <Card class="rounded-2xl border-border/50 bg-card/70 backdrop-blur-md shadow-xs overflow-hidden p-6 sm:p-8">
        <Transition name="tab-fade" mode="out-in">
          <ProfileSettings v-if="activeTab === 'profile'" key="profile" />
          <NotificationSettings v-else key="notifications" />
        </Transition>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
