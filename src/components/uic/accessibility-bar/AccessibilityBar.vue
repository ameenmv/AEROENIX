<script setup lang="ts">
import {
  Contrast,
  Eye,
  Minus,
  MousePointer,
  Plus,
  RotateCcw,
  Type,
  Underline,
  ZoomIn,
  ZoomOut,
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Button as Btn } from '@/components/uic/button'
import { Separator } from '@/components/uic/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/uic/tooltip'
import { useAccessibility } from '@/composables/useAccessibility'

const { t } = useI18n()
const {
  prefs,
  zoomIn,
  zoomOut,
  fontIncrease,
  fontDecrease,
  toggleGrayscale,
  toggleHighContrast,
  toggleUnderlineLinks,
  toggleBigCursor,
  resetAll,
} = useAccessibility()
</script>

<template>
  <Transition name="a11y-slide">
    <div
      v-if="prefs.barVisible"
      data-slot="accessibility-bar"
      class="sticky top-0 z-50 w-full h-9 px-3 flex items-center gap-1 bg-muted/60 dark:bg-muted/30 backdrop-blur-md border-b border-border transition-all duration-300"
    >
      <TooltipProvider :delay-duration="200">
        <!-- Zoom controls -->
        <div class="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger as-child>
              <Btn
                variant="ghost"
                size="icon-sm"
                class="h-6 w-6 text-muted-foreground hover:text-foreground"
                :aria-label="t('common.Zoom out', 'Zoom out')"
                @click="zoomOut"
              >
                <ZoomOut :size="13" />
              </Btn>
            </TooltipTrigger>
            <TooltipContent side="bottom" :side-offset="4">
              <p class="text-xs">
                {{ t('common.Zoom out', 'Zoom out') }}
              </p>
            </TooltipContent>
          </Tooltip>
          <span class="text-[10px] font-mono font-medium text-muted-foreground min-w-[32px] text-center">
            {{ prefs.zoomLevel }}%
          </span>
          <Tooltip>
            <TooltipTrigger as-child>
              <Btn
                variant="ghost"
                size="icon-sm"
                class="h-6 w-6 text-muted-foreground hover:text-foreground"
                :aria-label="t('common.Zoom in', 'Zoom in')"
                @click="zoomIn"
              >
                <ZoomIn :size="13" />
              </Btn>
            </TooltipTrigger>
            <TooltipContent side="bottom" :side-offset="4">
              <p class="text-xs">
                {{ t('common.Zoom in', 'Zoom in') }}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" class="mx-1 data-[orientation=vertical]:h-4" />

        <!-- Font size controls -->
        <div class="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger as-child>
              <Btn
                variant="ghost"
                size="icon-sm"
                class="h-6 w-6 text-muted-foreground hover:text-foreground"
                :aria-label="t('common.Decrease font', 'Decrease font size')"
                @click="fontDecrease"
              >
                <Minus :size="13" />
              </Btn>
            </TooltipTrigger>
            <TooltipContent side="bottom" :side-offset="4">
              <p class="text-xs">
                {{ t('common.Decrease font', 'Decrease font') }}
              </p>
            </TooltipContent>
          </Tooltip>
          <div class="flex items-center gap-0.5">
            <Type :size="13" class="text-muted-foreground" />
            <span class="text-[10px] font-mono font-medium text-muted-foreground min-w-[32px] text-center">
              {{ prefs.fontScale }}%
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger as-child>
              <Btn
                variant="ghost"
                size="icon-sm"
                class="h-6 w-6 text-muted-foreground hover:text-foreground"
                :aria-label="t('common.Increase font', 'Increase font size')"
                @click="fontIncrease"
              >
                <Plus :size="13" />
              </Btn>
            </TooltipTrigger>
            <TooltipContent side="bottom" :side-offset="4">
              <p class="text-xs">
                {{ t('common.Increase font', 'Increase font') }}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" class="mx-1 data-[orientation=vertical]:h-4" />

        <!-- Toggle controls -->
        <div class="flex items-center gap-0.5">
          <!-- Grayscale -->
          <Tooltip>
            <TooltipTrigger as-child>
              <Btn
                variant="ghost"
                size="icon-sm"
                class="h-6 w-6 transition-colors" :class="[
                  prefs.grayscale
                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground',
                ]"
                :aria-label="t('common.Grayscale', 'Grayscale')"
                :aria-pressed="prefs.grayscale"
                @click="toggleGrayscale"
              >
                <Eye :size="13" />
              </Btn>
            </TooltipTrigger>
            <TooltipContent side="bottom" :side-offset="4">
              <p class="text-xs">
                {{ t('common.Grayscale', 'Grayscale') }}
              </p>
            </TooltipContent>
          </Tooltip>

          <!-- High contrast -->
          <Tooltip>
            <TooltipTrigger as-child>
              <Btn
                variant="ghost"
                size="icon-sm"
                class="h-6 w-6 transition-colors" :class="[
                  prefs.highContrast
                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground',
                ]"
                :aria-label="t('common.High contrast', 'High contrast')"
                :aria-pressed="prefs.highContrast"
                @click="toggleHighContrast"
              >
                <Contrast :size="13" />
              </Btn>
            </TooltipTrigger>
            <TooltipContent side="bottom" :side-offset="4">
              <p class="text-xs">
                {{ t('common.High contrast', 'High contrast') }}
              </p>
            </TooltipContent>
          </Tooltip>

          <!-- Underline links -->
          <Tooltip>
            <TooltipTrigger as-child>
              <Btn
                variant="ghost"
                size="icon-sm"
                class="h-6 w-6 transition-colors" :class="[
                  prefs.underlineLinks
                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground',
                ]"
                :aria-label="t('common.Underline links', 'Underline links')"
                :aria-pressed="prefs.underlineLinks"
                @click="toggleUnderlineLinks"
              >
                <Underline :size="13" />
              </Btn>
            </TooltipTrigger>
            <TooltipContent side="bottom" :side-offset="4">
              <p class="text-xs">
                {{ t('common.Underline links', 'Underline links') }}
              </p>
            </TooltipContent>
          </Tooltip>

          <!-- Big cursor -->
          <Tooltip>
            <TooltipTrigger as-child>
              <Btn
                variant="ghost"
                size="icon-sm"
                class="h-6 w-6 transition-colors" :class="[
                  prefs.bigCursor
                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground',
                ]"
                :aria-label="t('common.Big cursor', 'Big cursor')"
                :aria-pressed="prefs.bigCursor"
                @click="toggleBigCursor"
              >
                <MousePointer :size="13" />
              </Btn>
            </TooltipTrigger>
            <TooltipContent side="bottom" :side-offset="4">
              <p class="text-xs">
                {{ t('common.Big cursor', 'Big cursor') }}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" class="mx-1 data-[orientation=vertical]:h-4" />

        <!-- Reset -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Btn
              variant="ghost"
              size="icon-sm"
              class="h-6 w-6 text-muted-foreground hover:text-foreground"
              :aria-label="t('common.Reset accessibility', 'Reset all')"
              @click="resetAll"
            >
              <RotateCcw :size="13" />
            </Btn>
          </TooltipTrigger>
          <TooltipContent side="bottom" :side-offset="4">
            <p class="text-xs">
              {{ t('common.Reset accessibility', 'Reset all') }}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </Transition>
</template>
