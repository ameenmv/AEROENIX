<script setup lang="ts">
import { Button } from '@/components/uic/button'
</script>

<template>
  <Story title="Button" group="inputs" icon="lucide:mouse-pointer-click">
    <Variant title="All Variants">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="flex flex-wrap gap-3">
            <Button variant="default">
              Default
            </Button>
            <Button variant="primary">
              Primary
            </Button>
            <Button variant="secondary">
              Secondary
            </Button>
            <Button variant="destructive">
              Destructive
            </Button>
            <Button variant="danger">
              Danger
            </Button>
            <Button variant="outline">
              Outline
            </Button>
            <Button variant="ghost">
              Ghost
            </Button>
            <Button variant="link">
              Link
            </Button>
            <Button variant="white">
              White
            </Button>
            <Button variant="success">
              Success
            </Button>
            <Button variant="warning">
              Warning
            </Button>
            <Button variant="info">
              Info
            </Button>
            <Button variant="add">
              + ADD
            </Button>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="flex flex-wrap gap-3">
            <Button variant="default">
              Default
            </Button>
            <Button variant="primary">
              Primary
            </Button>
            <Button variant="secondary">
              Secondary
            </Button>
            <Button variant="destructive">
              Destructive
            </Button>
            <Button variant="danger">
              Danger
            </Button>
            <Button variant="outline">
              Outline
            </Button>
            <Button variant="ghost">
              Ghost
            </Button>
            <Button variant="link">
              Link
            </Button>
            <Button variant="white">
              White
            </Button>
            <Button variant="success">
              Success
            </Button>
            <Button variant="warning">
              Warning
            </Button>
            <Button variant="info">
              Info
            </Button>
            <Button variant="add">
              + ADD
            </Button>
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
          <div class="flex flex-wrap gap-3 items-center">
            <Button size="sm">
              Small
            </Button>
            <Button size="default">
              Default
            </Button>
            <Button size="lg">
              Large
            </Button>
            <Button size="icon" variant="outline">
              ☆
            </Button>
            <Button size="icon-sm" variant="outline">
              ☆
            </Button>
            <Button size="icon-lg" variant="outline">
              ☆
            </Button>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="flex flex-wrap gap-3 items-center">
            <Button size="sm">
              Small
            </Button>
            <Button size="default">
              Default
            </Button>
            <Button size="lg">
              Large
            </Button>
            <Button size="icon" variant="outline">
              ☆
            </Button>
            <Button size="icon-sm" variant="outline">
              ☆
            </Button>
            <Button size="icon-lg" variant="outline">
              ☆
            </Button>
          </div>
        </div>
      </div>
    </Variant>
    <Variant title="States">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="flex flex-wrap gap-3 items-center">
            <Button variant="primary">
              Normal
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" :block="true">
              Full Width
            </Button>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="flex flex-wrap gap-3 items-center">
            <Button variant="primary">
              Normal
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" :block="true">
              Full Width
            </Button>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
