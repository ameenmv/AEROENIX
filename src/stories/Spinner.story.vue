<script setup lang="ts">
import { Spinner } from '@/components/uic/spinner'
</script>

<template>
  <Story title="Spinner" group="display" icon="lucide:loader-2">
    <Variant title="Sizes">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="flex gap-6 items-center">
            <Spinner class="size-4" />
            <Spinner class="size-6" />
            <Spinner class="size-8" />
            <Spinner class="size-12 text-primary" />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="flex gap-6 items-center">
            <Spinner class="size-4" />
            <Spinner class="size-6" />
            <Spinner class="size-8" />
            <Spinner class="size-12 text-primary" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
