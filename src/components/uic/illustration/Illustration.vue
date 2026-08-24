<script setup lang="ts">
/**
 * Illustration — built-in SVG illustrations for empty/error/success states.
 * Uses currentColor (via text-primary) as the brand accent so illustrations
 * adapt to any theme automatically.
 */
import type { IllustrationName } from './variants'

withDefaults(
  defineProps<{
    name?: IllustrationName
    size?: number
  }>(),
  {
    name: 'empty',
    size: 120,
  },
)
</script>

<template>
  <svg
    data-slot="illustration"
    :width="size"
    :height="size"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    class="inline-block"
  >
    <!-- Assets: stacked cards -->
    <g v-if="name === 'assets'">
      <rect x="20" y="40" width="62" height="42" rx="6" class="fill-primary/15" />
      <rect x="28" y="32" width="62" height="42" rx="6" class="fill-primary/40" />
      <rect x="36" y="24" width="62" height="42" rx="6" class="fill-primary" />
      <rect x="42" y="32" width="20" height="4" rx="2" fill="white" opacity="0.6" />
      <rect x="42" y="40" width="34" height="4" rx="2" fill="white" opacity="0.8" />
      <circle cx="82" cy="52" r="4" fill="white" />
    </g>

    <!-- Evaluation: document + check -->
    <g v-else-if="name === 'evaluation'">
      <rect
        x="30"
        y="20"
        width="54"
        height="70"
        rx="6"
        class="fill-card stroke-border"
        stroke-width="2"
      />
      <rect x="40" y="32" width="34" height="4" rx="2" class="fill-muted-foreground/30" />
      <rect x="40" y="42" width="24" height="4" rx="2" class="fill-muted-foreground/30" />
      <rect x="40" y="52" width="30" height="4" rx="2" class="fill-muted-foreground/30" />
      <circle cx="78" cy="84" r="20" class="fill-primary" />
      <path
        d="M70 84l6 6 12-12"
        stroke="white"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>

    <!-- Subscription: receipt -->
    <g v-else-if="name === 'subscription'">
      <rect
        x="30"
        y="22"
        width="50"
        height="76"
        rx="4"
        class="fill-card stroke-border"
        stroke-width="2"
      />
      <path
        d="M30 92l5 6 5-6 5 6 5-6 5 6 5-6 5 6 5-6 5 6 5-6"
        class="stroke-border"
        stroke-width="2"
        fill="none"
      />
      <rect x="38" y="34" width="22" height="3" rx="1.5" class="fill-muted-foreground/30" />
      <rect x="38" y="42" width="34" height="3" rx="1.5" class="fill-muted-foreground/30" />
      <rect x="38" y="50" width="20" height="3" rx="1.5" class="fill-muted-foreground/30" />
      <rect x="38" y="64" width="34" height="3" rx="1.5" class="fill-primary" />
      <path
        d="M80 56l16 0M88 48l8 8-8 8"
        class="stroke-primary"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>

    <!-- Search: magnifier + grid -->
    <g v-else-if="name === 'search'">
      <rect x="20" y="20" width="14" height="14" rx="2" class="fill-muted" />
      <rect x="40" y="20" width="14" height="14" rx="2" class="fill-muted" />
      <rect x="20" y="40" width="14" height="14" rx="2" class="fill-muted" />
      <rect x="40" y="40" width="14" height="14" rx="2" class="fill-muted" />
      <circle cx="74" cy="64" r="22" class="stroke-primary" stroke-width="4" fill="white" />
      <path d="M90 80l12 12" class="stroke-primary" stroke-width="4" stroke-linecap="round" />
      <circle cx="74" cy="64" r="14" class="fill-primary/15" />
    </g>

    <!-- Error: warning triangle -->
    <g v-else-if="name === 'error'">
      <path
        d="M60 22L100 92H20L60 22Z"
        fill="#fff1f0"
        stroke="#f04438"
        stroke-width="3"
        stroke-linejoin="round"
      />
      <path d="M60 50v22M60 80v.5" stroke="#f04438" stroke-width="4" stroke-linecap="round" />
    </g>

    <!-- Success: checkmark in circle -->
    <g v-else-if="name === 'success'">
      <circle cx="60" cy="60" r="42" class="fill-primary/10" />
      <circle cx="60" cy="60" r="30" class="fill-primary" />
      <path
        d="M48 60l8 8 16-16"
        stroke="white"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>

    <!-- Empty: placeholder -->
    <g v-else>
      <rect
        x="25"
        y="30"
        width="70"
        height="60"
        rx="8"
        class="fill-muted stroke-border"
        stroke-width="2"
      />
      <circle cx="60" cy="55" r="10" class="fill-muted-foreground/20" />
      <rect x="40" y="72" width="40" height="4" rx="2" class="fill-muted-foreground/20" />
      <rect x="48" y="80" width="24" height="3" rx="1.5" class="fill-muted-foreground/15" />
    </g>
  </svg>
</template>
