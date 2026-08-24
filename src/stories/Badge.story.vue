<script setup lang="ts">
import { Badge } from '@/components/uic/badge'
</script>

<template>
  <Story title="Badge" group="display" icon="lucide:tag">
    <Variant title="All Variants">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="flex flex-wrap gap-3">
            <Badge variant="default">
              Default
            </Badge>
            <Badge variant="secondary">
              Secondary
            </Badge>
            <Badge variant="destructive">
              Destructive
            </Badge>
            <Badge variant="danger">
              Danger
            </Badge>
            <Badge variant="success">
              Success
            </Badge>
            <Badge variant="warning">
              Warning
            </Badge>
            <Badge variant="info">
              Info
            </Badge>
            <Badge variant="outline">
              Outline
            </Badge>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="flex flex-wrap gap-3">
            <Badge variant="default">
              Default
            </Badge>
            <Badge variant="secondary">
              Secondary
            </Badge>
            <Badge variant="destructive">
              Destructive
            </Badge>
            <Badge variant="danger">
              Danger
            </Badge>
            <Badge variant="success">
              Success
            </Badge>
            <Badge variant="warning">
              Warning
            </Badge>
            <Badge variant="info">
              Info
            </Badge>
            <Badge variant="outline">
              Outline
            </Badge>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
