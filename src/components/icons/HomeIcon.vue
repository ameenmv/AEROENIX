<script setup lang="ts">
/**
 * HomeIcon
 * Auto-generated from: .unused-assets/public/icons/home.svg
 * Use: <HomeIcon /> or <HomeIcon :size="32" color="red" />
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
    viewBox="0 0 18 20"
    fill="none"
    :style="{ color }"
  >
    <path d="M3.133 19.0003C1.955 19.0003 1 18.0203 1 16.8103V8.00828C1 7.34328 1.295 6.71328 1.8 6.29828L7.667 1.48028C8.04186 1.16986 8.5133 1 9 1C9.4867 1 9.95814 1.16986 10.333 1.48028L16.199 6.29828C16.705 6.71328 17 7.34328 17 8.00828V16.8103C17 18.0203 16.045 19.0003 14.867 19.0003H3.133Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M7 18V12.8667C7 12.3716 7.21071 11.8968 7.58579 11.5467C7.96086 11.1967 8.46957 11 9 11H10C10.5304 11 11.0391 11.1967 11.4142 11.5467C11.7893 11.8968 12 12.3716 12 12.8667V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
