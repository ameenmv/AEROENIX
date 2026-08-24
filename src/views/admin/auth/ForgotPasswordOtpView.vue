<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { Button as Btn } from '@/components/uic/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uic/card'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/uic/input-otp'
import { useAuth } from '@/composables/useAuth'

const otp = ref('')
const resendSuccess = ref(false)
const { locale, t } = useI18n()
const router = useRouter()
const route = useRoute()

const {
  isLoading,
  isResending,
  error,
  otpIdentifier,
  // Countdown timers (server-driven)
  otpExpiryCountdown,
  otpResendCountdown,
  otpExpiryDisplay,
  otpResendDisplay,
  otpLockDisplay,
  canResendOtp,
  isOtpExpired,
  isOtpLocked,
  // Actions
  verifyResetOtp,
  resendOtp,
} = useAuth()

// Read the OTP challenge token from the route query (passed by forgot-password page)
const routeToken = computed(() => (route.query.token as string) || '')

const email = computed(() => otpIdentifier.value || (route.query.identifier as string) || (route.query.email as string) || '')

// Guard: redirect to forgot password if no token in route
if (!routeToken.value) {
  const lang = (route.params.lang as string) || 'en'
  router.replace({ path: `/${lang}/admin/forgot-password` })
}

async function handleVerifyOtp() {
  try {
    // Pass the route token to verifyResetOtp; it returns the reset_token
    const resetToken = await verifyResetOtp(otp.value, routeToken.value)
    const lang = (route.params.lang as string) || 'en'
    router.push({ path: `/${lang}/admin/reset-password`, query: { token: resetToken } })
  }
  catch {
    otp.value = ''
  }
}

async function handleResend() {
  if (!canResendOtp.value || isResending.value)
    return

  resendSuccess.value = false
  try {
    await resendOtp()
    otp.value = ''
    resendSuccess.value = true
    setTimeout(() => {
      resendSuccess.value = false
    }, 3000)
  }
  catch {
    // Error handled by composable
  }
}
</script>

<template>
  <AuthLayout>
    <Card class="w-full max-w-[547px] !rounded-3xl !border-border !shadow-[0_4px_20px_rgba(148,163,184,0.1)] !py-0">
      <CardHeader class="!px-12 !pt-8 !pb-0 text-center">
        <CardTitle class="!text-[32px] !leading-[48px] font-semibold !text-foreground">
          {{ t('auth.verify_code_title', 'Verify Code') }}
        </CardTitle>
        <CardDescription class="!text-sm font-medium !text-foreground/80">
          {{ t('auth.verify_reset_otp_subtitle', 'Enter the 6-digit code sent to') }}
          <span v-if="email" class="font-semibold text-foreground block mt-1">{{ email }}</span>
        </CardDescription>
      </CardHeader>
      <CardContent class="!px-12 !pb-0">
        <!-- Lock Alert -->
        <div v-if="isOtpLocked" class="auth-alert auth-alert--warning mb-4">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ t('auth.account_locked', 'Too many attempts. Try again in') }} <span class="font-semibold">{{
            otpLockDisplay }}</span></span>
        </div>

        <!-- Expiry Alert -->
        <div v-if="isOtpExpired && !isOtpLocked" class="auth-alert auth-alert--error mb-4">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          {{ t('auth.code_expired', 'Code expired. Please request a new one.') }}
        </div>

        <!-- Error Alert -->
        <div v-if="error && !isOtpExpired && !isOtpLocked" class="auth-alert auth-alert--error mb-4">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          {{ error }}
        </div>

        <!-- Resend Success Alert -->
        <div v-if="resendSuccess && !error" class="auth-alert auth-alert--success mb-4">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          {{ t('auth.resend_success', 'A new code has been sent.') }}
        </div>

        <form class="flex flex-col items-center gap-6" @submit.prevent="handleVerifyOtp">
          <InputOTP v-model="otp" :maxlength="6" :disabled="isOtpExpired || isOtpLocked">
            <InputOTPGroup>
              <InputOTPSlot :index="0" />
              <InputOTPSlot :index="1" />
              <InputOTPSlot :index="2" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot :index="3" />
              <InputOTPSlot :index="4" />
              <InputOTPSlot :index="5" />
            </InputOTPGroup>
          </InputOTP>

          <!-- Code Expiry Timer -->
          <div v-if="otpExpiryCountdown > 0 && !isOtpLocked" class="flex items-center gap-1.5 text-sm">
            <svg
              class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-muted-foreground">{{ t('auth.code_expires_in', 'Code expires in') }}</span>
            <span class="font-semibold" :class="otpExpiryCountdown <= 60 ? 'text-red-500' : 'text-foreground'">
              {{ otpExpiryDisplay }}
            </span>
          </div>

          <Btn
            type="submit" variant="primary" class="auth-btn-primary w-full"
            :disabled="otp.length < 6 || isLoading || isOtpExpired || isOtpLocked"
          >
            <svg
              v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{
              isLoading
                ? t('auth.verifying', 'Verifying...')
                : t('auth.verify_btn', 'Verify Code')
            }}
          </Btn>
          <!-- Resend OTP -->
          <div class="text-center">
            <p class="text-sm text-muted-foreground">
              {{ t('auth.didnt_receive_code', "Didn't receive the code?") }}
            </p>
            <button
              v-if="canResendOtp" type="button"
              class="text-sm font-semibold text-foreground hover:underline mt-1 inline-flex items-center gap-2"
              :disabled="isResending" @click="handleResend"
            >
              <svg
                v-if="isResending" class="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{
                isResending
                  ? t('auth.sending', 'Sending...')
                  : t('auth.resend_code', 'Resend Code')
              }}
            </button>
            <p v-else-if="otpResendCountdown > 0" class="text-sm text-muted-foreground mt-1">
              {{ t('auth.resend_in', 'Resend in') }}
              <span class="font-semibold text-foreground">{{ otpResendDisplay }}</span>
            </p>
          </div>
        </form>
      </CardContent>
      <!-- Footer -->
      <div class="flex justify-center items-center gap-1 px-12 pb-6">
        <RouterLink
          :to="`/${locale}/admin/forgot-password`"
          class="text-base font-semibold text-foreground hover:underline"
        >
          {{ t('auth.back_to_forgot_password', 'Try a different email') }}
        </RouterLink>
      </div>
    </Card>
  </AuthLayout>
</template>
