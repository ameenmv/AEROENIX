<script setup lang="ts">
import type { Props } from '@/types/components/scrollable-list'

withDefaults(defineProps<Props>(), {
  items: () => [],
  showBadge: true,
})
</script>

<template>
  <div class="overflow-y-auto space-y-2 pr-2 custom-scrollbar">
    <slot :items="items">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors group cursor-pointer"
      >
        <span class="text-sm text-white/80 group-hover:text-white transition-colors">
          {{ item.label }}
        </span>
        <span
          v-if="showBadge && item.badge"
          class="text-[10px] group-hover:text-primary transition-colors uppercase font-bold"
          :class="item.badgeColor || 'text-primary/60'"
        >
          {{ item.badge }}
        </span>
      </div>
    </slot>
  </div>
</template>
