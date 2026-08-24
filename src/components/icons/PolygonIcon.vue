<script setup lang="ts">
/**
 * PolygonIcon
 * Auto-generated from: .unused-assets/public/icons/polygon.svg
 * Use: <PolygonIcon /> or <PolygonIcon :size="32" color="red" />
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
    viewBox="0 0 27 28"
    fill="none"
    :style="{ color }"
  >
    <path d="M25.7454 0.176339C25.5012 -6.11757e-05 25.1892 -0.0464169 24.9048 0.04785L16.8184 2.74363L9.66096 0.0593612C9.45998 -0.0153056 9.24064 -0.0199724 9.03811 0.04785L0.63809 2.84786C0.256978 2.9751 0 3.33132 0 3.73328V27.0667C0 27.3666 0.144045 27.6481 0.387956 27.8236C0.548801 27.94 0.740135 28 0.933335 28C1.03258 28 1.13214 27.9841 1.22858 27.9521L9.315 25.2563L16.4721 27.9406C16.6722 28.014 16.8915 28.0193 17.095 27.9521L25.495 25.1521C25.8764 25.0252 26.1334 24.6686 26.1334 24.2667V0.933274C26.1334 0.633362 25.9893 0.351806 25.7454 0.176339ZM10.2667 2.28008L15.8667 4.38039V25.7202L10.2667 23.6199V2.28008ZM1.86667 4.4059L8.40002 2.22812V23.5937L1.86667 25.7718V4.4059ZM24.2667 23.594L17.7334 25.7718V4.40622L24.2667 2.22812V23.594Z" fill="currentColor" />
  </svg>
</template>
