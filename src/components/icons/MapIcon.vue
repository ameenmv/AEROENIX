<script setup lang="ts">
/**
 * MapIcon
 * Auto-generated from: .unused-assets/public/icons/map-icon.svg
 * Use: <MapIcon /> or <MapIcon :size="32" color="red" />
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
    viewBox="0 0 12 12"
    fill="none"
    :style="{ color }"
  >
    <path d="M9.28651 4.64276C9.28651 6.96141 6.71431 9.37618 5.85057 10.122C5.7701 10.1825 5.67215 10.2152 5.57148 10.2152C5.4708 10.2152 5.37285 10.1825 5.29238 10.122C4.42864 9.37618 1.85645 6.96141 1.85645 4.64276C1.85645 3.65748 2.24785 2.71254 2.94455 2.01584C3.64126 1.31914 4.58619 0.927734 5.57148 0.927734C6.55676 0.927734 7.5017 1.31914 8.1984 2.01584C8.8951 2.71254 9.28651 3.65748 9.28651 4.64276Z" stroke="currentColor" stroke-width="0.928758" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M5.57282 6.03823C6.34223 6.03823 6.96596 5.4145 6.96596 4.64509C6.96596 3.87568 6.34223 3.25195 5.57282 3.25195C4.80342 3.25195 4.17969 3.87568 4.17969 4.64509C4.17969 5.4145 4.80342 6.03823 5.57282 6.03823Z" stroke="currentColor" stroke-width="0.928758" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
