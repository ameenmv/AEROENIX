<script setup lang="ts">
/**
 * SendIcon
 * Auto-generated from: .unused-assets/public/icons/send.svg
 * Use: <SendIcon /> or <SendIcon :size="32" color="red" />
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
    viewBox="0 0 24 24"
    fill="none"
    :style="{ color }"
  >
    <path
      d="M18.0698 8.51013L9.50978 4.23013C3.75978 1.35013 1.39978 3.71013 4.27978 9.46013L5.14978 11.2001C5.39978 11.7101 5.39978 12.3001 5.14978 12.8101L4.27978 14.5401C1.39978 20.2901 3.74978 22.6501 9.50978 19.7701L18.0698 15.4901C21.9098 13.5701 21.9098 10.4301 18.0698 8.51013ZM14.8398 12.7501H9.43977C9.02978 12.7501 8.68977 12.4101 8.68977 12.0001C8.68977 11.5901 9.02978 11.2501 9.43977 11.2501H14.8398C15.2498 11.2501 15.5898 11.5901 15.5898 12.0001C15.5898 12.4101 15.2498 12.7501 14.8398 12.7501Z"
      fill="currentColor"
    />
  </svg>
</template>
