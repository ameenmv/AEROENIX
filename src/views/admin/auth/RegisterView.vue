<script setup lang="ts">
/**
 * RegisterView — not supported by Aeroenix backend.
 * Users are created via invitations only.
 * Redirects to login page.
 */
const route = useRoute()
const router = useRouter()
const lang = (route.params.lang as string) || 'en'
router.replace({ path: `/${lang}/admin/login` })
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <p class="text-muted-foreground">Redirecting...</p>
  </div>
</template>
