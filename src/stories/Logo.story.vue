<script setup lang="ts">
import Logo from '@/components/layout/Logo.vue'
</script>

<template>
  <Story title="Logo" group="layout" icon="lucide:image">
    <Variant title="Sizes & Modes">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-8">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="flex flex-col items-center gap-6">
            <Logo size="lg" />
            <Logo size="md" />
            <Logo size="sm" />
            <Logo :icon-only="true" size="lg" />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-8">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="flex flex-col items-center gap-6">
            <Logo size="lg" />
            <Logo size="md" />
            <Logo size="sm" />
            <Logo :icon-only="true" size="lg" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
