<script setup lang="ts">
/**
 * EyeIcon
 * Auto-generated from: .unused-assets/public/icons/eye-icon.svg
 * Use: <EyeIcon /> or <EyeIcon :size="32" color="red" />
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
    viewBox="0 0 12 12"
    :style="{ color }"
  >
    <g clip-path="url(#clip0_6035_3326)">
      <path
        d="M0.958714 5.73423C0.920012 5.62997 0.920012 5.51529 0.958714 5.41103C1.33565 4.49706 1.97548 3.7156 2.79708 3.16571C3.61869 2.61582 4.58507 2.32227 5.57371 2.32227C6.56235 2.32227 7.52873 2.61582 8.35034 3.16571C9.17194 3.7156 9.81177 4.49706 10.1887 5.41103C10.2274 5.51529 10.2274 5.62997 10.1887 5.73423C9.81177 6.6482 9.17194 7.42966 8.35034 7.97955C7.52873 8.52944 6.56235 8.823 5.57371 8.823C4.58507 8.823 3.61869 8.52944 2.79708 7.97955C1.97548 7.42966 1.33565 6.6482 0.958714 5.73423Z"
        stroke="currentColor"
        stroke-width="0.928758"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5.5738 6.96596C6.34321 6.96596 6.96694 6.34223 6.96694 5.57282C6.96694 4.80342 6.34321 4.17969 5.5738 4.17969C4.80439 4.17969 4.18066 4.80342 4.18066 5.57282C4.18066 6.34223 4.80439 6.96596 5.5738 6.96596Z"
        stroke="currentColor"
        stroke-width="0.928758"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_6035_3326">
        <rect width="11.1451" height="11.1451" fill="white" />
      </clipPath>
    </defs>
  </svg>
</template>
