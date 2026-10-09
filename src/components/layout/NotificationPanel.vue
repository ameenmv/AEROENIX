<script setup lang="ts">
import type { PlatformNotification } from '@/types/entities/platformNotification'
import {
  Notification03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  MessageSquare,
  Share2,
  UserCheck,
  Users,
  X,
} from 'lucide-vue-next'

import { nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Button } from '@/components/uic/button'
import { ScrollArea } from '@/components/uic/scroll-area'
import { NOTIFICATION_CATEGORY_META, type NotificationCategory } from '@/types/entities/platformNotification'
import { navigateToNotification } from '@/utils/notificationNavigation'
import { useNotificationStore } from '@/stores/shared/notification'

const emit = defineEmits<{
  close: []
}>()

const { t, locale } = useI18n()
const router = useRouter()
const store = useNotificationStore()

const categoryFilter = ref<string | null>(null)
const tabsRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollArrows() {
  const el = tabsRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 2
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 2
}

function scrollTabs(direction: 'left' | 'right') {
  const el = tabsRef.value
  if (!el) return
  const amount = direction === 'left' ? -100 : 100
  el.scrollBy({ left: amount, behavior: 'smooth' })
}

onMounted(() => {
  nextTick(() => updateScrollArrows())
})

const categoryTabs: Array<{ key: string | null; label: string }> = [
  { key: null, label: 'All' },
  { key: 'takeover', label: 'Takeover' },
  { key: 'booking', label: 'Bookings' },
  { key: 'payment', label: 'Payments' },
  { key: 'channel', label: 'Channels' },
  { key: 'team', label: 'Team' },
  { key: 'system', label: 'System' },
]

const categoryIcons: Record<string, any> = {
  takeover: UserCheck,
  conversation: MessageSquare,
  booking: Calendar,
  payment: CreditCard,
  channel: Share2,
  team: Users,
  system: AlertTriangle,
}

function getCategoryColor(category: string): string {
  return NOTIFICATION_CATEGORY_META[category as NotificationCategory]?.color || '#6B7280'
}

function getCategoryIcon(category: string) {
  return categoryIcons[category] || Bell
}


function handleCategoryFilter(key: string | null) {
  categoryFilter.value = key
  store.filterByCategory(key)
}

function handleNotificationClick(notification: PlatformNotification) {
  store.markAsRead(notification.id)
  if (notification.action_url) {
    navigateToNotification(notification, router, locale.value)
    emit('close')
  }
}

function handleDismiss(e: Event, notification: PlatformNotification) {
  e.stopPropagation()
  store.dismissNotification(notification.id)
}

function handleMarkAsRead(e: Event, notification: PlatformNotification) {
  e.stopPropagation()
  store.markAsRead(notification.id)
}

function handleMarkAllAsRead() {
  store.markAllAsRead()
}

function handleViewAll() {
  router.push(`/${locale.value}/admin/notification-center`)
  emit('close')
}

onMounted(() => {
  if (store.notifications.length === 0) {
    store.fetchNotifications(1)
  }
})
</script>

