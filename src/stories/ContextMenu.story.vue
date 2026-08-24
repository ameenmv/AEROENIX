<script setup lang="ts">
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/uic/context-menu'
</script>

<template>
  <Story title="ContextMenu" group="overlay" icon="lucide:mouse-pointer">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <ContextMenu>
            <ContextMenuTrigger
              class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
            >
              Right click here
            </ContextMenuTrigger>
            <ContextMenuContent class="w-64">
              <ContextMenuItem>Back</ContextMenuItem>
              <ContextMenuItem>Forward</ContextMenuItem>
              <ContextMenuItem>Reload</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Copy</ContextMenuItem>
              <ContextMenuItem>Paste</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <ContextMenu>
            <ContextMenuTrigger
              class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
            >
              Right click here
            </ContextMenuTrigger>
            <ContextMenuContent class="w-64">
              <ContextMenuItem>Back</ContextMenuItem>
              <ContextMenuItem>Forward</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Copy</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>
    </Variant>
  </Story>
</template>
