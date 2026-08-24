<script setup lang="ts">
import InputField from '@/components/uic/inputs/InputField.vue'
</script>

<template>
  <Story title="InputField" group="inputs" icon="lucide:text-cursor-input">
    <Variant title="Variants">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="max-w-sm space-y-4">
            <InputField label="Default Input" placeholder="Type something..." />
            <InputField label="Search Variant" variant="search" placeholder="Search..." />
            <InputField
              label="With Error"
              placeholder="Required field"
              error="This field is required"
            />
            <InputField label="Disabled" placeholder="Cannot edit" disabled />
            <InputField label="Required Field" placeholder="Email" required />
            <InputField label="Textarea" type="textarea" placeholder="Your message..." />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="max-w-sm space-y-4">
            <InputField label="Default Input" placeholder="Type something..." />
            <InputField label="Search Variant" variant="search" placeholder="Search..." />
            <InputField
              label="With Error"
              placeholder="Required field"
              error="This field is required"
            />
            <InputField label="Disabled" placeholder="Cannot edit" disabled />
            <InputField label="Required Field" placeholder="Email" required />
            <InputField label="Textarea" type="textarea" placeholder="Your message..." />
          </div>
        </div>
      </div>
    </Variant>
    <Variant title="Sizes">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="max-w-sm space-y-4">
            <InputField label="Small" size="sm" placeholder="Small input" />
            <InputField label="Medium (Default)" size="md" placeholder="Medium input" />
            <InputField label="Large" size="lg" placeholder="Large input" />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="max-w-sm space-y-4">
            <InputField label="Small" size="sm" placeholder="Small input" />
            <InputField label="Medium (Default)" size="md" placeholder="Medium input" />
            <InputField label="Large" size="lg" placeholder="Large input" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
