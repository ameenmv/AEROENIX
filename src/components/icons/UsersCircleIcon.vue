<script setup lang="ts">
/**
 * UsersCircleIcon
 * Auto-generated from: .unused-assets/public/icons/users-circle.svg
 * Use: <UsersCircleIcon /> or <UsersCircleIcon :size="32" color="red" />
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
    viewBox="0 0 84 84"
    fill="none"
    :style="{ color }"
  >
    <circle cx="42" cy="42" r="42" fill="currentColor" />
    <path
      d="M46.0664 53.7501L48.5997 56.2835L53.6664 51.2168"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M42.2673 40.1173C42.1006 40.1007 41.9006 40.1007 41.7173 40.1173C37.7506 39.984 34.6006 36.734 34.6006 32.734C34.584 28.6507 37.9006 25.334 41.984 25.334C46.0673 25.334 49.384 28.6507 49.384 32.734C49.384 36.734 46.2173 39.984 42.2673 40.1173Z"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M41.9834 58.3501C38.9501 58.3501 35.9334 57.5835 33.6334 56.0501C29.6001 53.3501 29.6001 48.9501 33.6334 46.2668C38.2167 43.2001 45.7334 43.2001 50.3167 46.2668"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
