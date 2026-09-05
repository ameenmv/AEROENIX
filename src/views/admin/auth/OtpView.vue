<script setup lang="ts">
/**
 * OTP View — not supported by Aeroenix backend.
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
