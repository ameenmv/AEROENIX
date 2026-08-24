<script setup lang="ts">
/**
 * DuplicateIcon
 * Auto-generated from: .unused-assets/public/icons/Duplicate.svg
 * Use: <DuplicateIcon /> or <DuplicateIcon :size="32" color="red" />
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
    viewBox="0 0 18 18"
    fill="none"
    :style="{ color }"
  >
    <path
      d="M15.2699 5.05078H6.50984C5.70348 5.05078 5.0498 5.70446 5.0498 6.51082V15.2709C5.0498 16.0772 5.70348 16.7309 6.50984 16.7309H15.2699C16.0763 16.7309 16.7299 16.0772 16.7299 15.2709V6.51082C16.7299 5.70446 16.0763 5.05078 15.2699 5.05078Z"
      stroke="currentColor"
      stroke-width="1.46004"
    />
    <path
      d="M12.4101 2.95147V2.19047C12.4101 1.38414 11.7565 0.730469 10.9501 0.730469H2.18997C1.38365 0.730469 0.72998 1.38414 0.72998 2.19047V10.9506C0.72998 11.757 1.38365 12.4106 2.18997 12.4106H2.91965"
      stroke="currentColor"
      stroke-width="1.46004"
    />
  </svg>
</template>
