<script setup lang="ts">
import { Slider } from '@/components/uic/slider'
</script>

<template>
  <Story title="Slider" group="inputs" icon="lucide:sliders-horizontal">
    <Variant title="Values">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="space-y-6 max-w-sm">
            <Slider :default-value="[25]" :max="100" :step="1" />
            <Slider :default-value="[50]" :max="100" :step="1" />
            <Slider :default-value="[75]" :max="100" :step="1" />
            <Slider :default-value="[25, 75]" :max="100" :step="1" />
            <Slider :default-value="[50]" :max="100" :step="1" disabled />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="space-y-6 max-w-sm">
            <Slider :default-value="[25]" :max="100" :step="1" />
            <Slider :default-value="[50]" :max="100" :step="1" />
            <Slider :default-value="[75]" :max="100" :step="1" />
            <Slider :default-value="[25, 75]" :max="100" :step="1" />
            <Slider :default-value="[50]" :max="100" :step="1" disabled />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
