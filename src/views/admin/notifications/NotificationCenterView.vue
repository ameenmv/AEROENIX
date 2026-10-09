<script setup lang="ts">
import type { PlatformNotification, NotificationCategory } from '@/types/entities/platformNotification'
import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  CheckCheck,
  ChevronDown,
  CreditCard,
  ExternalLink,
  Eye,
  MessageSquare,
  Share2,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Button } from '@/components/uic/button'
import { NOTIFICATION_CATEGORY_META } from '@/types/entities/platformNotification'
import { navigateToNotification } from '@/utils/notificationNavigation'
import { useNotificationStore } from '@/stores/shared/notification'

const { t, locale } = useI18n()
const router = useRouter()
const store = useNotificationStore()

const showUnreadOnly = ref(false)

// Dismiss confirmation
const showDismissConfirm = ref(false)
const dismissTarget = ref<PlatformNotification | null>(null)

// Category tabs
const categories: Array<{ key: string | null; label: string; icon: any; color: string }> = [
  { key: null, label: 'All', icon: Bell, color: 'hsl(var(--foreground))' },
  { key: 'takeover', label: 'Takeover', icon: UserCheck, color: '#3B82F6' },
  { key: 'conversation', label: 'Priority', icon: MessageSquare, color: '#EF4444' },
  { key: 'booking', label: 'Bookings', icon: Calendar, color: '#C5A869' },
  { key: 'payment', label: 'Payments', icon: CreditCard, color: '#10B981' },
  { key: 'channel', label: 'Channels', icon: Share2, color: '#8B5CF6' },
  { key: 'team', label: 'Team', icon: Users, color: '#6366F1' },
  { key: 'system', label: 'System', icon: AlertTriangle, color: '#F59E0B' },
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

const filteredNotifications = computed(() => {
  let items = store.notifications
  if (showUnreadOnly.value) {
    items = items.filter(n => !n.is_read)
  }
  return items
})

function handleCategoryFilter(key: string | null) {
  store.filterByCategory(key)
}

function handleNotificationClick(notification: PlatformNotification) {
  store.markAsRead(notification.id)
  if (notification.action_url) {
    navigateToNotification(notification, router, locale.value)
  }
}

function openDismissConfirm(notification: PlatformNotification) {
  dismissTarget.value = notification
  showDismissConfirm.value = true
}

async function confirmDismiss() {
  if (!dismissTarget.value) return
  await store.dismissNotification(dismissTarget.value.id)
  showDismissConfirm.value = false
  dismissTarget.value = null
}

function cancelDismiss() {
  showDismissConfirm.value = false
  dismissTarget.value = null
}

function handleMarkAsRead(notification: PlatformNotification) {
  store.markAsRead(notification.id)
}

function handleMarkAllAsRead() {
  store.markAllAsRead()
}

async function handleGenerateDemo() {
  await store.generateDemo(false)
}

function getPriorityClass(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'nc-priority nc-priority--urgent'
    case 'high':
      return 'nc-priority nc-priority--high'
    case 'low':
      return 'nc-priority nc-priority--low'
    default:
      return ''
  }
}

onMounted(() => {
  store.fetchNotifications(1)
})
</script>

