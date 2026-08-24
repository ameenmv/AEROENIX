<script setup lang="ts">
/**
 * StatusBadge — Unified status badge component.
 *
 * @example
 * <!-- Auto-resolve from backend status.color (simplest) -->
 * <StatusBadge :status="row.status" />
 *
 * <!-- With explicit variant map from enum file -->
 * <StatusBadge :variants="WhatsAppTemplateStatusVariants" :status="row.status" />
 *
 * <!-- Direct variant object -->
 * <StatusBadge :variant="VARIANTS.green" label="Active" />
 *
 * <!-- Color string shorthand -->
 * <StatusBadge color="green" label="Active" />
 */
import type { StatusVariant, StatusVariantMap } from '@/utils/statusVariants'
import { getVariantByColor, resolveStatusVariant } from '@/utils/statusVariants'

const props = withDefaults(
  defineProps<{
    /** Pre-resolved variant object (highest priority) */
    variant?: StatusVariant
    /** Variant map from enum file (e.g. WhatsAppTemplateStatusVariants) */
    variants?: StatusVariantMap
    /** Backend status object { value, label, color, badge } or string */
    status?: { value?: number, label?: string, color?: string, badge?: string } | string | null
    /** Display label override. Falls back to status.badge → status.label */
    label?: string
    /** Direct color name ('green', 'red', 'yellow') when no enum lookup needed */
    color?: string
    /** Size variant */
    size?: 'xs' | 'sm' | 'md'
  }>(),
  {
    size: 'sm',
  },
)

const resolved = computed<StatusVariant>(() => {
  // 1. Direct variant prop
  if (props.variant)
    return props.variant

  // 2. Resolve from status (optionally using variants map)
  if (props.status)
    return resolveStatusVariant(props.status, props.variants)

  // 3. Direct color
  if (props.color)
    return getVariantByColor(props.color)

  return getVariantByColor('slate')
})

const displayLabel = computed(() => {
  if (props.label)
    return props.label
  if (!props.status)
    return ''
  if (typeof props.status === 'string')
    return props.status
  return props.status.badge || props.status.label || ''
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'px-[8px] py-[2px] text-[9px] gap-[4px]'
    case 'md':
      return 'px-[12px] py-[5px] text-[12px] gap-[8px]'
    case 'sm':
    default:
      return 'px-[10px] py-[3px] text-[10px] gap-[6px]'
  }
})

const dotSize = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'w-[4px] h-[4px]'
    case 'md':
      return 'w-[6px] h-[6px]'
    case 'sm':
    default:
      return 'w-[5px] h-[5px]'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full font-[600] whitespace-nowrap"
    :class="[resolved.badgeClass, sizeClasses]"
  >
    <span class="rounded-full" :class="[resolved.dotColor, dotSize]" />
    {{ displayLabel }}
  </span>
</template>