<template>
  <div class="notification-panel">
    <!-- Header -->
    <div class="np-header">
      <div class="flex items-center gap-2">
        <HugeiconsIcon :icon="Notification03Icon" :size="16" class="text-foreground" />
        <h3 class="text-sm font-bold text-foreground">
          {{ t('common.notifications', 'Notifications') }}
        </h3>
        <span
          v-if="store.unreadCount > 0"
          class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground"
        >
          {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
        </span>
      </div>
      <Button
        v-if="store.unreadCount > 0"
        variant="none"
        size="none"
        class="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
        @click="handleMarkAllAsRead"
      >
        <CheckCheck :size="12" class="mr-1" />
        {{ t('common.mark_all_read', 'Mark all read') }}
      </Button>
    </div>

    <!-- Category Tabs -->
    <div class="np-tabs-wrapper">
      <button
        v-if="canScrollLeft"
        class="np-tabs-arrow np-tabs-arrow--left"
        @click="scrollTabs('left')"
      >
        <ChevronLeft :size="14" />
      </button>
      <div
        ref="tabsRef"
        class="np-tabs"
        @scroll="updateScrollArrows"
      >
        <button
          v-for="tab in categoryTabs"
          :key="tab.key ?? 'all'"
          class="np-tab"
          :class="{ 'np-tab--active': categoryFilter === tab.key }"
          @click="handleCategoryFilter(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
      <button
        v-if="canScrollRight"
        class="np-tabs-arrow np-tabs-arrow--right"
        @click="scrollTabs('right')"
      >
        <ChevronRight :size="14" />
      </button>
    </div>

    <!-- Notification List -->
    <ScrollArea class="np-list">
      <!-- Loading -->
      <div v-if="store.isLoading && store.notifications.length === 0" class="np-loading">
        <div v-for="i in 4" :key="i" class="np-skeleton-item">
          <div class="np-skeleton-icon skeleton-shimmer" />
          <div class="flex-1 space-y-2">
            <div class="h-3 w-3/4 rounded-full skeleton-shimmer" />
            <div class="h-2.5 w-full rounded-full skeleton-shimmer" />
            <div class="h-2 w-1/3 rounded-full skeleton-shimmer" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="store.isEmpty" class="np-empty">
        <div class="np-empty__icon">
          <HugeiconsIcon :icon="Notification03Icon" :size="28" />
        </div>
        <p class="text-sm font-medium text-foreground/70">
          {{ t('common.no_notifications', 'No notifications') }}
        </p>
        <p class="text-xs text-muted-foreground">
          {{ t('common.no_notifications_desc', 'You\'re all caught up!') }}
        </p>
      </div>

      <!-- Items -->
      <template v-else>
        <div
          v-for="notification in store.notifications"
          :key="notification.id"
          class="np-item"
          :class="{ 'np-item--unread': !notification.is_read }"
          @click="handleNotificationClick(notification)"
        >
          <!-- Category Icon -->
          <div
            class="np-item__icon"
            :style="{ backgroundColor: getCategoryColor(notification.category) + '15', color: getCategoryColor(notification.category) }"
          >
            <component
              :is="getCategoryIcon(notification.category)"
              :size="14"
            />
          </div>


          <!-- Content -->
          <div class="np-item__content">
            <div class="flex items-start justify-between gap-2">
              <p class="np-item__title">
                {{ notification.title }}
              </p>
              <div class="flex items-center gap-0.5 shrink-0">
                <!-- Mark as read -->
                <button
                  v-if="!notification.is_read"
                  class="np-item__action"
                  :title="t('common.mark_as_read', 'Mark as read')"
                  @click="handleMarkAsRead($event, notification)"
                >
                  <Check :size="12" />
                </button>
                <!-- Dismiss -->
                <button
                  class="np-item__action"
                  :title="t('common.dismiss', 'Dismiss')"
                  @click="handleDismiss($event, notification)"
                >
                  <X :size="12" />
                </button>
              </div>
            </div>
            <p class="np-item__message">
              {{ notification.message }}
            </p>
            <div class="np-item__meta">
              <span class="np-item__time">{{ notification.time_ago }}</span>
              <span
                v-if="notification.priority === 'high' || notification.priority === 'urgent'"
                class="np-item__priority"
                :class="{
                  'np-item__priority--high': notification.priority === 'high',
                  'np-item__priority--urgent': notification.priority === 'urgent',
                }"
              >
                {{ notification.priority }}
              </span>
              <span
                v-if="notification.action_url"
                class="np-item__link"
              >
                <ExternalLink :size="10" />
                {{ t('common.view', 'View') }}
              </span>
            </div>
          </div>

          <!-- Unread dot -->
          <div v-if="!notification.is_read" class="np-item__dot" />
        </div>

        <!-- Load More -->
        <div v-if="store.hasMore" class="np-load-more">
          <Button
            variant="ghost"
            size="sm"
            class="w-full text-xs"
            :disabled="store.isLoading"
            @click="store.loadMore()"
          >
            {{ store.isLoading ? t('common.loading', 'Loading...') : t('common.load_more', 'Load more') }}
          </Button>
        </div>
      </template>
    </ScrollArea>

    <!-- Footer — See all -->
    <div class="np-footer">
      <button class="np-footer__btn" @click="handleViewAll">
        <span>{{ t('common.see_all_notifications', 'See all Notifications') }}</span>
        <ChevronRight :size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.notification-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 520px;
}

