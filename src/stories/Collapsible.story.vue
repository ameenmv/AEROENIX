<script setup lang="ts">
import { ChevronsUpDown } from 'lucide-vue-next'
import { ref } from 'vue'
import { Button } from '@/components/uic/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/uic/collapsible'

const open = ref(false)
</script>

<template>
  <Story title="Collapsible" group="display" icon="lucide:chevrons-up-down">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <Collapsible v-model:open="open" class="w-[350px] space-y-2">
            <div class="flex items-center justify-between space-x-4 px-4">
              <h4 class="text-sm font-semibold">
                @peduarte starred 3 repositories
              </h4>
              <CollapsibleTrigger as-child>
                <Button variant="ghost" size="sm" class="w-9 p-0">
                  <ChevronsUpDown class="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <div class="rounded-md border px-4 py-3 font-mono text-sm">
              @radix-ui/primitives
            </div>
            <CollapsibleContent class="space-y-2">
              <div class="rounded-md border px-4 py-3 font-mono text-sm">
                @radix-ui/colors
              </div>
              <div class="rounded-md border px-4 py-3 font-mono text-sm">
                @stitches/react
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <Collapsible class="w-[350px] space-y-2">
            <div class="flex items-center justify-between space-x-4 px-4">
              <h4 class="text-sm font-semibold">
                3 hidden items
              </h4>
              <CollapsibleTrigger as-child>
                <Button variant="ghost" size="sm" class="w-9 p-0">
                  <ChevronsUpDown class="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <div class="rounded-md border px-4 py-3 font-mono text-sm">
              Item 1
            </div>
            <CollapsibleContent class="space-y-2">
              <div class="rounded-md border px-4 py-3 font-mono text-sm">
                Item 2
              </div>
              <div class="rounded-md border px-4 py-3 font-mono text-sm">
                Item 3
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </Variant>
  </Story>
</template>
