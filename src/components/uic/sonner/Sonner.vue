<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner'
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { Toaster as Sonner } from 'vue-sonner'
import { cn } from '@/utils'
import 'vue-sonner/style.css'

const props = defineProps<ToasterProps>()

// Detect dark mode from HTML class
const isDark = ref(false)

function checkDarkMode() {
  isDark.value = document.documentElement.classList.contains('dark')
}

onMounted(() => {
  checkDarkMode()
  // Watch for class changes on html element
  const observer = new MutationObserver(() => checkDarkMode())
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

const theme = computed(() => (isDark.value ? 'dark' : 'light'))

// Exclude theme and class from v-bind spread since they're set explicitly
const restProps = computed(() => {
  const { theme: _t, class: _c, ...rest } = props as any
  return rest
})
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :theme="theme"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    v-bind="restProps"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
  </Sonner>
</template>

<style>
/* ── Sonner Toast Styles ───────────────────────────────────────── */

/* Base toast styling */
[data-sonner-toaster] [data-sonner-toast] {
  font-family: var(--font-sans) !important;
  border-radius: 12px !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08) !important;
  padding: 14px 16px !important;
  gap: 8px !important;
}

/* Dark mode base shadow */
.dark [data-sonner-toaster] [data-sonner-toast],
[data-sonner-toaster][data-sonner-theme='dark'] [data-sonner-toast] {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.4) !important;
}

/* ── Success Toast ─────────────────────────────────────────────── */
[data-sonner-toast][data-type='success'] {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5) !important;
  border: 1px solid #6ee7b7 !important;
  color: #065f46 !important;
}
[data-sonner-toast][data-type='success'] [data-title],
[data-sonner-toast][data-type='success'] [data-description] {
  color: #065f46 !important;
}
[data-sonner-toast][data-type='success'] [data-icon] svg {
  color: #10b981 !important;
}

