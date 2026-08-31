<script setup lang="ts">
/**
 * Roles ShowView — Aeroenix backend does not have GET /platform/roles/{id}.
 * Redirects to the roles matrix view where all role details are visible.
 */
import { useRouter } from 'vue-router'

const router = useRouter()
router.replace({ name: 'admin-roles' })
</script>

<template>
  <div class="flex items-center justify-center py-12">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
</template>
