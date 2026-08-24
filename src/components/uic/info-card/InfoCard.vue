<script setup lang="ts">
/**
 * InfoCard — section card with icon + title header and structured content.
 * Common pattern in SAAF detail pages (operations, subscriptions, wallets).
 * Composes shadcn Card + CardHeader + CardContent.
 */
import type { Component, HTMLAttributes } from 'vue'
import type { InfoCardVariants } from './variants'
import { Card, CardContent, CardHeader } from '@/components/uic/card'
import { cn } from '@/utils/cn'
import { infoCardVariants } from './variants'

const props = withDefaults(
  defineProps<{
    /** Section title */
    title?: string
    /** Lucide icon component */
    icon?: Component
    /** Padding variant */
    padding?: InfoCardVariants['padding']
    class?: HTMLAttributes['class']
  }>(),
  {
    title: '',
    icon: undefined,
    padding: 'default',
  },
)
</script>

<template>
  <Card data-slot="info-card" :class="cn(infoCardVariants({ padding }), props.class)">
    <!-- Section header with icon -->
    <CardHeader v-if="title || $slots.header || icon" class="p-0 pb-4">
      <slot name="header">
        <div class="flex items-center gap-2.5">
          <div
            v-if="icon"
            class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
          >
            <component :is="icon" :size="16" />
          </div>
          <h3 class="text-sm font-semibold text-foreground m-0 tracking-tight">
            {{ title }}
          </h3>
        </div>
      </slot>
    </CardHeader>

    <CardContent class="p-0">
      <slot />
    </CardContent>
  </Card>
</template>
