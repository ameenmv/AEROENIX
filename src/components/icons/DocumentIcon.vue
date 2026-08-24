<script setup lang="ts">
/**
 * DocumentIcon
 * Auto-generated from: .unused-assets/public/icons/document.svg
 * Use: <DocumentIcon /> or <DocumentIcon :size="32" color="red" />
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
    viewBox="0 0 13 16"
    fill="none"
    :style="{ color }"
  >
    <path opacity="0.603585" d="M12.9991 13.8667H11.8131V1.26061H1.73242V0H12.4061C12.7334 0 12.9991 0.282376 12.9991 0.630303V13.8667Z" fill="currentColor" />
    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.625926 3.4668H10.6407C10.9863 3.4668 11.2667 3.73858 11.2667 4.07346V14.9935C11.2667 15.3283 10.9863 15.6001 10.6407 15.6001H0.625926C0.280415 15.6001 0 15.3283 0 14.9935V4.07346C0 3.73858 0.280415 3.4668 0.625926 3.4668ZM2.5037 12.5668H6.25926V11.3535H2.5037V12.5668ZM8.76296 10.1401H2.5037V8.9268H8.76296V10.1401ZM2.5037 7.71346H8.76296V6.50013H2.5037V7.71346Z" fill="currentColor" />
  </svg>
</template>
