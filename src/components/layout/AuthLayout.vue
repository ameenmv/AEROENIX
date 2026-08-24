<script setup lang="ts">
import { Globe02Icon, Moon01Icon, Sun01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Button as Btn } from '@/components/uic/button'
import { useDarkMode } from '@/composables/useDarkMode'
import Logo from './Logo.vue'

const { locale } = useI18n()
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
  <div class="min-h-dvh flex flex-col bg-background ">
    <!-- Top bar with lang/theme -->
    <div class="flex items-center justify-end gap-1 px-4 py-2">
      <Btn
        variant="ghost"
        size="sm"
        class="h-8 px-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
        @click="toggleLanguage"
      >
        <HugeiconsIcon :icon="Globe02Icon" :size="15" />
        <span class="text-xs font-semibold">{{
          locale === 'en' ? $t('common.AR') : $t('common.EN')
        }}</span>
      </Btn>
      <Btn
        variant="ghost"
        size="icon"
        class="h-8 w-8 text-muted-foreground hover:text-foreground"
        @click="toggleDarkMode()"
      >
        <HugeiconsIcon :icon="isDark ? Sun01Icon : Moon01Icon" :size="15" />
      </Btn>
    </div>
    <!-- Content -->
    <div class="flex-1 flex flex-col items-center justify-center px-4 pb-8">
      <!-- Logo -->
      <div class="mb-8 animate-pulse hover:animate-none transition-all duration-300">
        <Logo size="lg" :animated="true" />
      </div>
      <div class="w-full max-w-[420px]">
        <slot />
      </div>
    </div>
  </div>
</template>
