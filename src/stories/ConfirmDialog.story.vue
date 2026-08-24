<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/uic/button'
import { ConfirmDialog } from '@/components/uic/confirm-dialog'

const open1 = ref(false)
const open2 = ref(false)
const open3 = ref(false)
const loading = ref(false)

function onConfirm(_reason: string) {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    open1.value = false
    open2.value = false
    open3.value = false
  }, 1500)
}
</script>

<template>
  <Story title="ConfirmDialog" group="overlay" icon="lucide:alert-triangle">
    <Variant title="All Variants">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="flex flex-wrap gap-3">
            <Button @click="open1 = true">
              Confirm
            </Button>
            <Button variant="destructive" @click="open2 = true">
              Delete
            </Button>
            <Button variant="warning" @click="open3 = true">
              Reject with reason
            </Button>
          </div>
          <ConfirmDialog
            v-model:open="open1"
            title="Approve Subscription"
            description="Are you sure you want to approve this subscription?"
            confirm-text="Approve"
            :loading="loading"
            @confirm="onConfirm"
          />
          <ConfirmDialog
            v-model:open="open2"
            title="Delete Record"
            description="This action cannot be undone. This will permanently delete the record."
            confirm-text="Delete"
            confirm-variant="destructive"
            :loading="loading"
            @confirm="onConfirm"
          />
          <ConfirmDialog
            v-model:open="open3"
            title="Reject Request"
            description="Please provide a reason for rejection."
            confirm-text="Reject"
            confirm-variant="destructive"
            :show-reason="true"
            reason-placeholder="Enter rejection reason..."
            :loading="loading"
            @confirm="onConfirm"
          />
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <p class="text-sm text-muted-foreground">
            Click the buttons on the left to preview dialogs.
          </p>
        </div>
      </div>
    </Variant>
  </Story>
</template>
