<script setup lang="ts">
/**
 * TicketIcon
 * Auto-generated from: .unused-assets/public/icons/ticket-icon.svg
 * Use: <TicketIcon /> or <TicketIcon :size="32" color="red" />
 */
withDefaults(
  defineProps<{
    /** Icon size in pixels (applied to both width and height) */
    size?: number | string
    /** Icon color — uses currentColor by default, inheriting from parent */
    color?: string
  }>(),
  {
    size: 24,
    color: 'currentColor',
  },
)
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
    <path
      d="M24.6465 35.4707C30.1693 35.4707 34.6465 30.9936 34.6465 25.4707C34.6465 19.9479 30.1693 15.4707 24.6465 15.4707C19.1236 15.4707 14.6465 19.9479 14.6465 25.4707C14.6465 30.9936 19.1236 35.4707 24.6465 35.4707Z"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M24.6465 21.4707V25.4707"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M24.6465 29.4727H24.6562"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
