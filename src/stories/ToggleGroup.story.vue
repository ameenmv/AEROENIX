<script setup lang="ts">
import { Bold, Italic, Underline } from 'lucide-vue-next'
import { ToggleGroup, ToggleGroupItem } from '@/components/uic/toggle-group'
</script>

<template>
  <Story title="ToggleGroup" group="inputs" icon="lucide:toggle-right">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="space-y-4">
            <ToggleGroup type="multiple">
              <ToggleGroupItem value="bold" aria-label="Toggle bold">
                <Bold class="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Toggle italic">
                <Italic class="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Toggle underline">
                <Underline class="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="single" variant="outline">
              <ToggleGroupItem value="a">
                A
              </ToggleGroupItem>
              <ToggleGroupItem value="b">
                B
              </ToggleGroupItem>
              <ToggleGroupItem value="c">
                C
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <ToggleGroup type="multiple">
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <Bold class="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              <Italic class="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline">
              <Underline class="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </Variant>
  </Story>
</template>
