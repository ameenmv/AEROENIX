<script setup lang="ts">
import { Calendar } from '@/components/uic/calendar'
</script>

<template>
  <Story title="Calendar" group="display" icon="lucide:calendar">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border flex justify-center">
          <h3 class="text-lg font-bold text-foreground sr-only">
            Light
          </h3>
          <Calendar />
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border flex justify-center">
          <h3 class="text-lg font-bold text-foreground sr-only">
            Dark
          </h3>
          <Calendar />
        </div>
      </div>
    </Variant>
  </Story>
</template>
