<script setup lang="ts">
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Button } from '@/components/uic/button'
import { Separator } from '@/components/uic/separator'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="min-h-[75vh] flex flex-col items-center justify-center bg-background px-4 rounded-xl border border-border shadow-sm w-full">
    <div class="flex flex-col items-center gap-6 text-center max-w-md">
      <!-- 404 number -->
      <div class="relative">
        <h1 class="text-8xl font-black tracking-tighter text-primary drop-shadow-sm">
          404
        </h1>
      </div>

      <Separator class="w-24" />

      <!-- Message -->
      <div class="space-y-3">
        <h2 class="text-2xl font-bold text-foreground">
          {{ t('common.no_data_found', 'No Data Found') }}
        </h2>
        <p class="text-sm text-muted-foreground leading-relaxed">
          {{ t('common.no_data_found_description', "The item you're looking for doesn't exist, has been removed, or you don't have permission to view it.") }}
        </p>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 mt-2 justify-center">
        <Button variant="outline" size="lg" class="gap-2" @click="router.back()">
          <HugeiconsIcon :icon="ArrowLeft02Icon" :size="18" />
          {{ t('common.go_back', 'Go Back') }}
        </Button>
      </div>
    </div>
  </div>
</template>
