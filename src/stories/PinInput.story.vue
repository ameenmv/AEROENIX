<script setup lang="ts">
import { ref } from 'vue'
import { PinInput, PinInputGroup, PinInputSlot } from '@/components/uic/pin-input'

const value = ref<string[]>([])
</script>

<template>
  <Story title="PinInput" group="inputs" icon="lucide:lock-keyhole">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <PinInput v-model="value" placeholder="○">
            <PinInputGroup>
              <PinInputSlot v-for="(_, i) in 6" :key="i" :index="i" />
            </PinInputGroup>
          </PinInput>
          <p class="text-xs text-muted-foreground">
            Value: {{ value.join('') }}
          </p>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <PinInput placeholder="○">
            <PinInputGroup>
              <PinInputSlot v-for="(_, i) in 4" :key="i" :index="i" />
            </PinInputGroup>
          </PinInput>
        </div>
      </div>
    </Variant>
  </Story>
</template>
