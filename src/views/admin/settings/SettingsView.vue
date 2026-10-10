<script setup lang="ts">
import {
  Settings01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Bell, User } from 'lucide-vue-next'
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
  <div class="p-6 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background">
    <div class="max-w-[900px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <HugeiconsIcon :icon="Settings01Icon" :size="20" class="text-primary" />
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight">
              {{ t('settings.title', 'Settings') }}
            </h1>
            <p class="text-muted-foreground mt-0.5 text-sm">
              {{ t('settings.subtitle', 'Manage your account preferences, profile, and notification settings.') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Unified Card: Tabs + Content -->
      <Card class="border-border/40 overflow-hidden !py-0 !gap-0">
        <!-- Tab Bar -->
        <div class="flex border-b border-border">
          <button
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative"
            :class="activeTab === 'profile'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'"
            @click="switchTab('profile')"
          >
            <User :size="15" />
            {{ t('settings.profile', 'Profile') }}
            <span
              v-if="activeTab === 'profile'"
              class="absolute bottom-0 inset-x-4 h-[2px] bg-primary rounded-t-full"
            />
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative"
            :class="activeTab === 'notifications'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'"
            @click="switchTab('notifications')"
          >
            <Bell :size="15" />
            {{ t('settings.notifications', 'Notifications') }}
            <span
              v-if="activeTab === 'notifications'"
              class="absolute bottom-0 inset-x-4 h-[2px] bg-primary rounded-t-full"
            />
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <Transition name="tab-fade" mode="out-in">
            <ProfileSettings v-if="activeTab === 'profile'" key="profile" />
            <NotificationSettings v-else key="notifications" />
          </Transition>
        </div>
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
