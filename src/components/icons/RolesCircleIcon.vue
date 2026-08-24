<script setup lang="ts">
/**
 * RolesCircleIcon
 * Auto-generated from: .unused-assets/public/icons/roles-circle.svg
 * Use: <RolesCircleIcon /> or <RolesCircleIcon :size="32" color="red" />
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
    viewBox="0 0 84 84"
    fill="none"
    :style="{ color }"
  >
    <circle cx="42" cy="42" r="42" fill="currentColor" />
    <path d="M32.27 24.5H51.7125C57.9425 24.5 59.5 26.0575 59.5 32.27V43.3475C59.5 49.5775 57.9425 51.1175 51.73 51.1175H32.27C26.0575 51.135 24.5 49.5775 24.5 43.365V32.27C24.5 26.0575 26.0575 24.5 32.27 24.5Z" stroke="currentColor" stroke-width="2.625" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M42 51.1348V59.4998" stroke="currentColor" stroke-width="2.625" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M24.5 43.75H59.5" stroke="currentColor" stroke-width="2.625" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M34.125 59.5H49.875" stroke="currentColor" stroke-width="2.625" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
