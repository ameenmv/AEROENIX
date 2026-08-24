<script setup lang="ts">
import { StatusBadge } from '@/components/uic/status-badge'
</script>

<template>
  <Story title="StatusBadge" group="display" icon="lucide:circle-dot">
    <Variant title="All Variants">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="flex flex-wrap gap-3">
            <StatusBadge variant="success" label="Active" />
            <StatusBadge variant="warning" label="Pending" />
            <StatusBadge variant="danger" label="Rejected" />
            <StatusBadge variant="info" label="Processing" />
            <StatusBadge variant="neutral" label="Draft" />
            <StatusBadge variant="violet" label="Review" />
          </div>
          <h4 class="text-sm font-semibold text-foreground">
            Sizes
          </h4>
          <div class="flex flex-wrap gap-3 items-center">
            <StatusBadge variant="success" size="sm" label="Small" />
            <StatusBadge variant="success" size="default" label="Default" />
            <StatusBadge variant="success" size="lg" label="Large" />
          </div>
          <h4 class="text-sm font-semibold text-foreground">
            No Dot
          </h4>
          <div class="flex flex-wrap gap-3">
            <StatusBadge variant="success" :dot="false" label="No dot" />
            <StatusBadge variant="danger" :dot="false" label="No dot" />
          </div>
          <h4 class="text-sm font-semibold text-foreground">
            Pulse
          </h4>
          <div class="flex flex-wrap gap-3">
            <StatusBadge variant="success" :pulse="true" label="Live" />
            <StatusBadge variant="warning" :pulse="true" label="Syncing" />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="flex flex-wrap gap-3">
            <StatusBadge variant="success" label="Active" />
            <StatusBadge variant="warning" label="Pending" />
            <StatusBadge variant="danger" label="Rejected" />
            <StatusBadge variant="info" label="Processing" />
            <StatusBadge variant="neutral" label="Draft" />
            <StatusBadge variant="violet" label="Review" />
          </div>
          <h4 class="text-sm font-semibold text-foreground">
            Pulse
          </h4>
          <div class="flex flex-wrap gap-3">
            <StatusBadge variant="success" :pulse="true" label="Live" />
            <StatusBadge variant="warning" :pulse="true" label="Syncing" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
