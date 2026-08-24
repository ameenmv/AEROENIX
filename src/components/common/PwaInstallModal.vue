<script setup lang="ts">
import { Bell, Download, Rocket, X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { usePwaInstall } from '@/composables/shared/usePwaInstall'

const { showInstallPrompt, installPwa, dismissPrompt } = usePwaInstall()
const { t } = useI18n()
</script>

<template>
  <Dialog :open="showInstallPrompt" @update:open="dismissPrompt()">
    <DialogContent class="sm:max-w-[480px] p-0 rounded-[32px] border border-border bg-card overflow-hidden outline-none">
      <!-- Close Button -->
      <button
        class="absolute top-[16px] right-[16px] flex items-center justify-center w-[32px] h-[32px] rounded-full bg-muted dark:bg-slate-800 hover:bg-muted/80 dark:hover:bg-slate-700 transition-colors z-10"
        @click="dismissPrompt"
      >
        <X class="w-[16px] h-[16px] text-foreground dark:text-slate-200" />
      </button>

      <!-- Content -->
      <div class="p-[32px] flex flex-col items-center gap-[24px]">
        <!-- App Icon Wrapper -->
        <div class="pb-[8px] pt-[16px]">
          <div class="w-[72px] h-[72px] rounded-[20px] bg-primary/10 dark:bg-blue-600/20 flex items-center justify-center shadow-sm border border-primary/10 dark:border-blue-500/20">
            <Download class="w-[36px] h-[36px] text-primary dark:text-blue-400" />
          </div>
        </div>

        <div class="flex flex-col items-center gap-[10px] w-full text-center">
          <h2 class="text-[24px] font-[700] tracking-tight text-foreground">
            {{ t('common.pwa_install_title', 'Install Seen App') }}
          </h2>
          <p class="text-[15px] font-[500] text-muted-foreground leading-relaxed max-w-[360px]">
            {{ t('common.pwa_install_desc', 'Get the full Seen experience directly on your device. Faster access, better performance.') }}
          </p>
        </div>

        <!-- Features -->
        <div class="flex flex-col w-full gap-[12px] mt-[12px]">
          <div class="flex items-center gap-[16px] p-[16px] rounded-[20px] bg-card dark:bg-slate-800/50 border border-border transition-all hover:bg-muted/20 dark:hover:bg-slate-800">
            <div class="w-[44px] h-[44px] rounded-full bg-primary/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
              <Rocket class="w-[22px] h-[22px] text-primary dark:text-blue-400" />
            </div>
            <div class="flex flex-col">
              <span class="text-[15px] font-[600] text-foreground">
                {{ t('common.pwa_fast_access', 'Lightning Fast Access') }}
              </span>
              <span class="text-[13px] font-[500] text-muted-foreground leading-tight mt-[2px]">
                {{ t('common.pwa_fast_access_desc', 'Launch instantly from your home screen or desktop.') }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-[16px] p-[16px] rounded-[20px] bg-card dark:bg-slate-800/50 border border-border transition-all hover:bg-muted/20 dark:hover:bg-slate-800">
            <div class="w-[44px] h-[44px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Bell class="w-[22px] h-[22px] text-emerald-600 dark:text-emerald-400" />
            </div>
            <div class="flex flex-col">
              <span class="text-[15px] font-[600] text-foreground">
                {{ t('common.pwa_notifications', 'Native Notifications') }}
              </span>
              <span class="text-[13px] font-[500] text-muted-foreground leading-tight mt-[2px]">
                {{ t('common.pwa_notifications_desc', 'Never miss an important update with system alerts.') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex flex-col sm:flex-row justify-end gap-[12px] px-[32px] py-[24px] bg-muted/30 dark:bg-slate-800/80 border-t border-border">
        <button
          class="order-2 sm:order-1 px-[24px] py-[14px] rounded-full bg-secondary dark:bg-slate-700 text-secondary-foreground dark:text-slate-200 font-[600] text-[16px] hover:bg-secondary/80 dark:hover:bg-slate-600 transition-colors flex-1 sm:flex-none text-center"
          @click="dismissPrompt"
        >
          {{ t('common.not_now', 'Not Now') }}
        </button>
        <button
          class="order-1 sm:order-2 px-[32px] py-[14px] rounded-full bg-primary dark:bg-blue-600 text-primary-foreground font-[600] text-[16px] hover:bg-primary/90 dark:hover:bg-blue-700 transition-colors flex-1 sm:flex-none text-center shadow-[0_4px_12px_rgba(30,58,138,0.25)]"
          @click="installPwa"
        >
          {{ t('common.install_app', 'Install App') }}
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>
