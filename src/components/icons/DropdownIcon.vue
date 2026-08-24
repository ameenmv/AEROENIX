<script setup lang="ts">
/**
 * DropdownIcon
 * Auto-generated from: .unused-assets/public/icons/dropdown.svg
 * Use: <DropdownIcon /> or <DropdownIcon :size="32" color="red" />
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
      d="M14.072 15.728C14.072 15.936 14 16.112 13.856 16.256C13.712 16.4 13.536 16.472 13.328 16.472C13.12 16.472 12.944 16.4 12.8 16.256C12.656 16.112 12.584 15.936 12.584 15.728C12.584 15.528 12.656 15.36 12.8 15.224C12.944 15.08 13.12 15.008 13.328 15.008C13.536 15.008 13.712 15.08 13.856 15.224C14 15.36 14.072 15.528 14.072 15.728ZM14.072 13.3285C14.072 13.5365 14 13.7125 13.856 13.8565C13.712 14.0005 13.536 14.0725 13.328 14.0725C13.12 14.0725 12.944 14.0005 12.8 13.8565C12.656 13.7125 12.584 13.5365 12.584 13.3285C12.584 13.1285 12.656 12.9605 12.8 12.8245C12.944 12.6805 13.12 12.6085 13.328 12.6085C13.536 12.6085 13.712 12.6805 13.856 12.8245C14 12.9605 14.072 13.1285 14.072 13.3285ZM14.072 10.9289C14.072 11.1369 14 11.3129 13.856 11.4569C13.712 11.6009 13.536 11.6729 13.328 11.6729C13.12 11.6729 12.944 11.6009 12.8 11.4569C12.656 11.3129 12.584 11.1369 12.584 10.9289C12.584 10.7289 12.656 10.5609 12.8 10.4249C12.944 10.2809 13.12 10.2089 13.328 10.2089C13.536 10.2089 13.712 10.2809 13.856 10.4249C14 10.5609 14.072 10.7289 14.072 10.9289Z"
      fill="currentColor"
    />
  </svg>
</template>
