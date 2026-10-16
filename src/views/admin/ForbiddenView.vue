<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft02Icon,
  Home01Icon,
  Logout02Icon,
  SecurityLockIcon,
  Shield01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button as Btn } from '@/components/uic/button'
import { Separator } from '@/components/uic/separator'
import { useAuthStore } from '@/stores/shared/authStore'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const attemptedPath = computed(() => {
  return (route.query.from as string) || ''
})

function goHome() {
  router.push(`/${locale.value}/admin/dashboard`)
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  }
  else {
    goHome()
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push(`/${locale.value}/admin/login`)
}
</script>

<template>
  <div class="flex-1 min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden selection:bg-rose-500/20">
    <!-- Ambient glowing backdrop effect -->
    <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div class="w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] opacity-70 animate-pulse duration-1000" />
      <div class="w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] -mt-40" />
    </div>

    <div class="relative z-10 flex flex-col items-center gap-6 text-center max-w-lg w-full">
      <!-- Forbidden Glassmorphism Card -->
      <div class="w-full rounded-3xl border border-rose-500/20 bg-card/70 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col items-center">
        <!-- Shield Icon with subtle aura -->
        <div class="relative mb-5">
          <div class="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.25)]">
            <HugeiconsIcon :icon="Shield01Icon" :size="38" />
          </div>
          <div class="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <HugeiconsIcon :icon="SecurityLockIcon" :size="16" />
          </div>
        </div>

        <!-- 403 Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-black tracking-widest uppercase mb-3">
          <span>HTTP 403</span>
          <span class="w-1 h-1 rounded-full bg-rose-400" />
          <span>{{ t('error.access_denied', 'ACCESS RESTRICTED') }}</span>
        </div>

        <!-- Title & Subtitle -->
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {{ t('error.forbidden_title', 'Permission Denied') }}
        </h1>

        <p class="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">
          {{
            t(
              'error.forbidden_description',
              'You do not have the required permissions to view this section. If you need access, please contact your hotel administrator.',
            )
          }}
        </p>

        <!-- Attempted path indicator pill (if any) -->
        <div
          v-if="attemptedPath"
          class="mt-4 px-3.5 py-1.5 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-mono text-muted-foreground max-w-full truncate flex items-center gap-2"
        >
          <span class="font-sans font-semibold text-foreground/80">{{ t('error.requested_page', 'Requested Page') }}:</span>
          <span class="truncate text-rose-400/90">{{ attemptedPath }}</span>
        </div>

        <Separator class="my-6 w-full opacity-60" />

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Btn
            variant="default"
            size="lg"
            class="w-full sm:flex-1 gap-2 rounded-xl bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20"
            @click="goHome"
          >
            <HugeiconsIcon :icon="Home01Icon" :size="18" />
            <span>{{ t('common.go_home', 'Go to Dashboard') }}</span>
          </Btn>

          <Btn
            variant="outline"
            size="lg"
            class="w-full sm:flex-1 gap-2 rounded-xl border-border/60 hover:bg-muted/50 font-medium"
            @click="goBack"
          >
            <HugeiconsIcon :icon="ArrowLeft02Icon" :size="18" />
            <span>{{ t('common.go_back', 'Go Back') }}</span>
          </Btn>
        </div>

        <!-- Switch Account / Sign Out Link -->
        <button
          type="button"
          class="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
          @click="handleLogout"
        >
          <HugeiconsIcon :icon="Logout02Icon" :size="14" />
          <span>{{ t('error.switch_account', 'Switch Account or Sign Out') }}</span>
        </button>
      </div>

      <!-- Footer Info -->
      <p class="text-[11px] text-muted-foreground/60">
        {{ t('error.forbidden_subtitle', 'This action or resource is restricted for your current role.') }}
      </p>
    </div>
  </div>
</template>