/* Dark success — solid */
.dark [data-sonner-toast][data-type='success'],
[data-sonner-theme='dark'] [data-sonner-toast][data-type='success'] {
  background: linear-gradient(135deg, #052e1c, #0a3d28) !important;
  border: 1px solid #166534 !important;
  color: #bbf7d0 !important;
}
.dark [data-sonner-toast][data-type='success'] [data-title],
[data-sonner-theme='dark'] [data-sonner-toast][data-type='success'] [data-title] {
  color: #bbf7d0 !important;
}
.dark [data-sonner-toast][data-type='success'] [data-description],
[data-sonner-theme='dark'] [data-sonner-toast][data-type='success'] [data-description] {
  color: #86efac !important;
}
.dark [data-sonner-toast][data-type='success'] [data-icon] svg,
[data-sonner-theme='dark'] [data-sonner-toast][data-type='success'] [data-icon] svg {
  color: #4ade80 !important;
}

/* ── Error Toast ───────────────────────────────────────────────── */
[data-sonner-toast][data-type='error'] {
  background: linear-gradient(135deg, #fef2f2, #fecaca) !important;
  border: 1px solid #fca5a5 !important;
  color: #991b1b !important;
}
[data-sonner-toast][data-type='error'] [data-title],
[data-sonner-toast][data-type='error'] [data-description] {
  color: #991b1b !important;
}
[data-sonner-toast][data-type='error'] [data-icon] svg {
  color: #ef4444 !important;
}

/* Dark error — solid */
.dark [data-sonner-toast][data-type='error'],
[data-sonner-theme='dark'] [data-sonner-toast][data-type='error'] {
  background: linear-gradient(135deg, #2d0a0a, #3b1111) !important;
  border: 1px solid #991b1b !important;
  color: #fecaca !important;
}
.dark [data-sonner-toast][data-type='error'] [data-title],
[data-sonner-theme='dark'] [data-sonner-toast][data-type='error'] [data-title] {
  color: #fecaca !important;
}
.dark [data-sonner-toast][data-type='error'] [data-description],
[data-sonner-theme='dark'] [data-sonner-toast][data-type='error'] [data-description] {
  color: #fca5a5 !important;
}
.dark [data-sonner-toast][data-type='error'] [data-icon] svg,
[data-sonner-theme='dark'] [data-sonner-toast][data-type='error'] [data-icon] svg {
  color: #f87171 !important;
}

/* ── Warning Toast ─────────────────────────────────────────────── */
[data-sonner-toast][data-type='warning'] {
  background: linear-gradient(135deg, #fffbeb, #fef3c7) !important;
  border: 1px solid #fcd34d !important;
  color: #92400e !important;
}
[data-sonner-toast][data-type='warning'] [data-title],
[data-sonner-toast][data-type='warning'] [data-description] {
  color: #92400e !important;
}
[data-sonner-toast][data-type='warning'] [data-icon] svg {
  color: #f59e0b !important;
}

/* Dark warning — solid */
.dark [data-sonner-toast][data-type='warning'],
[data-sonner-theme='dark'] [data-sonner-toast][data-type='warning'] {
  background: linear-gradient(135deg, #2d1f04, #3b2908) !important;
  border: 1px solid #a16207 !important;
  color: #fef3c7 !important;
}
.dark [data-sonner-toast][data-type='warning'] [data-title],
[data-sonner-theme='dark'] [data-sonner-toast][data-type='warning'] [data-title] {
  color: #fef3c7 !important;
}
.dark [data-sonner-toast][data-type='warning'] [data-description],
[data-sonner-theme='dark'] [data-sonner-toast][data-type='warning'] [data-description] {
  color: #fcd34d !important;
}
.dark [data-sonner-toast][data-type='warning'] [data-icon] svg,
[data-sonner-theme='dark'] [data-sonner-toast][data-type='warning'] [data-icon] svg {
  color: #fbbf24 !important;
}

/* ── Info Toast ─────────────────────────────────────────────────── */
[data-sonner-toast][data-type='info'] {
  background: linear-gradient(135deg, #eff6ff, #dbeafe) !important;
  border: 1px solid #93c5fd !important;
  color: #1e40af !important;
}
[data-sonner-toast][data-type='info'] [data-title],
[data-sonner-toast][data-type='info'] [data-description] {
  color: #1e40af !important;
}
[data-sonner-toast][data-type='info'] [data-icon] svg {
  color: #3b82f6 !important;
}

/* Dark info — solid */
.dark [data-sonner-toast][data-type='info'],
[data-sonner-theme='dark'] [data-sonner-toast][data-type='info'] {
  background: linear-gradient(135deg, #0a1a3b, #0f2252) !important;
  border: 1px solid #1e40af !important;
  color: #dbeafe !important;
}
.dark [data-sonner-toast][data-type='info'] [data-title],
[data-sonner-theme='dark'] [data-sonner-toast][data-type='info'] [data-title] {
  color: #dbeafe !important;
}
.dark [data-sonner-toast][data-type='info'] [data-description],
[data-sonner-theme='dark'] [data-sonner-toast][data-type='info'] [data-description] {
  color: #93c5fd !important;
}
.dark [data-sonner-toast][data-type='info'] [data-icon] svg,
[data-sonner-theme='dark'] [data-sonner-toast][data-type='info'] [data-icon] svg {
  color: #60a5fa !important;
}

/* ── Toast Typography ──────────────────────────────────────────── */
[data-sonner-toast] [data-title] {
  font-weight: 600 !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
}

[data-sonner-toast] [data-description] {
  font-weight: 400 !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  opacity: 0.9 !important;
}

/* ── Close Button ──────────────────────────────────────────────── */
[data-sonner-toast] [data-close-button] {
  display: none !important;
}
[data-sonner-toast] [data-close-button]:hover {
  opacity: 1 !important;
}
.dark [data-sonner-toast] [data-close-button],
[data-sonner-theme='dark'] [data-sonner-toast] [data-close-button] {
  color: rgba(255, 255, 255, 0.6) !important;
}
.dark [data-sonner-toast] [data-close-button]:hover,
[data-sonner-theme='dark'] [data-sonner-toast] [data-close-button]:hover {
  color: #ffffff !important;
}

/* ── Default / Normal Toast (Dark) ─────────────────────────────── */
.dark [data-sonner-toast]:not([data-type]),
[data-sonner-theme='dark'] [data-sonner-toast]:not([data-type]) {
  background: #0f1d32 !important;
  border: 1px solid #1e3050 !important;
  color: #ffffff !important;
}
</style>
