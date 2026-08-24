<script setup lang="ts">
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/uic/resizable'
</script>

<template>
  <Story title="Resizable" group="display" icon="lucide:columns">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <ResizablePanelGroup direction="horizontal" class="max-w-md rounded-lg border">
            <ResizablePanel :default-size="50">
              <div class="flex h-[200px] items-center justify-center p-6">
                <span class="font-semibold">One</span>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel :default-size="50">
              <div class="flex h-[200px] items-center justify-center p-6">
                <span class="font-semibold">Two</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <ResizablePanelGroup direction="horizontal" class="max-w-md rounded-lg border">
            <ResizablePanel :default-size="25">
              <div class="flex h-[200px] items-center justify-center p-6">
                <span class="font-semibold">Sidebar</span>
              </div>
            </ResizablePanel>
            <ResizableHandle with-handle />
            <ResizablePanel :default-size="75">
              <div class="flex h-[200px] items-center justify-center p-6">
                <span class="font-semibold">Content</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </Variant>
  </Story>
</template>
