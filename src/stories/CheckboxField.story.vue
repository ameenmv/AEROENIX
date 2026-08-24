<script setup lang="ts">
import CheckboxField from '@/components/uic/inputs/CheckboxField.vue'
</script>

<template>
  <Story title="CheckboxField" group="inputs" icon="lucide:check-square">
    <Variant title="Variants & Sizes">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="space-y-4">
            <CheckboxField id="l-default" label="Default checkbox" variant="default" />
            <CheckboxField id="l-table" label="Table variant" variant="table" />
            <CheckboxField id="l-sm" label="Small size" size="sm" />
            <CheckboxField id="l-lg" label="Large size" size="lg" />
            <CheckboxField id="l-dis" label="Disabled checkbox" disabled />
            <CheckboxField id="l-err" label="With error" :error="true" />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="space-y-4">
            <CheckboxField id="d-default" label="Default checkbox" variant="default" />
            <CheckboxField id="d-table" label="Table variant" variant="table" />
            <CheckboxField id="d-sm" label="Small size" size="sm" />
            <CheckboxField id="d-lg" label="Large size" size="lg" />
            <CheckboxField id="d-dis" label="Disabled checkbox" disabled />
            <CheckboxField id="d-err" label="With error" :error="true" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