<template>
  <ModularView>
    <div class="nc-container">
      <!-- Page Header -->
      <div class="nc-header">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">
            {{ t('common.notification_center', 'Notification Center') }}
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('common.notification_center_desc', 'Stay updated with all your hotel notifications') }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            class="gap-1.5 text-xs"
            @click="handleGenerateDemo"
          >
            <Sparkles :size="13" />
            {{ t('common.generate_demo', 'Generate Demo') }}
          </Button>
          <Button
            v-if="store.unreadCount > 0"
            variant="outline"
            size="sm"
            class="gap-1.5 text-xs"
            @click="handleMarkAllAsRead"
          >
            <CheckCheck :size="13" />
            {{ t('common.mark_all_read', 'Mark All Read') }}
          </Button>
        </div>
      </div>

      <!-- Toolbar: Category + Filters -->
      <div class="nc-toolbar">
        <div class="nc-categories">
          <button
            v-for="cat in categories"
            :key="cat.key ?? 'all'"
            class="nc-cat-btn"
            :class="{ 'nc-cat-btn--active': store.activeCategory === cat.key }"
            @click="handleCategoryFilter(cat.key)"
          >
            <component
              :is="cat.icon"
              :size="14"
              :style="{ color: store.activeCategory === cat.key ? cat.color : undefined }"
            />
            <span>{{ cat.label }}</span>
          </button>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="nc-unread-toggle"
            :class="{ 'nc-unread-toggle--active': showUnreadOnly }"
            @click="showUnreadOnly = !showUnreadOnly"
          >
            <span class="nc-unread-toggle__dot" />
            <span class="nc-unread-toggle__label">{{ t('common.unread_only', 'Unread only') }}</span>
          </button>
          <div class="nc-total-badge">
            {{ store.pagination.total }} {{ t('common.total', 'total') }}
          </div>
        </div>
      </div>

      <!-- Notification List -->
      <div class="nc-list">
        <!-- Loading -->
        <div v-if="store.isLoading && store.notifications.length === 0" class="nc-loading">
          <div v-for="i in 6" :key="i" class="nc-skeleton-card">
            <div class="nc-skeleton-icon skeleton-shimmer" />
            <div class="flex-1 space-y-2.5">
              <div class="h-3.5 w-2/3 rounded-full skeleton-shimmer" />
              <div class="h-3 w-full rounded-full skeleton-shimmer" />
              <div class="h-2.5 w-1/4 rounded-full skeleton-shimmer" />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredNotifications.length === 0 && !store.isLoading" class="nc-empty">
          <div class="nc-empty__icon-wrap">
            <Bell :size="32" />
          </div>
          <h3 class="text-base font-semibold text-foreground/80 mt-3">
            {{ t('common.no_notifications', 'No notifications') }}
          </h3>
          <p class="text-sm text-muted-foreground mt-1 max-w-sm text-center">
            {{ showUnreadOnly
              ? t('common.no_unread_notifications', 'All caught up! No unread notifications.')
              : t('common.no_notifications_desc', 'When new bookings, messages, or system events occur, they\'ll appear here.')
            }}
          </p>
        </div>

        <!-- Notification Cards -->
        <template v-else>
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="nc-card"
            :class="{
              'nc-card--unread': !notification.is_read,
              'nc-card--urgent': notification.priority === 'urgent',
            }"
            @click="handleNotificationClick(notification)"
          >
            <!-- Category Icon -->
            <div
              class="nc-card__icon"
              :style="{
                backgroundColor: getCategoryColor(notification.category) + '12',
                color: getCategoryColor(notification.category),
              }"
            >
              <component
                :is="getCategoryIcon(notification.category)"
                :size="18"
              />
            </div>

            <!-- Content -->
            <div class="nc-card__body">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h4 class="nc-card__title">
                      {{ notification.title }}
                    </h4>
                    <span
                      v-if="notification.priority !== 'normal'"
                      :class="getPriorityClass(notification.priority)"
                    >
                      {{ notification.priority }}
                    </span>
                  </div>
                  <p class="nc-card__message">
                    {{ notification.message }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="nc-card__actions">
                  <button
                    v-if="!notification.is_read"
                    class="nc-action-btn nc-action-btn--read"
                    :title="t('common.mark_as_read', 'Mark as read')"
                    @click.stop="handleMarkAsRead(notification)"
                  >
                    <Check :size="13" />
                    <span class="nc-action-btn__label">{{ t('common.read', 'Read') }}</span>
                  </button>
                  <button
                    v-if="notification.action_url"
                    class="nc-action-btn nc-action-btn--view"
                    :title="t('common.view_details', 'View details')"
                    @click.stop="handleNotificationClick(notification)"
                  >
                    <Eye :size="13" />
                    <span class="nc-action-btn__label">{{ t('common.view', 'View') }}</span>
                  </button>
                  <button
                    class="nc-action-btn nc-action-btn--delete"
                    :title="t('common.delete', 'Delete')"
                    @click.stop="openDismissConfirm(notification)"
                  >
                    <Trash2 :size="13" />
                  </button>
                </div>
              </div>

              <!-- Meta -->
              <div class="nc-card__meta">
                <span class="nc-card__time">{{ notification.time_ago }}</span>
                <span class="nc-card__category-label" :style="{ color: getCategoryColor(notification.category) }">
                  {{ NOTIFICATION_CATEGORY_META[notification.category as NotificationCategory]?.label || notification.category }}
                </span>
                <span
                  v-if="notification.action_url"
                  class="nc-card__view-link"
                >
                  <ExternalLink :size="11" />
                  {{ t('common.view_details', 'View details') }}
                </span>
              </div>
            </div>

            <!-- Unread indicator -->
            <div v-if="!notification.is_read" class="nc-card__unread-dot" />
          </div>

          <!-- Load More -->
          <div v-if="store.hasMore" class="nc-load-more">
            <Button
              variant="outline"
              size="sm"
              class="gap-2"
              :disabled="store.isLoading"
              @click="store.loadMore()"
            >
              <ChevronDown :size="14" />
              {{ store.isLoading ? t('common.loading', 'Loading...') : t('common.load_more', 'Load more notifications') }}
            </Button>
          </div>
        </template>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :show="showDismissConfirm"
      :title="t('common.delete_notification', 'Delete Notification')"
      :message="t('common.delete_notification_confirm', 'Are you sure you want to delete this notification? This action cannot be undone.')"
      :confirm-label="t('common.yes_delete', 'Yes, Delete')"
      :cancel-label="t('common.cancel', 'Cancel')"
      variant="destructive"
      @confirm="confirmDismiss"
      @cancel="cancelDismiss"
    />
  </ModularView>
</template>

<style scoped>
.nc-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.nc-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  flex-wrap: wrap;
}

