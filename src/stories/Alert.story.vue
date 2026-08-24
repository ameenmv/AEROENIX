<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/uic/alert'
</script>

<template>
  <Story title="Alert" group="feedback" icon="lucide:alert-triangle">
    <Variant title="All Variants">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <Alert variant="default">
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is important information you should know about.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Destructive Alert</AlertTitle>
            <AlertDescription>Something went wrong. Please try again later.</AlertDescription>
          </Alert>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <Alert variant="default">
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is important information you should know about.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Destructive Alert</AlertTitle>
            <AlertDescription>Something went wrong. Please try again later.</AlertDescription>
          </Alert>
        </div>
      </div>
    </Variant>
  </Story>
</template>
