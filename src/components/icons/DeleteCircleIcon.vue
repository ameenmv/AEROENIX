<script setup lang="ts">
/**
 * DeleteCircleIcon
 * Auto-generated from: .unused-assets/public/icons/delete-circle.svg
 * Use: <DeleteCircleIcon /> or <DeleteCircleIcon :size="32" color="red" />
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
    viewBox="0 0 26 26"
    fill="none"
    :style="{ color }"
  >
    <rect width="26" height="26" rx="13" fill="currentColor" />
    <path d="M17.1483 17.8418C17.1131 18.367 16.6769 18.7749 16.1506 18.7749H9.84163C9.31534 18.7749 8.87912 18.367 8.84387 17.8419L8.27734 9.40039H17.7142L17.1483 17.8418Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M7 9.40137H19" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M14.5274 7.22461H11.468C11.1976 7.22461 10.9382 7.33921 10.7469 7.54321C10.5557 7.74721 10.4482 8.02389 10.4482 8.31239V9.40016H15.5472V8.31239C15.5472 8.02389 15.4398 7.74721 15.2485 7.54321C15.0573 7.33921 14.7979 7.22461 14.5274 7.22461Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
