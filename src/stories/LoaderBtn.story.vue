<script setup lang="ts">
import { ref } from 'vue'
import { LoaderBtn } from '@/components/uic/loader-btn'

const loading = ref(false)

function handleClick() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <Story title="LoaderBtn" group="inputs" icon="lucide:loader">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="flex flex-wrap gap-3">
            <LoaderBtn :loading="loading" @click="handleClick">
              Submit
            </LoaderBtn>
            <LoaderBtn :loading="true">
              Always loading
            </LoaderBtn>
            <LoaderBtn :loading="loading" variant="destructive" @click="handleClick">
              Delete
            </LoaderBtn>
            <LoaderBtn :loading="loading" variant="outline" @click="handleClick">
              Save Draft
            </LoaderBtn>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="flex flex-wrap gap-3">
            <LoaderBtn :loading="loading" @click="handleClick">
              Submit
            </LoaderBtn>
            <LoaderBtn :loading="true">
              Always loading
            </LoaderBtn>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
