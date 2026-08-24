<script setup lang="ts">
/**
 * ExMarkIcon
 * Auto-generated from: .unused-assets/public/icons/ex-mark.svg
 * Use: <ExMarkIcon /> or <ExMarkIcon :size="32" color="red" />
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
    viewBox="0 0 27 27"
    :style="{ color }"
  >
    <g clip-path="url(#clip0_40_2163)">
      <path
        d="M13.5 0C6.03793 0 0 6.03846 0 13.5C0 20.9621 6.03846 27 13.5 27C20.9621 27 27 20.9615 27 13.5C27 6.03793 20.9615 0 13.5 0ZM13.5 24.8906C7.20389 24.8906 2.10938 19.7957 2.10938 13.5C2.10938 7.20389 7.20431 2.10938 13.5 2.10938C19.7961 2.10938 24.8906 7.20431 24.8906 13.5C24.8906 19.7961 19.7957 24.8906 13.5 24.8906Z"
        fill="currentColor"
      />
      <path
        d="M13.5 6.7959C12.9175 6.7959 12.4453 7.26808 12.4453 7.85059V14.6424C12.4453 15.2249 12.9175 15.6971 13.5 15.6971C14.0825 15.6971 14.5547 15.2249 14.5547 14.6424V7.85059C14.5547 7.26808 14.0825 6.7959 13.5 6.7959Z"
        fill="currentColor"
      />
      <path
        d="M13.5 19.8369C14.2864 19.8369 14.9238 19.1994 14.9238 18.4131C14.9238 17.6267 14.2864 16.9893 13.5 16.9893C12.7136 16.9893 12.0762 17.6267 12.0762 18.4131C12.0762 19.1994 12.7136 19.8369 13.5 19.8369Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_40_2163">
        <rect width="27" height="27" fill="white" />
      </clipPath>
    </defs>
  </svg>
</template>