.np-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid hsl(var(--border));
}

.np-tabs-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  border-bottom: 1px solid hsl(var(--border) / 0.5);
}

.np-tabs-arrow {
  width: 24px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--muted-foreground));
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.15s;
  z-index: 2;
}
.np-tabs-arrow:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 0.4);
}
.np-tabs-arrow--left {
  border-right: 1px solid hsl(var(--border) / 0.3);
}
.np-tabs-arrow--right {
  border-left: 1px solid hsl(var(--border) / 0.3);
}

.np-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  overflow-x: auto;
  flex: 1;
  scroll-behavior: smooth;
}
.np-tabs::-webkit-scrollbar {
  display: none;
}

.np-tab {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  background: transparent;
  border: 1px solid transparent;
  border-radius: 9999px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s;
}
.np-tab:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 0.5);
}
.np-tab--active {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary) / 0.2);
}

.np-list {
  flex: 1;
  max-height: 320px;
  overflow-y: auto;
}

.np-loading {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.np-skeleton-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px;
}

.np-skeleton-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: hsl(var(--muted) / 0.7);
  flex-shrink: 0;
}

.np-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  gap: 8px;
}

.np-empty__icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--muted) / 0.5);
  color: hsl(var(--muted-foreground));
  margin-bottom: 4px;
}

.np-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background-color 0.15s;
  position: relative;
  border-bottom: 1px solid hsl(var(--border) / 0.3);
}
.np-item:hover {
  background: hsl(var(--muted) / 0.3);
}
.np-item--unread {
  background: hsl(var(--primary) / 0.03);
}
.np-item--unread:hover {
  background: hsl(var(--primary) / 0.06);
}

.np-item__icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.np-item__content {
  flex: 1;
  min-width: 0;
}

.np-item__title {
  font-size: 12.5px;
  font-weight: 600;
  color: hsl(var(--foreground));
  line-height: 1.3;
}

.np-item__message {
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
  line-height: 1.4;
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.np-item__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.np-item__time {
  font-size: 10px;
  color: hsl(var(--muted-foreground) / 0.7);
  font-weight: 500;
}

.np-item__priority {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}
.np-item__priority--high {
  background: hsl(38, 92%, 50%, 0.12);
  color: hsl(38, 92%, 50%);
}
.np-item__priority--urgent {
  background: hsl(0, 72%, 51%, 0.12);
  color: hsl(0, 72%, 51%);
}

.np-item__link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  color: hsl(var(--primary));
}

.np-item__action {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: hsl(var(--muted-foreground));
  opacity: 0;
  transition: all 0.15s;
}
.np-item:hover .np-item__action {
  opacity: 1;
}
.np-item__action:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.np-item__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: hsl(var(--primary));
  flex-shrink: 0;
  margin-top: 4px;
}

.np-load-more {
  padding: 6px 12px;
}

.np-footer {
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--card));
  flex-shrink: 0;
}
.np-footer__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 12px 16px;
  font-size: 12.5px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  transition: all 0.15s;
  cursor: pointer;
  letter-spacing: 0.1px;
}
.np-footer__btn:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 0.25);
}


/* Reuse shimmer from DataTable */
.skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background: hsl(var(--muted) / 0.7);
}
.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.25) 50%,
    transparent 100%
  );
  animation: shimmer 1.8s ease-in-out infinite;
}
:global(.dark) .skeleton-shimmer::after {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.06) 50%,
    transparent 100%
  );
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
