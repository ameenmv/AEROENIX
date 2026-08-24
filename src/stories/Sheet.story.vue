<script setup lang="ts">
import { Button } from '@/components/uic/button'
import InputField from '@/components/uic/inputs/InputField.vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/uic/sheet'
</script>

<template>
  <Story title="Sheet" group="overlays" icon="lucide:panel-right-open">
    <Variant title="Sides">
      <div class="p-8 space-y-4">
        <div class="flex flex-wrap gap-4">
          <Sheet>
            <SheetTrigger as-child>
              <Button variant="outline">
                Right Sheet
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Edit Profile</SheetTitle>
                <SheetDescription>Make changes to your profile here.</SheetDescription>
              </SheetHeader>
              <div class="py-6 space-y-4">
                <InputField label="Name" placeholder="John Doe" />
                <InputField label="Email" placeholder="john@example.com" />
              </div>
              <div class="flex justify-end">
                <Button variant="primary">
                  Save
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger as-child>
              <Button variant="outline">
                Left Sheet
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Browse your sections.</SheetDescription>
              </SheetHeader>
              <div class="py-6 space-y-2">
                <Button variant="ghost" class="w-full justify-start">
                  Dashboard
                </Button>
                <Button variant="ghost" class="w-full justify-start">
                  Settings
                </Button>
                <Button variant="ghost" class="w-full justify-start">
                  Profile
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger as-child>
              <Button variant="outline">
                Top Sheet
              </Button>
            </SheetTrigger>
            <SheetContent side="top">
              <SheetHeader>
                <SheetTitle>Notification</SheetTitle>
                <SheetDescription>A sheet that slides down from the top.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger as-child>
              <Button variant="outline">
                Bottom Sheet
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Action Sheet</SheetTitle>
                <SheetDescription>A sheet that slides up from the bottom.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Variant>
  </Story>
</template>
