<script setup lang="ts">
import { StatCard } from '@/components/uic/stat-card'
</script>

<template>
  <Story title="StatCard" group="display" icon="lucide:bar-chart-3">
    <Variant title="All Variants">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <StatCard
              label="Total Revenue"
              value="$45,231"
              icon="💰"
              :delta="20.1"
              delta-label="vs last month"
              trend="up"
              :spark-data="[10, 15, 8, 22, 18, 30, 28, 35]"
            />
            <StatCard
              label="Active Users"
              value="2,350"
              icon="👥"
              :delta="8.3"
              delta-label="vs last month"
              trend="up"
            />
            <StatCard
              label="Churn Rate"
              value="2.3%"
              icon="📉"
              :delta="-2.3"
              delta-label="vs last month"
              trend="down"
            />
            <StatCard
              label="Activity"
              value="573"
              icon="⚡"
              :spark-data="[5, 20, 10, 30, 15, 40, 25, 45]"
            />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <StatCard
              label="Total Revenue"
              value="$45,231"
              icon="💰"
              :delta="20.1"
              delta-label="vs last month"
              trend="up"
              :spark-data="[10, 15, 8, 22, 18, 30, 28, 35]"
            />
            <StatCard label="Active Users" value="2,350" icon="👥" :delta="8.3" trend="up" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
