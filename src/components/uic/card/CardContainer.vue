<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/uic/card'
import { cn } from '@/utils/cn'

interface Props {
  variant?: 'default' | 'statistic' | 'chart' | 'form'
  noPadding?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  noPadding: false,
})
const cardClasses = computed(() => {
  return cn('transition-all duration-300 w-full', {
    'rounded-xl shadow-sm': props.variant === 'default',
    'rounded-lg shadow-[2px_2px_15px_rgba(255,255,255,0.03)] border-none':
      props.variant === 'statistic',
    'rounded-lg bg-background border-none shadow-none': props.variant === 'chart',
    'rounded-[10px]': props.variant === 'form',
  })
})
const contentClasses = computed(() => {
  if (props.noPadding)
    return 'p-0'
  return cn({
    'p-4 sm:p-6': props.variant === 'default',
    'p-8': props.variant === 'statistic' || props.variant === 'form',
    'p-2.5': props.variant === 'chart',
  })
})
</script>

<template>
  <Card :class="cn(cardClasses, $attrs.class as string)">
    <CardHeader v-if="$slots.header" class="border-b px-4 py-4 sm:px-6">
      <CardTitle class="m-0 text-sm font-bold uppercase tracking-wider text-foreground">
        <slot name="header" />
      </CardTitle>
    </CardHeader>
    <CardContent :class="contentClasses">
      <slot />
    </CardContent>
    <CardFooter v-if="$slots.footer" class="bg-muted/50 border-t px-4 py-4 sm:px-6">
      <slot name="footer" />
    </CardFooter>
  </Card>
</template>
