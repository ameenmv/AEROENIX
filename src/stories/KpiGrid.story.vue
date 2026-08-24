<script setup lang="ts">
import { KpiGrid } from '@/components/uic/kpi-grid'

const kpis = [
  { label: 'Total Revenue', value: '$45,231', change: '+20.1%', trend: 'up' as const },
  { label: 'Subscriptions', value: '2,350', change: '+180', trend: 'up' as const },
  { label: 'Churn Rate', value: '2.3%', change: '+0.5%', trend: 'down' as const },
  { label: 'Active Users', value: '12,543', change: '+1,234', trend: 'up' as const },
]
</script>

<template>
  <Story title="KpiGrid" group="display" icon="lucide:layout-grid">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <KpiGrid :items="kpis" />
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <KpiGrid :items="kpis" />
        </div>
      </div>
    </Variant>
  </Story>
</template>
