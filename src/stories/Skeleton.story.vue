<script setup lang="ts">
import { Skeleton } from '@/components/uic/skeleton'
</script>

<template>
  <Story title="Skeleton" group="display" icon="lucide:square-dashed-bottom">
    <Variant title="Loading Patterns">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="space-y-4 max-w-sm">
            <div class="flex items-center gap-4">
              <Skeleton class="h-12 w-12 rounded-full" />
              <div class="space-y-2 flex-1">
                <Skeleton class="h-4 w-3/4" />
                <Skeleton class="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton class="h-32 w-full rounded-lg" />
            <div class="space-y-2">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-5/6" />
              <Skeleton class="h-4 w-4/6" />
            </div>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="space-y-4 max-w-sm">
            <div class="flex items-center gap-4">
              <Skeleton class="h-12 w-12 rounded-full" />
              <div class="space-y-2 flex-1">
                <Skeleton class="h-4 w-3/4" />
                <Skeleton class="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton class="h-32 w-full rounded-lg" />
            <div class="space-y-2">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-5/6" />
              <Skeleton class="h-4 w-4/6" />
            </div>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
