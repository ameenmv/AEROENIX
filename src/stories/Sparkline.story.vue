<script setup lang="ts">
import { Sparkline } from '@/components/uic/sparkline'
</script>

<template>
  <Story title="Sparkline" group="display" icon="lucide:trending-up">
    <Variant title="All Variants">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="flex flex-wrap gap-6 items-end">
            <div class="space-y-1">
              <span class="text-xs text-muted-foreground">Up trend</span>
              <Sparkline :data="[10, 15, 8, 22, 18, 30, 28, 35]" color="hsl(var(--primary))" />
            </div>
            <div class="space-y-1">
              <span class="text-xs text-muted-foreground">Down trend</span>
              <Sparkline :data="[35, 30, 28, 22, 18, 15, 10, 8]" color="#ef4444" />
            </div>
            <div class="space-y-1">
              <span class="text-xs text-muted-foreground">Flat</span>
              <Sparkline :data="[20, 22, 19, 21, 20, 22, 21, 20]" color="#f59e0b" />
            </div>
            <div class="space-y-1">
              <span class="text-xs text-muted-foreground">Large</span>
              <Sparkline :data="[5, 20, 10, 30, 15, 40, 25, 45]" :width="160" :height="48" color="#8b5cf6" />
            </div>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="flex flex-wrap gap-6 items-end">
            <Sparkline :data="[10, 15, 8, 22, 18, 30, 28, 35]" color="hsl(var(--primary))" />
            <Sparkline :data="[35, 30, 28, 22, 18, 15, 10, 8]" color="#ef4444" />
            <Sparkline :data="[5, 20, 10, 30, 15, 40, 25, 45]" :width="160" :height="48" color="#8b5cf6" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
