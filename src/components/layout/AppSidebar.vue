<script setup lang="ts">
import type { NavItem } from '@/lib/navigation'
import {
  ArrowDown01Icon,
  File01Icon,
  Logout02Icon,
  PlusSignIcon,
  ViewIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { CollapsibleRoot as Collapsible, CollapsibleContent, CollapsibleTrigger } from 'reka-ui'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import Logo from '@/components/layout/Logo.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/uic/sidebar'
import { useContextMenu } from '@/composables/useContextMenu'
import { navigationConfig } from '@/lib/navigation'
import { cmsPageService } from '@/services/cmsService'
import { useAuthStore } from '@/stores/authStore'
import { usePermissionStore } from '@/stores/permissions'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { state } = useSidebar()
const { openContextMenu } = useContextMenu()

async function handleLogout() {
  await authStore.logout()
  router.push(`/${locale.value}/admin/login`)
}

const adminPrefix = computed(() => `/${locale.value}/admin`)
const openMenus = ref<Record<string, boolean>>({})

function isActive(to?: string) {
  if (!to)
    return false
  const fullPath = `${adminPrefix.value}${to.replace('/admin', '')}`
  return route.path === fullPath || route.path.startsWith(`${fullPath}/`)
}

const permissionStore = usePermissionStore()

function isVisible(permission?: string) {
  if (!permission)
    return true
  if (permissionStore.permissions.length === 0)
    return false
  return permissionStore.hasPermission(permission)
}

function isItemVisible(item: NavItem) {
  if (!isVisible(item.permission))
    return false

  return true
}

const isCollapsed = computed(() => state.value === 'collapsed')
const sidebarSide = computed(() => (locale.value === 'ar' ? 'right' : 'left'))

function openSidebarCtx(event: MouseEvent, item: NavItem) {
  if (!item.to)
    return

  const viewPath = `${adminPrefix.value}${item.to.replace('/admin', '')}`

  const actions = [
    {
      label: t('actions.view', 'View'),
      icon: ViewIcon,
      onClick: () => router.push(viewPath),
    },
  ]

  if (item.createRoute) {
    const createPath = `${adminPrefix.value}${item.createRoute.replace('/admin', '')}`
    actions.push({
      label: t('actions.create', 'Create New'),
      icon: PlusSignIcon,
      onClick: () => router.push(createPath),
      separator: true,
    } as any)
  }

  openContextMenu(event, actions)
}

// ── Dynamic navigation children (CMS pages) ──────────────────────────────────
const dynamicNavChildren = reactive<Record<string, NavItem[]>>({})
const dynamicLoading = reactive<Record<string, boolean>>({})

async function loadDynamicNavChildren() {
  for (const item of navigationConfig) {
    if (item.dynamicChildren === 'cms-pages') {
      dynamicLoading[item.name] = true
      try {
        const result = await cmsPageService.list({ translated: true, limit: 50 })
        const pages = result.data || []

        dynamicNavChildren[item.name] = pages.map((page: any) => {
          const slug
            = typeof page.slug === 'string'
              ? page.slug
              : page.slug?.[locale.value] || page.slug?.en || ''

          const title
            = typeof page.title === 'string'
              ? page.title
              : page.title?.[locale.value] || page.title?.en || slug

          return {
            name: `content-${slug}`,
            label: title,
            icon: File01Icon,
            to: `/admin/content/${slug}`,
            _isDirectLabel: true,
          } as NavItem & { _isDirectLabel?: boolean }
        })
      }
      catch (err) {
        console.error('[Sidebar] Failed to load CMS pages for nav:', err)
        dynamicNavChildren[item.name] = []
      }
      finally {
        dynamicLoading[item.name] = false
      }
    }
  }
}

function getNavChildren(item: NavItem): NavItem[] {
  if (item.dynamicChildren && dynamicNavChildren[item.name]?.length) {
    return dynamicNavChildren[item.name]!
  }
  return item.children || []
}

function hasNavChildren(item: NavItem): boolean {
  if (item.dynamicChildren)
    return true
  return !!(item.children && item.children.length > 0)
}

onMounted(() => {
  if (authStore.token) {
    loadDynamicNavChildren()
  }
})
</script>

<template>
  <Sidebar
    collapsible="icon"
    :side="sidebarSide"
    class="sidebar-container group/sidebar border-none z-20"
  >
    <SidebarHeader class="flex items-center justify-center pt-8 pb-0 border-none bg-transparent">
      <Logo :icon-only="isCollapsed" :animated="false" variant="white" />
    </SidebarHeader>

    <SidebarContent class="custom-scrollbar pt-12">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu class="gap-4 px-4 items-center flex-col">
            <template v-for="(item, index) in navigationConfig" :key="item.name">
              <!-- Simple item (no children) -->
              <SidebarMenuItem
                v-if="!hasNavChildren(item) && isItemVisible(item)"
                class="w-full sidebar-item-cascade"
                :style="{ '--stagger-i': index }"
              >
                <SidebarMenuButton
                  as-child
                  :tooltip="t(item.label)"
                  :is-active="isActive(item.to)"
                  @contextmenu="openSidebarCtx($event, item)"
                  class="sidebar-custom-btn relative before:absolute before:inset-y-[20%] before:start-[-12px] before:w-[3px] before:rounded-r-md before:bg-white before:opacity-0 before:transition-all data-[active=true]:before:opacity-100 data-[active=true]:before:bg-[#002c6d] active:scale-[0.97] transition-all duration-200"
                >
                  <RouterLink :to="`${adminPrefix}${item.to?.replace('/admin', '')}`">
                    <HugeiconsIcon v-if="item.icon" :icon="item.icon" :size="20" class="btn-icon" />
                    <span class="ml-3 font-medium group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all duration-100">{{ t(item.label) }}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <!-- Item with children (collapsible) -->
              <Collapsible
                v-else-if="hasNavChildren(item) && isItemVisible(item)"
                v-model:open="openMenus[item.name]"
                as-child
              >
                <SidebarMenuItem
                  class="w-full sidebar-item-cascade"
                  :style="{ '--stagger-i': index }"
                >
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton
                      :tooltip="t(item.label)"
                      class="sidebar-custom-btn relative before:absolute before:inset-y-[20%] before:start-[-12px] before:w-[3px] before:rounded-r-md before:bg-white before:opacity-0 before:transition-all data-[active=true]:before:opacity-100 data-[active=true]:before:bg-[#002c6d] active:scale-[0.97] transition-all duration-200 w-full justify-start"
                      :is-active="item.children && item.children.some((child) => isActive(child.to))"
                    >
                      <HugeiconsIcon v-if="item.icon" :icon="item.icon" :size="20" class="btn-icon" />
                      <span class="ml-3 font-medium group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all duration-100">{{ t(item.label) }}</span>
                      <HugeiconsIcon
                        :icon="ArrowDown01Icon"
                        :size="16"
                        class="ms-auto transition-transform duration-100 group-data-[collapsible=icon]:hidden"
                        :class="{ 'rotate-180': openMenus[item.name] }"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <!-- Loading state for dynamic children -->
                      <SidebarMenuSubItem
                        v-if="item.dynamicChildren && dynamicLoading[item.name]"
                        class="sidebar-subitem-cascade"
                      >
                        <SidebarMenuSubButton as-child>
                          <span class="text-muted-foreground text-xs animate-pulse">{{
                            t('common.loading', 'Loading...')
                          }}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      <!-- Dynamic or static children -->
                      <SidebarMenuSubItem
                        v-for="(child, childIndex) in getNavChildren(item)"
                        :key="child.name"
                        class="sidebar-subitem-cascade"
                        :style="{ '--stagger-i': childIndex }"
                      >
                        <SidebarMenuSubButton
                          v-if="isVisible(child.permission)"
                          as-child
                          :is-active="isActive(child.to)"
                          class="relative before:absolute before:inset-y-[20%] before:start-[-12px] before:w-[3px] before:rounded-r-md before:bg-white before:opacity-0 before:transition-all data-[active=true]:before:opacity-100 data-[active=true]:before:bg-[#002c6d] active:scale-[0.97] transition-all"
                        >
                          <RouterLink :to="`${adminPrefix}${child.to?.replace('/admin', '')}`">
                            <span>{{ (child as any)._isDirectLabel ? child.label : t(child.label) }}</span>
                          </RouterLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      <!-- Empty state for dynamic children -->
                      <SidebarMenuSubItem
                        v-if="item.dynamicChildren && !dynamicLoading[item.name] && getNavChildren(item).length === 0"
                        class="sidebar-subitem-cascade"
                      >
                        <SidebarMenuSubButton as-child>
                          <span class="text-muted-foreground text-xs italic">{{
                            t('cms.no_pages', 'No pages')
                          }}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </template>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="pb-8">
      <SidebarMenu class="px-4">
        <SidebarMenuItem class="w-full flex justify-center">
          <SidebarMenuButton
            :tooltip="t('menu.logout')"
            class="sidebar-custom-btn active:scale-[0.97] transition-all hover:bg-destructive shadow-none bg-transparent hover:text-white w-full justify-start"
            @click="handleLogout"
          >
            <HugeiconsIcon :icon="Logout02Icon" :size="20" class="btn-icon text-white" />
            <span class="ml-3 font-medium group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all duration-100">{{ t('menu.logout') }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>

<style>
/* Target the inner Sidebar container */
.sidebar-container [data-sidebar='sidebar'],
[data-mobile='true'][data-sidebar='sidebar'] {
  background-color: #002152 !important;
  color: white !important;
  border-radius: 22px !important;
  box-shadow: 0px 4px 8px rgba(107, 122, 153, 0.1) !important;
  border: none !important;
  margin: 16px 8px !important;
  height: calc(100svh - 32px) !important;
}
/* Sidebar item base state */
.sidebar-custom-btn {
  width: 100% !important;
  height: 40px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0px 4px 8px rgba(107, 122, 153, 0.1) !important;
  border-radius: 15px !important;
  color: white !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  padding: 0 12px !important;
}
/* Collapsed state adjustments */
.group-data-\[collapsible\=icon\] .sidebar-custom-btn {
  width: 40px !important;
  height: 40px !important;
  justify-content: center !important;
  padding: 0 !important;
}
/* Active sidebar item state */
.sidebar-custom-btn[data-active='true'] {
  background: #ffffff !important;
  border: 0.69px solid #f2f2f7 !important;
  color: #002c6d !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}
/* Hover spotlight effect */
.sidebar-custom-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.sidebar-custom-btn:hover::after {
  opacity: 1;
}
/* Cascading entrance animations */
.sidebar-item-cascade {
  animation: sidebar-slide-in 0.5s var(--ease-out-expo, ease) both;
  animation-delay: calc(var(--stagger-i, 0) * 40ms);
}
.sidebar-subitem-cascade {
  animation: sidebar-slide-in 0.4s var(--ease-out-expo, ease) both;
  animation-delay: calc(var(--stagger-i, 0) * 30ms);
}
@keyframes sidebar-slide-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes sidebar-slide-in-rtl {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
html[dir='rtl'] .sidebar-item-cascade,
html[dir='rtl'] .sidebar-subitem-cascade {
  animation-name: sidebar-slide-in-rtl;
}
.sidebar-custom-btn[data-active='true'] .btn-icon {
  color: #002c6d !important;
  fill: #002c6d !important;
}
/* ── Sub-menu container ────────────────────────────────────────────────── */
.sidebar-container [data-slot='sidebar-menu-sub'] {
  border-left-color: rgba(255, 255, 255, 0.2) !important;
  margin-left: 1.25rem !important;
  margin-right: 0.75rem !important;
  padding-left: 0.75rem !important;
  gap: 0.25rem !important;
  padding-top: 0.375rem !important;
  padding-bottom: 0.25rem !important;
}
/* ── Sub-menu button base state ────────────────────────────────────────── */
.sidebar-container [data-slot='sidebar-menu-sub-button'] {
  color: rgba(255, 255, 255, 0.7) !important;
  border-radius: 10px !important;
  padding: 0.375rem 0.75rem !important;
  height: 32px !important;
  font-size: 0.8125rem !important;
  transition: all 0.15s ease !important;
}
.sidebar-container [data-slot='sidebar-menu-sub-button']:hover {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
}
/* ── Sub-menu button active state ──────────────────────────────────────── */
.sidebar-container [data-slot='sidebar-menu-sub-button'][data-active='true'] {
  color: #002c6d !important;
  background: #ffffff !important;
  font-weight: 500 !important;
}
/* ── Build info ────────────────────────────────────────────────────────── */
.build-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  opacity: 0.35;
  transition: opacity 0.2s ease;
  padding: 0 12px;
}
.build-info:hover {
  opacity: 0.7;
}
.build-info-version {
  font-size: 11px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}
.build-info-timestamp {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}
/* ── Locked sidebar items (plan-restricted) ────────────────────────────── */
.sidebar-locked-btn {
  opacity: 0.45 !important;
  border: 1px dashed rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.04) !important;
  box-shadow: none !important;
}
.sidebar-locked-btn:hover {
  opacity: 0.65 !important;
  border-color: rgba(245, 158, 11, 0.4) !important;
  background: rgba(245, 158, 11, 0.08) !important;
}
</style>
