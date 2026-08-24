<script setup lang="ts">
import { ref } from 'vue'
import { InlineEdit } from '@/components/uic/inline-edit'

const text = ref('Click to edit this text')
const number = ref('42')
</script>

<template>
  <Story title="InlineEdit" group="inputs" icon="lucide:pencil">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="space-y-4 max-w-sm">
            <InlineEdit v-model="text" />
            <InlineEdit v-model="number" />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="space-y-4 max-w-sm">
            <InlineEdit v-model="text" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
