<script setup lang="ts">
/**
 * ProjectsIcon
 * Auto-generated from: .unused-assets/public/icons/projects.svg
 * Use: <ProjectsIcon /> or <ProjectsIcon :size="32" color="red" />
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
    viewBox="0 0 16 14"
    fill="none"
    :style="{ color }"
  >
    <path
      opacity="0.593634"
      d="M16 3.55556V1.18538C16 0.530459 15.4033 0 14.6667 0H1.33333C0.596667 0 0 0.530459 0 1.18538V3.55556H16Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M0 6.22266V12.0408C0 12.7552 0.596667 13.3338 1.33333 13.3338H14.6667C15.4033 13.3338 16 12.7552 16 12.0408V6.22266H0ZM7.33268 10.1015H2.66602V8.80859H7.33268V10.1015ZM10.666 10.1015H13.3327V8.80859H10.666V10.1015Z"
      fill="currentColor"
    />
  </svg>
</template>
