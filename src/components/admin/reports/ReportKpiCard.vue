<script setup lang="ts">
import {
  AlertCircleIcon,
  ArrowDown01Icon,
  FlashIcon,
  StarIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed } from 'vue'

const props = defineProps<{
  type: 'response_time' | 'satisfaction' | 'mistakes' | 'handover'
  value: string | number
  label: string
  subtext?: string
  rating?: number
  stars?: number
  trend?: 'up' | 'down' | 'neutral'
  badgeText?: string
  trendColor?: string
}>()

const iconData = computed(() => {
  switch (props.type) {
    case 'response_time':
      return {
        icon: FlashIcon,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        glow: 'bg-emerald-500/10',
      }
    case 'satisfaction':
      return {
        icon: StarIcon,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        glow: 'bg-amber-500/10',
      }
    case 'mistakes':
      return {
        icon: AlertCircleIcon,
        color: 'text-red-400 bg-red-500/10 border-red-500/20',
        glow: 'bg-red-500/10',
      }
    case 'handover':
      return {
        icon: UserGroupIcon,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        glow: 'bg-blue-500/10',
      }
  }
})
</script>

<template>
  <div class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:shadow-lg cursor-pointer select-none">
    <div
      class="absolute -right-3 -top-3 w-20 h-20 rounded-full blur-xl transition-all pointer-events-none opacity-40 group-hover:opacity-100"
      :class="iconData.glow"
    />

    <div class="flex items-center justify-between gap-2 mb-3">
      <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {{ label }}
      </span>
      <div
        class="h-8 w-8 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110"
        :class="iconData.color"
      >
        <HugeiconsIcon :icon="iconData.icon" :size="16" />
      </div>
    </div>

    <!-- Value -->
    <div class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-1.5">
      {{ value }}
    </div>

    <!-- Footer metadata / badges -->
    <div class="flex items-center gap-1.5 text-xs">
      <!-- Star ratings for guest satisfaction -->
      <template v-if="type === 'satisfaction'">
        <div class="flex items-center gap-0.5 text-amber-400">
          <HugeiconsIcon
            v-for="s in (stars || 5)"
            :key="s"
            :icon="StarIcon"
            :size="13"
            class="fill-amber-400"
          />
        </div>
      </template>

      <!-- Badge / comparison -->
      <template v-else-if="badgeText">
        <span
          class="font-medium px-2 py-0.5 rounded-md text-[11px] border"
          :class="[
            trendColor === 'red'
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : type === 'response_time'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          ]"
        >
          <span v-if="trend === 'down'" class="inline-flex items-center">
            <HugeiconsIcon :icon="ArrowDown01Icon" :size="12" class="me-0.5" />
          </span>
          {{ badgeText }}
        </span>
      </template>

      <span v-if="subtext" class="text-muted-foreground text-[11px]">
        {{ subtext }}
      </span>
    </div>
  </div>
</template>
