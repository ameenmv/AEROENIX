<script setup lang="ts">
import { Globe02Icon, Moon01Icon, Sun01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Button as Btn } from '@/components/uic/button'
import { useDarkMode } from '@/composables/useDarkMode'
import Logo from './Logo.vue'

const { locale, t } = useI18n()
const router = useRouter()
const route = useRoute()
const { isDark, toggleDarkMode } = useDarkMode()

function toggleLanguage() {
  const newLocale = locale.value === 'en' ? 'ar' : 'en'
  const pathParts = route.path.split('/')
  pathParts[1] = newLocale
  const newPath = pathParts.join('/') || '/'
  router.push({ path: newPath, query: route.query, hash: route.hash })
}
</script>

<template>
  <div class="min-h-dvh flex flex-col lg:flex-row bg-background">
    <!-- Left/Top Pane: Visual Branding -->
    <div class="relative flex flex-col justify-between bg-zinc-950 lg:w-1/2 overflow-hidden p-8 lg:p-14 text-white">
      <!-- Dynamic gradient background -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/20 to-black z-0" />

      <!-- Subtle pattern overlay -->
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.15] z-0 pointer-events-none mix-blend-overlay" />

      <!-- Overlay blur to simulate glassmorphism on the background -->
      <div class="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/40 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none" />

      <!-- Content -->
      <div class="relative z-10 flex items-center">
        <Logo size="lg" :animated="true" />
      </div>

      <div class="relative z-10 mt-auto pb-10">
        <h1 class="text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white drop-shadow-sm">
          {{ t('auth.welcome_title', 'Welcome to Aeroenix') }}
        </h1>
        <p class="text-lg lg:text-xl text-zinc-200 max-w-md font-medium leading-relaxed drop-shadow-sm">
          {{ t('auth.welcome_subtitle', 'Experience the next generation of intuitive, lightning-fast dashboard management.') }}
        </p>
      </div>
    </div>

    <!-- Right/Bottom Pane: Form -->
    <div class="relative flex flex-col lg:w-1/2 flex-1">
      <!-- Controls -->
      <div class="absolute top-4 right-6 flex items-center gap-2 z-10">
        <Btn
          variant="ghost"
          size="sm"
          class="h-10 px-3 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
          @click="toggleLanguage"
        >
          <HugeiconsIcon :icon="Globe02Icon" :size="18" />
          <span class="text-sm font-semibold">{{ locale === 'en' ? t('common.AR', 'عربي') : t('common.EN', 'English') }}</span>
        </Btn>
        <Btn
          variant="ghost"
          size="icon"
          class="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
          @click="toggleDarkMode()"
        >
          <HugeiconsIcon :icon="isDark ? Sun01Icon : Moon01Icon" :size="18" />
        </Btn>
      </div>

      <!-- Auth Form Container -->
      <div class="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-16 lg:py-0">
        <div class="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <!-- Mobile logo fallback -->
          <div class="lg:hidden flex justify-center mb-8">
            <Logo size="lg" :animated="false" />
          </div>

          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
