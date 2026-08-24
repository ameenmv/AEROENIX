<script setup lang="ts">
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/uic/number-field'
</script>

<template>
  <Story title="NumberField" group="inputs" icon="lucide:hash">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="max-w-xs space-y-4">
            <NumberField :default-value="5">
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
            <NumberField :default-value="0" :min="0" :max="10" disabled>
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="max-w-xs space-y-4">
            <NumberField :default-value="5">
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
            <NumberField :default-value="0" :min="0" :max="10" disabled>
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
