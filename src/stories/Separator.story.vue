<script setup lang="ts">
import { Separator } from '@/components/uic/separator'
</script>

<template>
  <Story title="Separator" group="display" icon="lucide:minus">
    <Variant title="Orientations">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="space-y-4 max-w-sm">
            <p class="text-sm text-foreground">
              Horizontal Separator
            </p>
            <Separator />
            <p class="text-sm text-foreground">
              Content below the separator
            </p>
          </div>
          <div class="flex gap-4 items-center h-8 mt-4">
            <span class="text-sm text-foreground">Left</span>
            <Separator orientation="vertical" />
            <span class="text-sm text-foreground">Middle</span>
            <Separator orientation="vertical" />
            <span class="text-sm text-foreground">Right</span>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="space-y-4 max-w-sm">
            <p class="text-sm text-foreground">
              Horizontal Separator
            </p>
            <Separator />
            <p class="text-sm text-foreground">
              Content below the separator
            </p>
          </div>
          <div class="flex gap-4 items-center h-8 mt-4">
            <span class="text-sm text-foreground">Left</span>
            <Separator orientation="vertical" />
            <span class="text-sm text-foreground">Middle</span>
            <Separator orientation="vertical" />
            <span class="text-sm text-foreground">Right</span>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
