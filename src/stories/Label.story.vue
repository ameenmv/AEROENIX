<script setup lang="ts">
import { Label } from '@/components/uic/label'
</script>

<template>
  <Story title="Label" group="inputs" icon="lucide:type">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <Label>Default Label</Label>
          <Label class="text-destructive">Error Label</Label>
          <Label class="text-muted-foreground">Muted Label</Label>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <Label>Default Label</Label>
          <Label class="text-destructive">Error Label</Label>
          <Label class="text-muted-foreground">Muted Label</Label>
        </div>
      </div>
    </Variant>
  </Story>
</template>
