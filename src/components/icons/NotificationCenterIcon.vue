<script setup lang="ts">
/**
 * NotificationCenterIcon
 * Auto-generated from: .unused-assets/public/icons/Notification-Center.svg
 * Use: <NotificationCenterIcon /> or <NotificationCenterIcon :size="32" color="red" />
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
    viewBox="0 0 13 15"
    fill="none"
    :style="{ color }"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M1.21729 5.21787C1.21729 2.33647 3.5531 -1.63043e-06 6.43468 0C9.31624 1.63044e-06 11.6521 2.33648 11.6521 5.21787V7.06096L12.552 9.58083C12.6499 9.8548 12.7353 10.0941 12.7902 10.294C12.8469 10.5008 12.8914 10.7335 12.8577 10.981C12.7861 11.5064 12.4635 11.9641 11.9928 12.2082C11.7711 12.3232 11.537 12.3596 11.3232 12.3757C11.1164 12.3913 10.8623 12.3913 10.5715 12.3913H9.04337C9.04337 13.832 7.87539 15 6.43468 15C4.99393 15 3.82598 13.832 3.82598 12.3913H2.29788C2.00701 12.3913 1.75291 12.3913 1.54619 12.3757C1.33241 12.3596 1.09828 12.3232 0.876516 12.2082C0.405843 11.9641 0.0832643 11.5064 0.0116752 10.981C-0.0220487 10.7335 0.0224621 10.5008 0.0791686 10.294C0.133997 10.0941 0.219464 9.8548 0.31731 9.58089L1.21729 7.06096V5.21787ZM5.13033 12.3913C5.13033 13.1117 5.71428 13.6957 6.43468 13.6957C7.15507 13.6957 7.73902 13.1117 7.73902 12.3913H5.13033Z"
      fill="currentColor"
    />
  </svg>
</template>
