<script setup lang="ts">
import { AccessibilityBar } from '@/components/uic/accessibility-bar'
import { useAccessibility } from '@/composables/useAccessibility'

const { prefs } = useAccessibility()
prefs.barVisible = true
</script>

<template>
  <Story title="AccessibilityBar" group="navigation" icon="lucide:accessibility">
    <Variant title="Default">
      <div class="p-0">
        <div class="light bg-background border border-border rounded-xl overflow-hidden">
          <AccessibilityBar />
          <div class="p-8 text-sm text-muted-foreground">
            Content below the accessibility bar. Try clicking zoom, font size, grayscale, contrast, underline links, and big cursor buttons.
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
