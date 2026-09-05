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
  SidebarGroupLabel,
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
  // Permissions not loaded yet → hide protected items
  if (permissionStore.permissions.length === 0)
    return false
  // hasPermission handles aliases + resource normalization
  return permissionStore.hasPermission(permission)
}

function isItemVisible(item: NavItem) {
  // If no permission, rely on the custom logic
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
          // Get translated slug — could be object { en, ar } or string
          const slug
            = typeof page.slug === 'string'
              ? page.slug
              : page.slug?.[locale.value] || page.slug?.en || ''

          // Get translated title for the label
          const title
            = typeof page.title === 'string'
              ? page.title
              : page.title?.[locale.value] || page.title?.en || slug

          return {
            name: `content-${slug}`,
            label: title, // direct label, not an i18n key
            icon: File01Icon,
            to: `/admin/content/${slug}`,
            _isDirectLabel: true, // flag to skip t() translation
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

/** Get effective children for a nav item (static or dynamic) */
function getNavChildren(item: NavItem): NavItem[] {
  if (item.dynamicChildren && dynamicNavChildren[item.name]?.length) {
    return dynamicNavChildren[item.name]!
  }
  return item.children || []
}

/** Check if a nav item has children (static or dynamic) */
function hasNavChildren(item: NavItem): boolean {
  if (item.dynamicChildren)
    return true // render collapsible even while loading
  return !!(item.children && item.children.length > 0)
}

onMounted(() => {
  // Only load dynamic nav children if the user is authenticated
  if (authStore.token) {
    loadDynamicNavChildren()
  }
})
</script>

<template>
  <Sidebar collapsible="icon" :side="sidebarSide">
    <SidebarHeader class="flex h-[70px] items-center justify-center">
      <Logo :icon-only="isCollapsed" :animated="false" />
    </SidebarHeader>

    <SidebarContent class="custom-scrollbar">
      <SidebarGroup>
        <SidebarGroupLabel class="text-xs uppercase tracking-wider">
          {{ t('menu.navigation') || 'Navigation' }}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <template v-for="item in navigationConfig" :key="item.name">
              <!-- Simple item (no children) -->
              <SidebarMenuItem v-if="!hasNavChildren(item) && isItemVisible(item)">
                <SidebarMenuButton
                  as-child
                  :tooltip="t(item.label)"
                  :is-active="isActive(item.to)"
                  @contextmenu="openSidebarCtx($event, item)"
                >
                  <RouterLink :to="`${adminPrefix}${item.to?.replace('/admin', '')}`">
                    <HugeiconsIcon v-if="item.icon" :icon="item.icon" :size="20" />
                    <span>{{ t(item.label) }}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <!-- Item with children (collapsible) -->
              <Collapsible
                v-else-if="hasNavChildren(item) && isItemVisible(item)"
                v-model:open="openMenus[item.name]"
                as-child
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton :tooltip="t(item.label)">
                      <HugeiconsIcon v-if="item.icon" :icon="item.icon" :size="20" />
                      <span>{{ t(item.label) }}</span>
                      <HugeiconsIcon
                        :icon="ArrowDown01Icon"
                        :size="18"
                        class="ms-auto transition-transform duration-200"
                        :class="{ 'rotate-180': openMenus[item.name] }"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <!-- Loading state for dynamic children -->
                      <SidebarMenuSubItem v-if="item.dynamicChildren && dynamicLoading[item.name]">
                        <SidebarMenuSubButton as-child>
                          <span class="text-muted-foreground text-xs animate-pulse">{{
                            t('common.loading', 'Loading...')
                          }}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      <!-- Dynamic or static children -->
                      <SidebarMenuSubItem v-for="child in getNavChildren(item)" :key="child.name">
                        <SidebarMenuSubButton
                          v-if="isVisible(child.permission)"
                          as-child
                          :is-active="isActive(child.to)"
                        >
                          <RouterLink :to="`${adminPrefix}${child.to?.replace('/admin', '')}`">
                            <span>{{
                              (child as any)._isDirectLabel ? child.label : t(child.label)
                            }}</span>
                          </RouterLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      <!-- Empty state for dynamic children -->
                      <SidebarMenuSubItem
                        v-if="
                          item.dynamicChildren
                            && !dynamicLoading[item.name]
                            && getNavChildren(item).length === 0
                        "
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

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            :tooltip="t('menu.logout')"
            class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            @click="handleLogout"
          >
            <HugeiconsIcon :icon="Logout02Icon" :size="20" />
            <span>{{ t('menu.logout') }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
