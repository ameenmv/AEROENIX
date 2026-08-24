<script setup lang="ts">
/**
 * BinIcon
 * Auto-generated from: .unused-assets/public/icons/bin.svg
 * Use: <BinIcon /> or <BinIcon :size="32" color="red" />
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
    viewBox="0 0 12 11"
    fill="none"
    :style="{ color }"
  >
    <path d="M9.46735 9.40731C9.43215 9.93246 8.99592 10.3404 8.46959 10.3404H3.52388C2.99759 10.3404 2.56137 9.9325 2.52613 9.40739L2.06445 2.52832H9.92846L9.46735 9.40731Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M1 2.5293H11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M7.27332 0.714844H4.72385C4.49846 0.714844 4.2823 0.810348 4.12293 0.980346C3.96356 1.15034 3.87402 1.38091 3.87402 1.62132V2.5278H8.12315V1.62132C8.12315 1.38091 8.03362 1.15034 7.87424 0.980346C7.71487 0.810348 7.49871 0.714844 7.27332 0.714844Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
