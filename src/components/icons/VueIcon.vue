<script setup lang="ts">
/**
 * VueIcon
 * Auto-generated from: .unused-assets/src/assets/vue.svg
 * Use: <VueIcon /> or <VueIcon :size="32" color="red" />
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
    viewBox="0 0 256 198"
    fill="none"
    xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" preserveAspectRatio="xMidYMid meet"
    :style="{ color }"
  >
    <path fill="currentColor" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z" /><path fill="currentColor" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0H0Z" /><path fill="currentColor" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0H50.56Z" />
  </svg>
</template>
