<script setup lang="ts">
import { Label } from '@/components/uic/label'
import { Switch } from '@/components/uic/switch'
</script>

<template>
  <Story title="Switch" group="inputs" icon="lucide:toggle-left">
    <Variant title="States">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <Switch id="l-switch-off" />
              <Label for="l-switch-off">Unchecked</Label>
            </div>
            <div class="flex items-center gap-3">
              <Switch id="l-switch-on" :default-checked="true" />
              <Label for="l-switch-on">Checked</Label>
            </div>
            <div class="flex items-center gap-3">
              <Switch id="l-switch-dis" disabled />
              <Label for="l-switch-dis" class="opacity-50">Disabled</Label>
            </div>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <Switch id="d-switch-off" />
              <Label for="d-switch-off">Unchecked</Label>
            </div>
            <div class="flex items-center gap-3">
              <Switch id="d-switch-on" :default-checked="true" />
              <Label for="d-switch-on">Checked</Label>
            </div>
            <div class="flex items-center gap-3">
              <Switch id="d-switch-dis" disabled />
              <Label for="d-switch-dis" class="opacity-50">Disabled</Label>
            </div>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
