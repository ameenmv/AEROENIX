<script setup lang="ts">
import { Label } from '@/components/uic/label'
import { Textarea } from '@/components/uic/textarea'
</script>

<template>
  <Story title="Textarea" group="inputs" icon="lucide:align-left">
    <Variant title="States">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="max-w-sm space-y-4">
            <div class="space-y-1.5">
              <Label>Default</Label>
              <Textarea placeholder="Write your message here..." />
            </div>
            <div class="space-y-1.5">
              <Label>Disabled</Label>
              <Textarea placeholder="Cannot type here..." disabled />
            </div>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="max-w-sm space-y-4">
            <div class="space-y-1.5">
              <Label>Default</Label>
              <Textarea placeholder="Write your message here..." />
            </div>
            <div class="space-y-1.5">
              <Label>Disabled</Label>
              <Textarea placeholder="Cannot type here..." disabled />
            </div>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
