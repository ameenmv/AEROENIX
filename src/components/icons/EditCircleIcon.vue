<script setup lang="ts">
/**
 * EditCircleIcon
 * Auto-generated from: .unused-assets/public/icons/edit-circle.svg
 * Use: <EditCircleIcon /> or <EditCircleIcon :size="32" color="red" />
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
    viewBox="0 0 26 26"
    fill="none"
    :style="{ color }"
  >
    <rect width="26" height="26" rx="13" fill="currentColor" />
    <path d="M18.0947 7.90517C17.9244 7.73557 17.7221 7.60141 17.4997 7.51042C17.2772 7.41943 17.0389 7.37341 16.7986 7.37504C16.5582 7.37667 16.3206 7.4259 16.0994 7.5199C15.8782 7.61389 15.6778 7.75078 15.5098 7.92267L8.64715 14.7854C8.3937 15.0388 8.21301 15.3557 8.12401 15.703L7.54282 17.9703C7.46731 18.2649 7.73511 18.5326 8.02967 18.4571L10.2971 17.8755C10.6443 17.7865 10.9611 17.6058 11.2145 17.3524L18.0772 10.4896C18.2491 10.3217 18.386 10.1214 18.4801 9.90017C18.5741 9.679 18.6233 9.44137 18.625 9.20105C18.6266 8.96072 18.5806 8.72245 18.4895 8.50002C18.3985 8.27759 18.2643 8.07541 18.0947 7.90517Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
