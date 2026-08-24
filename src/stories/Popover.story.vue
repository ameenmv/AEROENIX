<script setup lang="ts">
import { Button } from '@/components/uic/button'
import InputField from '@/components/uic/inputs/InputField.vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/uic/popover'
</script>

<template>
  <Story title="Popover" group="overlays" icon="lucide:message-square">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div
          class="light p-8 rounded-xl bg-background border border-border flex justify-center py-16"
        >
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline">
                Open Popover (Light)
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-80">
              <div class="space-y-4">
                <h4 class="font-medium text-sm text-foreground">
                  Quick Settings
                </h4>
                <InputField label="Width" placeholder="100%" size="sm" />
                <InputField label="Height" placeholder="auto" size="sm" />
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div
          class="dark p-8 rounded-xl bg-background border border-border flex justify-center py-16"
        >
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline">
                Open Popover (Dark)
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-80">
              <div class="space-y-4">
                <h4 class="font-medium text-sm text-foreground">
                  Quick Settings
                </h4>
                <InputField label="Width" placeholder="100%" size="sm" />
                <InputField label="Height" placeholder="auto" size="sm" />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Variant>
  </Story>
</template>
