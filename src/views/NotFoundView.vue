<script setup lang="ts">
import { ArrowLeft02Icon, Home01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Logo from '@/components/layout/Logo.vue'
import { Button as Btn } from '@/components/uic/button'
import { Separator } from '@/components/uic/separator'

const { t, locale } = useI18n()
const router = useRouter()
function goHome() {
  router.push(`/${locale.value}/admin/dashboard`)
}
function goBack() {
  window.history.length > 1 ? router.back() : goHome()
}
</script>

<template>
  <div class="min-h-dvh flex flex-col items-center justify-center bg-background px-4">
    <div class="flex flex-col items-center gap-8 text-center max-w-md">
      <!-- Logo -->
      <Logo size="lg" />
      <!-- 404 number with glow -->
      <div class="relative">
        <h1
          class="text-9xl font-black tracking-tighter text-primary drop-shadow-[0_0_40px_rgba(237,31,74,0.3)]"
        >
          404
        </h1>
      </div>
      <Separator class="w-24" />
      <!-- Message -->
      <div class="space-y-3">
        <h2 class="text-2xl font-bold text-foreground">
          {{ t('error.page_not_found', 'Page Not Found') }}
        </h2>
        <p class="text-sm text-muted-foreground leading-relaxed">
          {{
            t(
              'error.not_found_description',
              "Sorry, the page you're looking for doesn't exist or has been moved.",
            )
          }}
        </p>
      </div>
      <!-- Buttons -->
      <div class="flex gap-3 w-full mt-1">
        <Btn variant="primary" size="lg" class="flex-1 gap-2" @click="goHome">
          <HugeiconsIcon :icon="Home01Icon" :size="18" />
          {{ t('common.go_home', 'Home') }}
        </Btn>
        <Btn variant="outline" size="lg" class="flex-1 gap-2" @click="goBack">
          <HugeiconsIcon :icon="ArrowLeft02Icon" :size="18" />
          {{ t('common.go_back', 'Back') }}
        </Btn>
      </div>
    </div>
  </div>
</template>
