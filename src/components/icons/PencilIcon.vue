<script setup lang="ts">
/**
 * PencilIcon
 * Auto-generated from: .unused-assets/public/icons/pencil.svg
 * Use: <PencilIcon /> or <PencilIcon :size="32" color="red" />
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
    viewBox="0 0 12 10"
    fill="none"
    :style="{ color }"
  >
    <path
      d="M10.2456 1.04411C10.1036 0.916914 9.9351 0.816289 9.74972 0.748046C9.56433 0.679803 9.36576 0.645295 9.16547 0.646516C8.96518 0.647736 8.76715 0.68466 8.5828 0.755156C8.39846 0.825652 8.23146 0.928321 8.09146 1.05723L2.47786 6.10955C2.19828 6.36118 1.99532 6.68654 1.89229 7.04829L1.49812 8.43225C1.41471 8.7251 1.67609 9.00005 1.97279 8.93157L3.68571 8.53616C4.01613 8.45989 4.32174 8.30085 4.5738 8.07399L10.231 2.98245C10.3742 2.85651 10.4884 2.70625 10.5667 2.54036C10.6451 2.37448 10.6861 2.19627 10.6875 2.01602C10.6888 1.83577 10.6505 1.65707 10.5746 1.49025C10.4988 1.32343 10.3869 1.17179 10.2456 1.04411Z"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
