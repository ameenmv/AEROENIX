<script setup lang="ts">
/**
 * LoaderBtn — button that shows a spinner while an async action is in progress.
 * Composes shadcn Button + Spinner for consistent loading patterns.
 */
import type { HTMLAttributes } from 'vue'
import type { LoaderBtnVariants } from './variants'
import { Button } from '@/components/uic/button'
import { Spinner } from '@/components/uic/spinner'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    /** Show loading spinner */
    loading?: boolean
    /** Button text (alternative to slot) */
    label?: string
    /** How the spinner appears */
    loadingStyle?: LoaderBtnVariants['loadingStyle']
    /** Button variant (passed through to Button) */
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    /** Button size (passed through to Button) */
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm'
    /** Disable the button */
    disabled?: boolean
    /** HTML type attribute */
    type?: 'button' | 'submit' | 'reset'
    class?: HTMLAttributes['class']
  }>(),
  {
    loading: false,
    label: '',
    loadingStyle: 'replace',
    variant: 'default',
    size: 'default',
    disabled: false,
    type: 'button',
  },
)

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <Button
    data-slot="loader-btn"
    :data-loading="loading"
    :variant="variant"
    :size="size"
    :type="type"
    :disabled="disabled || loading"
    :class="cn('relative', props.class)"
    @click="$emit('click', $event)"
  >
    <!-- Spinner overlay (replace mode) -->
    <Spinner
      v-if="loading && loadingStyle === 'replace'"
      class="absolute size-4"
    />

    <!-- Spinner inline (prepend mode) -->
    <Spinner
      v-if="loading && loadingStyle === 'prepend'"
      class="size-3.5 shrink-0"
    />

    <!-- Button content -->
    <span
      data-slot="loader-text"
      :class="cn(loading && loadingStyle === 'replace' && 'invisible')"
    >
      <slot>{{ label }}</slot>
    </span>
  </Button>
</template>
