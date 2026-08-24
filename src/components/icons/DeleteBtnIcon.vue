<script setup lang="ts">
/**
 * DeleteBtnIcon
 * Auto-generated from: .unused-assets/public/icons/delete-btn.svg
 * Use: <DeleteBtnIcon /> or <DeleteBtnIcon :size="32" color="red" />
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
    viewBox="0 0 32 32"
    fill="none"
    :style="{ color }"
  >
    <rect width="32" height="32" rx="5" fill="currentColor" />
    <path d="M20.1483 20.8418C20.1131 21.367 19.6769 21.7749 19.1506 21.7749H12.8416C12.3153 21.7749 11.8791 21.367 11.8439 20.8419L11.2773 12.4004H20.7142L20.1483 20.8418Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M10 12.4014H22" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M17.5279 10.2246H14.4685C14.1981 10.2246 13.9387 10.3392 13.7474 10.5432C13.5562 10.7472 13.4487 11.0239 13.4487 11.3124V12.4002H18.5477V11.3124C18.5477 11.0239 18.4402 10.7472 18.249 10.5432C18.0577 10.3392 17.7984 10.2246 17.5279 10.2246Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
