<script setup lang="ts">
/**
 * RetangleIcon
 * Auto-generated from: .unused-assets/public/icons/retangle.svg
 * Use: <RetangleIcon /> or <RetangleIcon :size="32" color="red" />
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
    viewBox="0 0 30 28"
    fill="none"
    :style="{ color }"
  >
    <rect x="0.933333" y="0.933333" width="28" height="26.1333" fill="currentColor" fill-opacity="0.07" stroke="currentColor" stroke-width="1.86667" />
  </svg>
</template>
