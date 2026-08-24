<script setup lang="ts">
/**
 * TrackingIcon
 * Auto-generated from: .unused-assets/public/icons/tracking.svg
 * Use: <TrackingIcon /> or <TrackingIcon :size="32" color="red" />
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
    viewBox="0 0 13 13"
    fill="none"
    :style="{ color }"
  >
    <path
      d="M0.583008 5.83301L11.6663 0.583008L6.41634 11.6663L5.24967 6.99967L0.583008 5.83301Z"
      stroke="currentColor"
      stroke-width="1.16667"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
