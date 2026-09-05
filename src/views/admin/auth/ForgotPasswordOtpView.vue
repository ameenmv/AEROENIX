<script setup lang="ts">
/**
 * ForgotPasswordOtpView — not supported by Aeroenix backend.
 * Password reset uses email links, not OTP.
 * Redirects to forgot-password page.
 */
const route = useRoute()
const router = useRouter()
const lang = (route.params.lang as string) || 'en'
router.replace({ path: `/${lang}/admin/forgot-password` })
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <p class="text-muted-foreground">Redirecting...</p>
  </div>
</template>
