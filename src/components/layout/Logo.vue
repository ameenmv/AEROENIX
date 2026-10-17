<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Predefined sizes or a custom width/height number in px */
    size?: 'sm' | 'md' | 'lg' | number
    /** Whether to animate the logo on mount */
    animated?: boolean
    /** Show only the icon (emblem) for collapsed sidebar */
    iconOnly?: boolean
    /** Variant: default or white */
    variant?: 'default' | 'white'
  }>(),
  {
    size: 'md',
    animated: true,
    iconOnly: false,
    variant: 'default',
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

// Use emblem alone when collapsed, and full vertical logo (emblem + AZUL underneath) when expanded
const logoSrc = computed(() => {
  return props.iconOnly ? '/logo-emblem.png' : '/logo-sidebar.png'
})

const sizeClass = computed(() => {
  if (typeof props.size === 'number') return ''
  if (props.iconOnly) {
    switch (props.size) {
      case 'sm':
        return 'h-6 w-auto'
      case 'lg':
        return 'h-9 w-auto'
      case 'md':
      default:
        return 'h-7 w-auto'
    }
  }

  // Expanded vertical logo (emblem + text)
  switch (props.size) {
    case 'sm':
      return 'h-10 w-auto'
    case 'lg':
      return 'h-20 w-auto'
    case 'md':
    default:
      return 'h-14 sm:h-16 w-auto'
  }
})

const customStyle = computed(() => {
  if (typeof props.size === 'number') {
    return { height: `${props.size}px`, width: 'auto' }
  }
  return {}
})
</script>

<template>
  <div
    class="neop-logo inline-flex items-center justify-center select-none"
    :class="{ 'neop-logo--animated': animated, 'neop-logo--visible': mounted }"
  >
    <img
      :src="logoSrc"
      alt="Azul Hospitality"
      class="object-contain transition-all duration-300 hover:scale-[1.03] drop-shadow-[0_2px_12px_rgba(180,139,89,0.22)]"
      :class="sizeClass"
      :style="customStyle"
      loading="eager"
    />
  </div>
</template>

<style scoped>
/* Base state: hidden until mounted */
.neop-logo--animated img {
  opacity: 0;
  transform: scale(0.94);
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.neop-logo--animated.neop-logo--visible img {
  opacity: 1;
  transform: scale(1);
}
</style>
