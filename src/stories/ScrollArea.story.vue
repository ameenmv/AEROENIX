<script setup lang="ts">
import { ScrollArea } from '@/components/uic/scroll-area'
import { Separator } from '@/components/uic/separator'

const tags = Array.from({ length: 50 }).map((_, i) => `v1.${i}.0-beta.${i}`)
</script>

<template>
  <Story title="ScrollArea" group="display" icon="lucide:scroll">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <ScrollArea class="h-72 w-48 rounded-md border">
            <div class="p-4">
              <h4 class="mb-4 text-sm font-medium leading-none">
                Tags
              </h4>
              <div v-for="tag in tags" :key="tag">
                <div class="text-sm">
                  {{ tag }}
                </div>
                <Separator class="my-2" />
              </div>
            </div>
          </ScrollArea>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <ScrollArea class="h-72 w-48 rounded-md border">
            <div class="p-4">
              <h4 class="mb-4 text-sm font-medium leading-none">
                Tags
              </h4>
              <div v-for="tag in tags" :key="tag">
                <div class="text-sm">
                  {{ tag }}
                </div>
                <Separator class="my-2" />
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </Variant>
  </Story>
</template>
