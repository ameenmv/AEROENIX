<script setup lang="ts">
import { Toggle } from '@/components/uic/toggle'
</script>

<template>
  <Story title="Toggle" group="inputs" icon="lucide:pin">
    <Variant title="Variants & Sizes">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-muted-foreground uppercase">
              Variants
            </h4>
            <div class="flex gap-3">
              <Toggle variant="default">
                Default
              </Toggle>
              <Toggle variant="outline">
                Outline
              </Toggle>
            </div>
            <h4 class="text-sm font-semibold text-muted-foreground uppercase">
              Sizes
            </h4>
            <div class="flex gap-3 items-center">
              <Toggle size="sm">
                Sm
              </Toggle>
              <Toggle size="default">
                Md
              </Toggle>
              <Toggle size="lg">
                Lg
              </Toggle>
            </div>
            <h4 class="text-sm font-semibold text-muted-foreground uppercase">
              Disabled
            </h4>
            <Toggle disabled>
              Disabled
            </Toggle>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-muted-foreground uppercase">
              Variants
            </h4>
            <div class="flex gap-3">
              <Toggle variant="default">
                Default
              </Toggle>
              <Toggle variant="outline">
                Outline
              </Toggle>
            </div>
            <h4 class="text-sm font-semibold text-muted-foreground uppercase">
              Sizes
            </h4>
            <div class="flex gap-3 items-center">
              <Toggle size="sm">
                Sm
              </Toggle>
              <Toggle size="default">
                Md
              </Toggle>
              <Toggle size="lg">
                Lg
              </Toggle>
            </div>
            <h4 class="text-sm font-semibold text-muted-foreground uppercase">
              Disabled
            </h4>
            <Toggle disabled>
              Disabled
            </Toggle>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
