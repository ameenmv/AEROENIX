<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Toaster } from '@/components/uic/sonner'
import AdminLayout from './components/layout/AdminLayout.vue'
import AuthLayout from './components/layout/AuthLayout.vue'
import BlankLayout from './components/layout/BlankLayout.vue'
import { useAuthStore } from '@/stores'

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

onMounted(() => {
  const authStore = useAuthStore()
  if (authStore.token) {
    // Refresh user details (and hotels) from the backend on page load
    authStore.fetchMe().catch(() => {
      // If fetching fails (e.g. invalid token), logout silently
      authStore.logout()
    })
  }
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
