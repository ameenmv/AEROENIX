<script setup lang="ts">
import { Button } from '@/components/uic/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/uic/drawer'
</script>

<template>
  <Story title="Drawer" group="overlays" icon="lucide:panel-bottom-open">
    <Variant title="Default">
      <div class="p-8">
        <Drawer>
          <DrawerTrigger as-child>
            <Button variant="outline">
              Open Drawer
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Move Goal</DrawerTitle>
              <DrawerDescription>Set your daily activity goal.</DrawerDescription>
            </DrawerHeader>
            <div class="p-8 flex justify-center">
              <div class="text-center">
                <p class="text-5xl font-bold text-foreground">
                  350
                </p>
                <p class="text-sm text-muted-foreground mt-1">
                  calories / day
                </p>
              </div>
            </div>
            <DrawerFooter>
              <Button variant="primary" class="w-full">
                Submit
              </Button>
              <Button variant="outline" class="w-full">
                Cancel
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </Variant>
  </Story>
</template>
