<script setup lang="ts">
import { Label } from '@/components/uic/label'
import { RadioGroup, RadioGroupItem } from '@/components/uic/radio-group'
</script>

<template>
  <Story title="RadioGroup" group="inputs" icon="lucide:circle-dot">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <RadioGroup default-value="option1">
            <div class="flex items-center gap-2">
              <RadioGroupItem id="l-r1" value="option1" />
              <Label for="l-r1">Option One</Label>
            </div>
            <div class="flex items-center gap-2">
              <RadioGroupItem id="l-r2" value="option2" />
              <Label for="l-r2">Option Two</Label>
            </div>
            <div class="flex items-center gap-2">
              <RadioGroupItem id="l-r3" value="option3" disabled />
              <Label for="l-r3" class="opacity-50">Disabled</Label>
            </div>
          </RadioGroup>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <RadioGroup default-value="option1">
            <div class="flex items-center gap-2">
              <RadioGroupItem id="d-r1" value="option1" />
              <Label for="d-r1">Option One</Label>
            </div>
            <div class="flex items-center gap-2">
              <RadioGroupItem id="d-r2" value="option2" />
              <Label for="d-r2">Option Two</Label>
            </div>
            <div class="flex items-center gap-2">
              <RadioGroupItem id="d-r3" value="option3" disabled />
              <Label for="d-r3" class="opacity-50">Disabled</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </Variant>
  </Story>
</template>
