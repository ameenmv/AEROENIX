<script setup lang="ts">
import {
  Globe02Icon,
  Logout02Icon,
  Moon01Icon,
  Notification03Icon,
  Settings01Icon,
  Sun01Icon,
  UserCircleIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Accessibility } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import Logo from '@/components/layout/Logo.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/uic/breadcrumb'
import { Button as Btn } from '@/components/uic/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'
import { Separator } from '@/components/uic/separator'
import { SidebarTrigger } from '@/components/uic/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/uic/tooltip'
import { useAccessibility } from '@/composables/useAccessibility'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useContextMenu } from '@/composables/useContextMenu'
import { useDarkMode } from '@/composables/useDarkMode'
import { useAuthStore } from '@/stores/authStore'

const { locale, t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { isDark, toggleDarkMode } = useDarkMode()
const { items: breadcrumbItems } = useBreadcrumb()
const { openContextMenu } = useContextMenu()
const { toggleBar: toggleA11yBar, prefs: a11yPrefs } = useAccessibility()

async function handleLogout() {
  await authStore.logout()
  router.push(`/${locale.value}/admin/login`)
}

function switchLocale(lang: 'en' | 'ar') {
  const pathParts = route.path.split('/')
  pathParts[1] = lang
  router.push({ path: pathParts.join('/') || '/', query: route.query, hash: route.hash })
}

function toggleLanguage() {
  switchLocale(locale.value === 'en' ? 'ar' : 'en')
}

function openLangCtx(event: MouseEvent) {
  openContextMenu(event, [
    {
      label: t('common.EN', 'English'),
      icon: Globe02Icon,
      onClick: () => switchLocale('en'),
    },
    {
      label: t('common.AR', 'Arabic'),
      icon: Globe02Icon,
      onClick: () => switchLocale('ar'),
    },
  ])
}

function openThemeCtx(event: MouseEvent) {
  openContextMenu(event, [
    {
      label: t('common.light_mode', 'Light mode'),
      icon: Sun01Icon,
      onClick: () => {
        if (isDark.value)
          toggleDarkMode()
      },
    },
    {
      label: t('common.dark_mode', 'Dark mode'),
      icon: Moon01Icon,
      onClick: () => {
        if (!isDark.value)
          toggleDarkMode()
      },
    },
  ])
}

function openProfileCtx(event: MouseEvent) {
  openContextMenu(event, [
    {
      label: t('menu.profile', 'Profile'),
      icon: UserCircleIcon,
      onClick: () => router.push(`/${locale.value}/admin/profile`),
    },
    {
      label: t('menu.settings', 'Settings'),
      icon: Settings01Icon,
      onClick: () => router.push(`/${locale.value}/admin/settings`),
    },
    {
      label: t('menu.logout', 'Logout'),
      icon: Logout02Icon,
      variant: 'delete',
      separator: true,
      onClick: () => handleLogout(),
    },
  ])
}
</script>

<template>
  <header
    class="sticky top-0 w-full h-12 px-3 z-40 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300 flex items-center gap-2"
  >
    <!-- Left: Sidebar trigger + breadcrumb -->
    <div class="flex items-center gap-1.5 shrink-0">
      <SidebarTrigger class="h-7 w-7" />
      <Separator
        orientation="vertical"
        class="mx-1 data-[orientation=vertical]:h-4 hidden md:block"
      />
      <Breadcrumb class="hidden md:flex">
        <BreadcrumbList>
          <template v-for="(crumb, index) in breadcrumbItems" :key="index">
            <BreadcrumbSeparator v-if="index > 0" />
            <BreadcrumbItem>
              <BreadcrumbLink v-if="crumb.to && index < breadcrumbItems.length - 1" as-child>
                <RouterLink :to="crumb.to" class="text-xs">
                  {{ crumb.label }}
                </RouterLink>
              </BreadcrumbLink>
              <BreadcrumbPage v-else class="text-xs font-semibold">
                {{ crumb.label }}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </template>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
    <!-- Center: Mobile-only logo -->
    <div class="flex-1 flex justify-center md:hidden">
      <Logo :size="48" :animated="false" />
    </div>
    <!-- Right: Actions -->
    <div class="ms-auto flex items-center gap-1">
      <TooltipProvider :delay-duration="300">
        <!-- Accessibility toggle -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Btn
              variant="ghost"
              size="icon"
              class="h-8 w-8 transition-colors"
              :class="[
                a11yPrefs.barVisible
                  ? 'text-primary bg-primary/10 hover:bg-primary/20'
                  : 'text-muted-foreground hover:text-foreground',
              ]"
              :aria-label="t('common.Accessibility', 'Accessibility')"
              :aria-pressed="a11yPrefs.barVisible"
              @click="toggleA11yBar"
            >
              <Accessibility :size="15" />
            </Btn>
          </TooltipTrigger>
          <TooltipContent side="bottom" :side-offset="4">
            <p class="text-xs">
              {{ t('common.Accessibility', 'Accessibility') }}
            </p>
          </TooltipContent>
        </Tooltip>
        <!-- Language toggle -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Btn
              variant="ghost"
              size="sm"
              class="h-8 px-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
              @click="toggleLanguage"
              @contextmenu="openLangCtx"
            >
              <HugeiconsIcon :icon="Globe02Icon" :size="15" />
              <span class="text-xs font-semibold">{{
                locale === 'en' ? $t('common.AR') : $t('common.EN')
              }}</span>
            </Btn>
          </TooltipTrigger>
          <TooltipContent side="bottom" :side-offset="4">
            <p class="text-xs">
              {{ locale === 'en' ? $t('common.Switch to Arabic') : $t('common.Switch to English') }}
            </p>
          </TooltipContent>
        </Tooltip>
        <!-- Dark mode toggle -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Btn
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-muted-foreground hover:text-foreground"
              :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              @click="toggleDarkMode()"
              @contextmenu="openThemeCtx"
            >
              <HugeiconsIcon :icon="isDark ? Sun01Icon : Moon01Icon" :size="15" />
            </Btn>
          </TooltipTrigger>
          <TooltipContent side="bottom" :side-offset="4">
            <p class="text-xs">
              {{
                isDark ? t('common.light_mode', 'Light mode') : t('common.dark_mode', 'Dark mode')
              }}
            </p>
          </TooltipContent>
        </Tooltip>
        <!-- Notifications -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Btn
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-muted-foreground hover:text-foreground relative"
            >
              <HugeiconsIcon :icon="Notification03Icon" :size="15" />
            </Btn>
          </TooltipTrigger>
          <TooltipContent side="bottom" :side-offset="4">
            <p class="text-xs">
              {{ t('common.notifications', 'Notifications') }}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Separator orientation="vertical" class="mx-1 data-[orientation=vertical]:h-4" />
      <!-- Profile dropdown -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Btn
            variant="ghost"
            size="sm"
            class="h-8 gap-2 px-2 hover:bg-accent"
            @contextmenu="openProfileCtx"
          >
            <div class="w-6 h-6 flex items-center justify-center bg-primary rounded-full shrink-0 overflow-hidden">
              <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" alt="Avatar" class="w-full h-full object-cover">
              <HugeiconsIcon v-else :icon="UserCircleIcon" :size="16" class="text-primary-foreground" />
            </div>
            <span
              class="text-xs font-medium text-foreground hidden sm:inline-block max-w-[100px] truncate"
            >
              {{ authStore.user?.name || 'Guest' }}
            </span>
          </Btn>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-[200px]">
          <DropdownMenuLabel class="font-normal px-3 py-2">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 flex items-center justify-center bg-primary rounded-full shrink-0 overflow-hidden"
              >
                <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" alt="Avatar" class="w-full h-full object-cover">
                <HugeiconsIcon v-else :icon="UserCircleIcon" :size="18" class="text-primary-foreground" />
              </div>
              <div class="flex flex-col min-w-0">
                <p class="text-sm font-semibold leading-tight truncate">
                  {{ authStore.user?.name || 'Guest' }}
                </p>
                <p class="text-[11px] text-muted-foreground leading-tight truncate">
                  {{ authStore.user?.email || 'user@abajora.com' }}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 cursor-pointer">
            <HugeiconsIcon :icon="UserCircleIcon" :size="14" />
            {{ t('menu.profile', 'Profile') }}
          </DropdownMenuItem>
          <DropdownMenuItem class="gap-2 cursor-pointer">
            <HugeiconsIcon :icon="Settings01Icon" :size="14" />
            {{ t('menu.settings', 'Settings') }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            class="gap-2 text-destructive focus:text-destructive cursor-pointer"
            @click="handleLogout"
          >
            <HugeiconsIcon :icon="Logout02Icon" :size="14" />
            {{ t('menu.logout') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
