<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Predefined sizes or a custom width number in px */
    size?: 'sm' | 'md' | 'lg' | number
    /** Whether to animate the logo on mount */
    animated?: boolean
    /** Show only the icon (first letter + dot) for collapsed sidebar */
    iconOnly?: boolean
  }>(),
  {
    size: 'md',
    animated: true,
    iconOnly: false,
  },
)
const mounted = ref(false)
onMounted(() => {
  if (props.animated) {
    requestAnimationFrame(() => {
      mounted.value = true
    })
  }
  else {
    mounted.value = true
  }
})
</script>

<template>
  <div
    class="neop-logo inline-flex items-center"
    :class="{ 'neop-logo--animated': animated, 'neop-logo--visible': mounted }"
  >
    <div v-if="iconOnly" class="neop-logo__dot w-6 h-6 rounded-full bg-primary flex-shrink-0 shadow-lg shadow-primary/30" />
    <div v-else class="flex items-center gap-3">
      <div
        class="neop-logo__dot w-6 h-6 rounded-full bg-primary flex-shrink-0 shadow-lg shadow-primary/30"
      />
      <span class="neop-logo__text text-xl font-bold tracking-widest uppercase text-foreground">
        <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
        Aeroenix
      </span>
    </div>
  </div>
</template>

<style scoped>
/* Base state: hidden until mounted */
.neop-logo--animated .neop-logo__text {
  opacity: 0;
  transform: translateX(-12px);
  transition:
    opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.neop-logo--animated .neop-logo__dot {
  opacity: 0;
  transform: scale(0);
  transition:
    opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
/* Reveal on mount */
.neop-logo--animated.neop-logo--visible .neop-logo__dot {
  opacity: 1;
  transform: scale(1);
  transition-delay: 0.1s;
}
.neop-logo--animated.neop-logo--visible .neop-logo__text {
  opacity: 1;
  transform: translateX(0);
  transition-delay: 0.25s;
}
/* Subtle pulse on the dot */
@keyframes dot-pulse {
  0%,
  100% {
    filter: brightness(1) drop-shadow(0 0 4px var(--color-primary-500));
  }
  50% {
    filter: brightness(1.2) drop-shadow(0 0 10px var(--color-primary-500));
  }
}
.neop-logo--visible .neop-logo__dot {
  animation: dot-pulse 3s ease-in-out 1.2s infinite;
}
</style>
