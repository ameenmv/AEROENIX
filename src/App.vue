<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Toaster } from '@/components/uic/sonner'
import AdminLayout from './components/layout/AdminLayout.vue'
import AuthLayout from './components/layout/AuthLayout.vue'
import BlankLayout from './components/layout/BlankLayout.vue'

const route = useRoute()
const layout = computed(() => {
  if (route.meta.layout === 'auth')
    return AuthLayout
  if (route.meta.layout === 'blank')
    return BlankLayout
  if (route.matched.length === 0)
    return BlankLayout
  return AdminLayout
})
</script>

<template>
  <component :is="layout">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>
  </component>
  <Toaster position="top-right" :duration="2500" rich-colors close-button />
</template>
