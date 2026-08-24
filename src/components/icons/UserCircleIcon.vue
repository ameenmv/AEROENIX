<script setup lang="ts">
/**
 * UserCircleIcon
 * Auto-generated from: .unused-assets/public/icons/user-circle.svg
 * Use: <UserCircleIcon /> or <UserCircleIcon :size="32" color="red" />
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
    viewBox="0 0 14 14"
    fill="none"
    :style="{ color }"
  >
    <path fill-rule="evenodd" clip-rule="evenodd" d="M14 7C14 10.866 10.866 14 7 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7 0C10.866 0 14 3.13401 14 7ZM8.75 4.375C8.75 5.3415 7.96653 6.125 7 6.125C6.0335 6.125 5.25 5.3415 5.25 4.375C5.25 3.4085 6.0335 2.625 7 2.625C7.96653 2.625 8.75 3.4085 8.75 4.375ZM6.9994 7.875C5.23405 7.875 3.71291 8.92062 3.02148 10.4262C3.98424 11.543 5.40928 12.25 6.99944 12.25C8.5896 12.25 10.0146 11.5431 10.9774 10.4263C10.286 8.92062 8.76477 7.875 6.9994 7.875Z" fill="currentColor" />
  </svg>
</template>
