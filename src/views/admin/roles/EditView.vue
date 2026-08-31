<script setup lang="ts">
/**
 * Roles EditView — Aeroenix backend does not have individual role editing.
 * Permissions are managed from the matrix view (GET /platform/roles-permissions
 * + PUT /platform/roles/{role}/permissions).
 *
 * This view redirects to the roles index (matrix view).
 */
import { useRouter } from 'vue-router'

const router = useRouter()

// Backend has no GET /roles/{id} or PUT /roles/{id}
// Redirect to the matrix view
router.replace({ name: 'admin-roles' })
</script>

<template>
  <div class="flex items-center justify-center py-12">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
</template>
