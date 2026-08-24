<script setup lang="ts">
/**
 * TimeIcon
 * Auto-generated from: .unused-assets/public/icons/time-icon.svg
 * Use: <TimeIcon /> or <TimeIcon :size="32" color="red" />
 */
withDefaults(defineProps<{
  /** Icon size in pixels (applied to both width and height) */
  size?: number | string
  /** Icon color — uses currentColor by default, inheriting from parent */
  color?: string
}>(), {
  size: 24,
  color: 'currentColor',
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 50 50"
    fill="none"
    :style="{ color }"
  >
    <circle cx="25" cy="25" r="25" fill="currentColor" />
    <path d="M20.6104 15.4707V19.4707" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M28.6104 15.4707V19.4707" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M31.6113 17.4707H17.6113C16.5068 17.4707 15.6113 18.3661 15.6113 19.4707V33.4707C15.6113 34.5753 16.5068 35.4707 17.6113 35.4707H31.6113C32.7159 35.4707 33.6113 34.5753 33.6113 33.4707V19.4707C33.6113 18.3661 32.7159 17.4707 31.6113 17.4707Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M15.6113 23.4727H33.6113" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
