<script setup lang="ts">
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { Button as Btn } from '@/components/uic/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uic/card'
import InputField from '@/components/uic/inputs/InputField.vue'
import { useForm } from '@/composables/useForm'
import { resetPasswordSchema } from '@/modules/auth/schema'
import { useAuthStore } from '@/stores'

const showPassword = ref(false)
const resetSuccess = ref(false)
const { locale, t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Read the reset_token from the route query (passed by OTP verify page)
const resetToken = computed(() => (route.query.token as string) || '')

// Guard: redirect to forgot password if no reset token in route
if (!resetToken.value) {
  const lang = (route.params.lang as string) || 'en'
  router.replace({ path: `/${lang}/admin/forgot-password` })
}

// ── useForm: Zod validation + mutation + API error mapping ──────────────────
const form = useForm({
  resourceName: 'auth',
  schema: resetPasswordSchema(t),
  action: 'custom',
  showNotifications: false,
  initialValues: {
    password: '',
    password_confirmation: '',
  },
  mutationFn: data => authStore.resetPassword({
    reset_token: resetToken.value,
    password: data.password,
    password_confirmation: data.password_confirmation,
  }),
  onSuccess: () => {
    resetSuccess.value = true
    setTimeout(() => {
      const lang = (route.params.lang as string) || 'en'
      router.push({ path: `/${lang}/admin/login` })
    }, 3000)
  },
})

// defineField for proper reactive validation tracking
const [password] = form.defineField('password')
const [passwordConfirmation] = form.defineField('password_confirmation')
</script>

<template>
  <AuthLayout>
    <Card class="w-full max-w-[547px] !rounded-3xl !border-border !shadow-[0_4px_20px_rgba(148,163,184,0.1)] !py-0">
      <CardHeader class="!px-5 sm:!px-12 !pt-8 !pb-0 text-center">
        <CardTitle class="!text-[32px] !leading-[48px] font-semibold !text-foreground">
          {{ t('auth.reset_password_title', 'Reset Password') }}
        </CardTitle>
        <CardDescription class="!text-sm font-medium !text-foreground/80">
          {{ t('auth.reset_password_subtitle', 'Enter your new password below') }}
        </CardDescription>
      </CardHeader>
      <CardContent class="!px-5 sm:!px-12 !pb-0">
        <!-- Success Alert -->
        <div v-if="resetSuccess" class="auth-alert auth-alert--success mb-4">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          {{ t('auth.reset_success', 'Password reset successful! Redirecting to login...') }}
        </div>
        <!-- Error Alert (only non-field errors) -->
        <div
          v-if="authStore.error && Object.keys(form.errors.value).length === 0"
          class="auth-alert auth-alert--error mb-4"
        >
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          {{ authStore.error }}
        </div>
        <form v-if="!resetSuccess" class="flex flex-col gap-6" @submit.prevent="form.onSubmit">
          <InputField
            id="reset-password" v-model="password" :type="showPassword ? 'text' : 'password'"
            :label="t('auth.new_password_label', 'New Password')" :placeholder="t('auth.password_placeholder', '••••••••')"
            :error="form.errors.value.password" size="lg"
          >
            <template #suffix>
              <button
                type="button"
                class="text-muted-foreground opacity-50 hover:opacity-80 transition-opacity focus:outline-none"
                @click="showPassword = !showPassword"
              >
                <HugeiconsIcon :icon="showPassword ? ViewIcon : ViewOffSlashIcon" :size="22" />
              </button>
            </template>
          </InputField>
          <InputField
            id="reset-password-confirm" v-model="passwordConfirmation"
            :type="showPassword ? 'text' : 'password'" :label="t('auth.confirm_password_label', 'Confirm Password')"
            :placeholder="t('auth.password_placeholder', '••••••••')" :error="form.errors.value.password_confirmation" size="lg"
          />
          <Btn type="submit" variant="primary" class="auth-btn-primary w-full" :disabled="form.isPending.value">
            <svg
              v-if="form.isPending.value" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{
              form.isPending.value
                ? t('auth.resetting', 'Resetting...')
                : t('auth.reset_password_btn', 'Reset Password')
            }}
          </Btn>
        </form>
      </CardContent>
      <!-- Footer -->
      <div class="flex justify-center items-center gap-1 px-5 sm:px-12 pb-6">
        <RouterLink :to="`/${locale}/admin/login`" class="text-base font-semibold text-foreground hover:underline">
          {{ t('auth.back_to_login', 'Back to login') }}
        </RouterLink>
      </div>
    </Card>
  </AuthLayout>
</template>
