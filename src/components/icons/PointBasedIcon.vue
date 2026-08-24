<script setup lang="ts">
/**
 * PointBasedIcon
 * Auto-generated from: .unused-assets/public/icons/Point_based.svg
 * Use: <PointBasedIcon /> or <PointBasedIcon :size="32" color="red" />
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
    viewBox="0 0 28 28"
    fill="none"
    :style="{ color }"
  >
    <rect x="0.875" y="0.875" width="26.25" height="26.25" rx="13.125" fill="currentColor" fill-opacity="0.21" stroke="currentColor" stroke-width="1.75" />
  </svg>
</template>
