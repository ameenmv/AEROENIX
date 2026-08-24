<script setup lang="ts">
import { Illustration } from '@/components/uic/illustration'
</script>

<template>
  <Story title="Illustration" group="display" icon="lucide:image">
    <Variant title="All Types">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="grid grid-cols-3 gap-6">
            <div class="flex flex-col items-center gap-2">
              <Illustration name="empty" />
              <span class="text-xs text-muted-foreground">empty</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Illustration name="assets" />
              <span class="text-xs text-muted-foreground">assets</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Illustration name="evaluation" />
              <span class="text-xs text-muted-foreground">evaluation</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Illustration name="subscription" />
              <span class="text-xs text-muted-foreground">subscription</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Illustration name="search" />
              <span class="text-xs text-muted-foreground">search</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Illustration name="error" />
              <span class="text-xs text-muted-foreground">error</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Illustration name="success" />
              <span class="text-xs text-muted-foreground">success</span>
            </div>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="grid grid-cols-3 gap-6">
            <div class="flex flex-col items-center gap-2">
              <Illustration name="empty" />
              <span class="text-xs text-muted-foreground">empty</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Illustration name="assets" />
              <span class="text-xs text-muted-foreground">assets</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Illustration name="evaluation" />
              <span class="text-xs text-muted-foreground">evaluation</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Illustration name="success" />
              <span class="text-xs text-muted-foreground">success</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Illustration name="error" />
              <span class="text-xs text-muted-foreground">error</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Illustration name="search" />
              <span class="text-xs text-muted-foreground">search</span>
            </div>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
