<script setup lang="ts">
/**
 * PageHeader — page-level heading with optional eyebrow, subtitle, breadcrumb, and actions slot.
 * Composes shadcn Breadcrumb components for consistent navigation.
 */
import type { HTMLAttributes } from 'vue'
import type { PageHeaderVariants } from './variants'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/uic/breadcrumb'
import { Separator } from '@/components/uic/separator'
import { cn } from '@/utils/cn'
import { pageHeaderVariants } from './variants'

interface BreadcrumbEntry {
  label: string
  to?: string
}

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    eyebrow?: string
    breadcrumb?: BreadcrumbEntry[]
    size?: PageHeaderVariants['size']
    align?: PageHeaderVariants['align']
    class?: HTMLAttributes['class']
  }>(),
  {
    subtitle: '',
    eyebrow: '',
    breadcrumb: () => [],
    size: 'default',
    align: 'left',
  },
)
</script>

<template>
  <header data-slot="page-header" :class="cn(pageHeaderVariants({ size, align }), props.class)">
    <!-- Breadcrumb (using shadcn Breadcrumb component) -->
    <Breadcrumb v-if="breadcrumb.length">
      <BreadcrumbList>
        <template v-for="(crumb, idx) in breadcrumb" :key="idx">
          <BreadcrumbItem>
            <BreadcrumbLink v-if="crumb.to && idx < breadcrumb.length - 1" :href="crumb.to">
              {{ crumb.label }}
            </BreadcrumbLink>
            <BreadcrumbPage v-else>
              {{ crumb.label }}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator v-if="idx < breadcrumb.length - 1" />
        </template>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Row: heading + actions -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div class="flex flex-col gap-2 min-w-0">
        <!-- Eyebrow -->
        <p
          v-if="$slots.eyebrow || eyebrow"
          class="text-xs font-semibold text-primary uppercase tracking-widest m-0"
        >
          <slot name="eyebrow">
            {{ eyebrow }}
          </slot>
        </p>

        <!-- Title -->
        <slot name="title">
          <h1
            data-slot="page-header-title"
            class="font-semibold tracking-tight text-foreground leading-tight m-0"
          >
            {{ title }}
          </h1>
        </slot>

        <!-- Subtitle -->
        <p v-if="subtitle" class="text-sm text-muted-foreground leading-snug max-w-[680px] m-0">
          {{ subtitle }}
        </p>

        <!-- Meta slot -->
        <div v-if="$slots.meta" class="flex gap-2 flex-wrap mt-2">
          <slot name="meta" />
        </div>
      </div>

      <!-- Actions slot -->
      <div v-if="$slots.actions" class="flex gap-2 shrink-0">
        <slot name="actions" />
      </div>
    </div>

    <Separator v-if="$slots.default" />
    <slot />
  </header>
</template>
