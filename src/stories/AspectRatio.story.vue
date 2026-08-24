<script setup lang="ts">
import { AspectRatio } from '@/components/uic/aspect-ratio'
</script>

<template>
  <Story title="AspectRatio" group="display" icon="lucide:ratio">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="w-[300px]">
            <AspectRatio
              :ratio="16 / 9"
              class="bg-muted rounded-md flex items-center justify-center"
            >
              <span class="text-sm text-muted-foreground">16:9</span>
            </AspectRatio>
          </div>
          <div class="w-[200px]">
            <AspectRatio :ratio="1" class="bg-muted rounded-md flex items-center justify-center">
              <span class="text-sm text-muted-foreground">1:1</span>
            </AspectRatio>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="w-[300px]">
            <AspectRatio
              :ratio="4 / 3"
              class="bg-muted rounded-md flex items-center justify-center"
            >
              <span class="text-sm text-muted-foreground">4:3</span>
            </AspectRatio>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
