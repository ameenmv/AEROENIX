<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

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
const svgWidth = computed(() => {
  if (props.iconOnly)
    return 32
  if (typeof props.size === 'number')
    return props.size
  const sizes = { sm: 32, md: 88, lg: 200 }
  return sizes[props.size]
})
</script>

<template>
  <div
    class="neop-logo inline-flex items-center"
    :class="{ 'neop-logo--animated': animated, 'neop-logo--visible': mounted }"
  >
    <img v-if="iconOnly" src="../../../docs/public/image.png" class="w-6 h-6">
    <svg
      v-else
      :width="svgWidth"
      height="auto"
      viewBox="0 0 571 135"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#neop-clip)">
        <!-- N letter -->
        <path
          class="neop-logo__letter neop-logo__n"
          d="M134.99 67.4973V134.99H105.187V67.4973C105.187 57.5012 101.217 47.9145 94.1482 40.8462C87.08 33.778 77.4933 29.8071 67.4972 29.8071C57.5012 29.8071 47.9145 33.778 40.8462 40.8462C33.7779 47.9145 29.8071 57.5012 29.8071 67.4973V134.99H0V67.4973C0.0224185 56.426 2.74968 45.5279 7.94457 35.7511C13.1395 25.9742 20.6446 17.6147 29.8071 11.3999C36.7311 6.7837 44.463 3.51353 52.598 1.76061C62.3944 -0.580402 72.6044 -0.580402 82.4007 1.76061C90.5339 3.51526 98.264 6.78532 105.187 11.3999C114.349 17.6155 121.853 25.9753 127.047 35.752C132.241 45.5288 134.968 56.4264 134.99 67.4973Z"
          fill="currentColor"
        />
        <!-- E letter -->
        <path
          class="neop-logo__letter neop-logo__e"
          d="M177.338 56.102C179.612 48.468 184.301 41.7774 190.701 37.0353C197.101 32.2932 204.867 29.7554 212.832 29.8029C220.814 29.691 228.611 32.204 235.026 36.9555C241.44 41.7071 246.116 48.434 248.335 56.102H177.338ZM280.334 67.4975C280.485 50.9858 274.635 34.9811 263.87 22.4597C253.106 9.93838 238.16 1.75273 221.813 -0.574758C205.465 -2.90225 188.829 0.786816 174.997 9.80631C161.166 18.8258 151.081 32.5618 146.618 48.4597C142.156 64.3576 143.619 81.3352 150.736 96.2351C157.853 111.135 170.139 122.943 185.31 129.463C200.481 135.983 217.503 136.771 233.211 131.681C248.919 126.59 262.244 115.968 270.707 101.79L245.24 86.6838C241.899 92.3032 237.157 96.9602 231.479 100.2C225.8 103.44 219.379 105.153 212.841 105.17C204.836 105.126 197.058 102.501 190.664 97.6843C184.269 92.8679 179.599 86.1174 177.347 78.4354H279.462C279.991 74.8063 280.285 71.1468 280.342 67.4799"
          fill="currentColor"
        />
        <!-- O (red dot) -->
        <path
          class="neop-logo__dot"
          d="M425.662 67.5022C425.661 80.8515 421.702 93.9008 414.285 105C406.868 116.099 396.326 124.75 383.993 129.858C371.66 134.966 358.089 136.303 344.996 133.698C331.903 131.093 319.877 124.665 310.437 115.226C300.998 105.786 294.569 93.7598 291.965 80.667C289.36 67.5742 290.697 54.0031 295.805 41.6698C300.913 29.3364 309.564 18.7948 320.663 11.3778C331.762 3.96073 344.811 0.00142 358.161 0.00054946C367.025 -2.86227e-05 375.803 1.74555 383.993 5.13762C392.183 8.52969 399.625 13.5018 405.893 19.77C412.161 26.0383 417.133 33.4798 420.525 41.6698C423.917 49.8597 425.663 58.6376 425.662 67.5022Z"
          fill="#ED1F4A"
        />
        <!-- P letter -->
        <path
          class="neop-logo__letter neop-logo__p"
          d="M503.503 105.188C493.506 105.188 483.918 101.216 476.849 94.1472C469.78 87.0781 465.809 77.4904 465.809 67.4931C465.809 57.4959 469.78 47.9083 476.849 40.8392C483.918 33.7701 493.506 29.7986 503.503 29.7986C513.5 29.7986 523.088 33.7701 530.157 40.8392C537.226 47.9083 541.198 57.4959 541.198 67.4931C541.198 77.4904 537.226 87.0781 530.157 94.1472C523.088 101.216 513.5 105.188 503.503 105.188ZM503.503 -0.00852602C490.102 0.0713852 477.01 4.02928 465.809 11.3871C456.646 17.6028 449.142 25.9631 443.948 35.7408C438.753 45.5184 436.027 56.4172 436.006 67.4888V134.982H465.809V120.457C476.036 129.969 489.537 135.172 503.503 134.982C512.413 135.054 521.248 133.361 529.5 130.001C537.752 126.641 545.257 121.681 551.583 115.407C557.908 109.132 562.929 101.667 566.355 93.4426C569.782 85.218 571.545 76.3963 571.545 67.4866C571.545 58.5768 569.782 49.7553 566.355 41.5307C562.929 33.306 557.908 25.8411 551.583 19.5665C545.257 13.2918 537.752 8.33162 529.5 4.97193C521.248 1.61224 512.413 -0.0804741 503.503 -0.00852602Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="neop-clip">
          <rect width="571" height="134.999" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  </div>
</template>

<style scoped>
/* Base state: letters hidden until mounted */
.neop-logo--animated .neop-logo__letter {
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.neop-logo--animated .neop-logo__dot {
  opacity: 0;
  transform: scale(0);
  transition:
    opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
/* Staggered reveal on mount */
.neop-logo--animated.neop-logo--visible .neop-logo__n {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.05s;
}
.neop-logo--animated.neop-logo--visible .neop-logo__e {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.15s;
}
.neop-logo--animated.neop-logo--visible .neop-logo__dot {
  opacity: 1;
  transform: scale(1);
  transition-delay: 0.3s;
}
.neop-logo--animated.neop-logo--visible .neop-logo__p {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.4s;
}
/* Subtle pulse on the red dot after animation completes */
@keyframes dot-pulse {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}
.neop-logo--visible .neop-logo__dot {
  animation: dot-pulse 3s ease-in-out 1.2s infinite;
}
</style>
