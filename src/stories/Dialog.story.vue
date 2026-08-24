<script setup lang="ts">
import { Button } from '@/components/uic/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/uic/dialog'
import InputField from '@/components/uic/inputs/InputField.vue'
</script>

<template>
  <Story title="Dialog" group="overlays" icon="lucide:app-window">
    <Variant title="Default">
      <div class="p-8 flex flex-wrap gap-4">
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="outline">
              Open Dialog
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div class="space-y-4 py-4">
              <InputField label="Name" placeholder="John Doe" />
              <InputField label="Email" placeholder="john@example.com" />
            </div>
            <DialogFooter>
              <Button variant="outline">
                Cancel
              </Button>
              <Button variant="primary">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="destructive">
              Delete Confirm
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the item.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">
                Cancel
              </Button>
              <Button variant="destructive">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Variant>
  </Story>
</template>
