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
    class="group/sidebar border-r z-20"
  >
    <SidebarHeader class="flex items-center justify-center pt-8 pb-0 border-none bg-transparent">
      <Logo :icon-only="isCollapsed" :animated="false" variant="white" />
    </SidebarHeader>

    <SidebarContent class="custom-scrollbar pt-4">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu class="gap-4 px-4 items-center flex-col">
            <template v-for="(item, index) in navigationConfig" :key="item.name">
              <!-- Simple item (no children) -->
              <SidebarMenuItem
                v-if="!hasNavChildren(item) && isItemVisible(item)"
                class="w-full "
                :style="{ '--stagger-i': index }"
              >
                <SidebarMenuButton
                  as-child
                  :tooltip="t(item.label)"
                  :is-active="isActive(item.to)"
                  @contextmenu="openSidebarCtx($event, item)"
                  class="relative transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-foreground data-[active=true]:text-sidebar shadow-sm data-[active=true]:font-semibold w-full justify-start rounded-md h-10 px-3"
                >
                  <RouterLink :to="`${adminPrefix}${item.to?.replace('/admin', '')}`">
                    <HugeiconsIcon v-if="item.icon" :icon="item.icon" :size="20" class="size-5 shrink-0" />
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
                  class="w-full "
                  :style="{ '--stagger-i': index }"
                >
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton
                      :tooltip="t(item.label)"
                      class="relative transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-foreground data-[active=true]:text-sidebar shadow-sm data-[active=true]:font-semibold w-full justify-start rounded-md h-10 px-3"
                      :is-active="item.children && item.children.some((child) => isActive(child.to))"
                    >
                      <HugeiconsIcon v-if="item.icon" :icon="item.icon" :size="20" class="size-5 shrink-0" />
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
                        class=""
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
                        class=""
                        :style="{ '--stagger-i': childIndex }"
                      >
                        <SidebarMenuSubButton
                          v-if="isVisible(child.permission)"
                          as-child
                          :is-active="isActive(child.to)"
                          class="transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-foreground data-[active=true]:text-sidebar shadow-sm rounded-md"
                        >
                          <RouterLink :to="`${adminPrefix}${child.to?.replace('/admin', '')}`">
                            <span>{{ (child as any)._isDirectLabel ? child.label : t(child.label) }}</span>
                          </RouterLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      <!-- Empty state for dynamic children -->
                      <SidebarMenuSubItem
                        v-if="item.dynamicChildren && !dynamicLoading[item.name] && getNavChildren(item).length === 0"
                        class=""
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
            class="relative transition-all duration-200 hover:bg-destructive hover:text-white text-destructive w-full justify-start rounded-md h-10 px-3"
            @click="handleLogout"
          >
            <HugeiconsIcon :icon="Logout02Icon" :size="20" class="size-5 shrink-0" />
            <span class="ml-3 font-medium group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all duration-100">{{ t('menu.logout') }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>

