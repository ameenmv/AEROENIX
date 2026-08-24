<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { Loader2Icon } from 'lucide-vue-next'
import { Primitive } from 'reka-ui'
import { cn } from '@/utils/cn'
import { buttonVariants } from '.'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  block?: boolean
  loading?: boolean
  class?: HTMLAttributes['class']
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  loading: false,
  block: false,
})
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :disabled="disabled || loading"
    :class="cn(buttonVariants({ variant, size, block }), props.class)"
  >
    <Loader2Icon v-if="loading" class="animate-spin" />
    <slot v-else />
  </Primitive>
</template>
