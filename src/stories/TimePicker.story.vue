<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker } from '@/components/uic/time-picker'

const time = ref('14:30')
</script>

<template>
  <Story title="TimePicker" group="inputs" icon="lucide:clock">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="space-y-4">
            <TimePicker v-model="time" />
            <p class="text-xs text-muted-foreground">
              Value: {{ time }}
            </p>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <TimePicker v-model="time" />
        </div>
      </div>
    </Variant>
  </Story>
</template>
