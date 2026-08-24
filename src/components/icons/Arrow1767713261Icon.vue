<script setup lang="ts">
/**
 * Arrow1767713261Icon
 * Auto-generated from: .unused-assets/public/icons/custom/arrow-1767713261.svg
 * Use: <Arrow1767713261Icon /> or <Arrow1767713261Icon :size="32" color="red" />
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
    viewBox="0 0 22 20"
    :style="{ color }"
  >
    <path
      d="M11.6142 1.99999L20.5758 10.246L12.9885 18.4917"
      stroke="url(#paint0_radial_714_6314)"
      stroke-width="2.11899"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M20.5693 10.2459L1.68721 10.2459"
      stroke="url(#paint1_radial_714_6314)"
      stroke-width="2.11899"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <defs>
      <radialGradient
        id="paint0_radial_714_6314"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(16.4386 10.2459) rotate(85.2366) scale(24.7634 12.3389)"
      >
        <stop stop-color="white" />
        <stop offset="1" stop-color="white" stop-opacity="0" />
      </radialGradient>
      <radialGradient
        id="paint1_radial_714_6314"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(11.1698 10.7442) rotate(85.2376) scale(1.49638 28.1572)"
      >
        <stop stop-color="white" />
        <stop offset="1" stop-color="white" stop-opacity="0" />
      </radialGradient>
    </defs>
  </svg>
</template>