.nc-categories {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
}
.nc-categories::-webkit-scrollbar {
  display: none;
}

.nc-cat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  background: transparent;
  border: 1px solid transparent;
  border-radius: 9999px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}
.nc-cat-btn:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 0.5);
}
.nc-cat-btn--active {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.08);
  border-color: hsl(var(--primary) / 0.2);
}

/* Unread Toggle Button */
.nc-unread-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 9999px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--card));
  cursor: pointer;
  transition: all 0.2s;
}
.nc-unread-toggle:hover {
  border-color: hsl(var(--primary) / 0.3);
}
.nc-unread-toggle--active {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary) / 0.3);
}
.nc-unread-toggle__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: hsl(var(--muted-foreground) / 0.4);
  transition: all 0.2s;
}
.nc-unread-toggle--active .nc-unread-toggle__dot {
  background: hsl(var(--primary));
  box-shadow: 0 0 6px hsl(var(--primary) / 0.4);
}
.nc-unread-toggle__label {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  transition: color 0.2s;
}
.nc-unread-toggle--active .nc-unread-toggle__label {
  color: hsl(var(--primary));
}

/* Total Badge */
.nc-total-badge {
  padding: 4px 10px;
  border-radius: 9999px;
  background: hsl(var(--muted) / 0.5);
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}

/* Notification List */
.nc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nc-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nc-skeleton-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 14px;
}

.nc-skeleton-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;
}

.nc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
}

.nc-empty__icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--muted) / 0.4);
  color: hsl(var(--muted-foreground));
}

/* Notification Card */
.nc-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.nc-card:hover {
  border-color: hsl(var(--foreground) / 0.12);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
.nc-card--unread {
  background: hsl(var(--primary) / 0.02);
  border-color: hsl(var(--primary) / 0.12);
}
.nc-card--unread:hover {
  background: hsl(var(--primary) / 0.04);
  border-color: hsl(var(--primary) / 0.2);
}
.nc-card--urgent {
  border-left: 3px solid hsl(0, 72%, 51%);
}

.nc-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nc-card__body {
  flex: 1;
  min-width: 0;
}

.nc-card__title {
  font-size: 13.5px;
  font-weight: 700;
  color: hsl(var(--foreground));
  line-height: 1.3;
}

.nc-card__message {
  font-size: 12.5px;
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
  margin-top: 4px;
}

.nc-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.nc-card__time {
  font-size: 11px;
  color: hsl(var(--muted-foreground) / 0.6);
  font-weight: 500;
}

.nc-card__category-label {
  font-size: 11px;
  font-weight: 600;
}

.nc-card__view-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--primary));
  transition: opacity 0.15s;
}
.nc-card__view-link:hover {
  opacity: 0.8;
}

/* Action Buttons */
.nc-card__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}
.nc-card:hover .nc-card__actions {
  opacity: 1;
}

.nc-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.nc-action-btn__label {
  display: none;
}
@media (min-width: 768px) {
  .nc-card:hover .nc-action-btn__label {
    display: inline;
  }
}

/* Read button */
.nc-action-btn--read {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.08);
}
.nc-action-btn--read:hover {
  background: hsl(var(--primary) / 0.15);
}

/* View button */
.nc-action-btn--view {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.5);
}
.nc-action-btn--view:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted));
}

/* Delete button */
.nc-action-btn--delete {
  color: hsl(var(--muted-foreground));
  background: transparent;
  padding: 4px 6px;
}
.nc-action-btn--delete:hover {
  color: hsl(0, 72%, 51%);
  background: hsl(0, 72%, 51%, 0.1);
}

.nc-card__unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: hsl(var(--primary));
  flex-shrink: 0;
  margin-top: 6px;
}

/* Priority badges */
.nc-priority {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}
.nc-priority--urgent {
  background: hsl(0, 72%, 51%, 0.12);
  color: hsl(0, 72%, 51%);
}
.nc-priority--high {
  background: hsl(38, 92%, 50%, 0.12);
  color: hsl(38, 92%, 50%);
}
.nc-priority--low {
  background: hsl(var(--muted) / 0.5);
  color: hsl(var(--muted-foreground));
}

.nc-load-more {
  display: flex;
  justify-content: center;
  padding: 16px;
}

/* Shimmer (reused) */
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
