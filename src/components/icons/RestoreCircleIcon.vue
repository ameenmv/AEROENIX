<script setup lang="ts">
/**
 * RestoreCircleIcon
 * Auto-generated from: .unused-assets/public/icons/restore-circle.svg
 * Use: <RestoreCircleIcon /> or <RestoreCircleIcon :size="32" color="red" />
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
    viewBox="0 0 26 26"
    fill="none"
    :style="{ color }"
  >
    <rect width="26" height="26" rx="13" fill="currentColor" />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M11.3512 8.84878C11.4359 9.12828 11.278 9.42358 10.9985 9.50833L8.11353 10.3832C7.5512 10.5537 6.98263 10.1366 6.97639 9.54903L6.94437 6.53447C6.94126 6.24241 7.17551 6.00313 7.46756 6.00003C7.75962 5.99693 7.9989 6.23117 8.002 6.52323L8.03153 9.30277L10.6916 8.49615C10.9711 8.41139 11.2664 8.56927 11.3512 8.84878Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12.875 7.05769C10.9284 7.05769 9.20498 8.0133 8.14815 9.48332C7.97766 9.72047 7.6472 9.7745 7.41005 9.60402C7.1729 9.43352 7.11886 9.10307 7.28936 8.86592C8.53636 7.13136 10.5736 6 12.875 6C16.672 6 19.75 9.07804 19.75 12.875C19.75 16.672 16.672 19.75 12.875 19.75C9.07804 19.75 6 16.672 6 12.875C6 12.5829 6.23678 12.3461 6.52885 12.3461C6.82092 12.3461 7.05769 12.5829 7.05769 12.875C7.05769 16.0878 9.66219 18.6923 12.875 18.6923C16.0878 18.6923 18.6923 16.0878 18.6923 12.875C18.6923 9.66219 16.0878 7.05769 12.875 7.05769Z"
      fill="currentColor"
    />
  </svg>
</template>
