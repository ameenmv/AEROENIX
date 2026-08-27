<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { Button as Btn } from '@/components/uic/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uic/card'
import InputField from '@/components/uic/inputs/InputField.vue'
import { useForm } from '@/composables/useForm'
import { forgotPasswordSchema } from '@/modules/auth/schema'
import { useAuthStore } from '@/stores'

const { locale, t } = useI18n()
const authStore = useAuthStore()
const { otpIdentifier } = storeToRefs(authStore)
const router = useRouter()
const route = useRoute()
const successMessage = ref('')

// ── useForm: Zod validation + mutation + API error mapping ──────────────────
const form = useForm({
  resourceName: 'auth',
  schema: forgotPasswordSchema(t),
  action: 'custom',
  showNotifications: false,
  initialValues: {
    email: otpIdentifier.value || '',
  },
  mutationFn: data => authStore.forgotPassword({ email: data.email }),
  onSuccess: (message?: string | void) => {
    successMessage.value = typeof message === 'string' 
      ? message 
      : t('auth.reset_link_sent', 'A password reset link has been sent to your email.')
    
    // eslint-disable-next-line ts/no-use-before-define
    email.value = ''
  },
})

// defineField for proper reactive validation tracking
const [email] = form.defineField('email')
</script>

<template>
  <AuthLayout>
    <Card
      class="w-full max-w-[547px] !rounded-3xl !border-border !shadow-[0_4px_20px_rgba(148,163,184,0.1)] !py-0"
    >
      <CardHeader class="!px-5 sm:!px-12 !pt-8 !pb-0 text-center">
        <CardTitle class="!text-[32px] !leading-[48px] font-semibold !text-foreground">
          {{ t('auth.forgot_password_title', 'Forgot Password') }}
        </CardTitle>
        <CardDescription class="!text-sm font-medium !text-foreground/80">
          {{
            t(
              'auth.forgot_password_subtitle',
              "Enter your Email and we'll send you a verification code to reset your password",
            )
          }}
        </CardDescription>
      </CardHeader>
      <CardContent class="!px-5 sm:!px-12 !pb-0">
        <!-- Success Alert -->
        <div v-if="successMessage" class="auth-alert auth-alert--success mb-4">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          {{ successMessage }}
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
        <form v-if="!successMessage" class="flex flex-col gap-6" @submit.prevent="form.onSubmit">
          <InputField
            id="forgot-email"
            v-model="email"
            type="email"
            :label="t('auth.email_label', 'Email')"
            :placeholder="t('auth.email_placeholder', 'e.g admin@neop.com')"
            :error="form.errors.value.email"
            size="lg"
          />
          <Btn
            type="submit"
            variant="primary"
            class="auth-btn-primary w-full"
            :disabled="form.isPending.value"
          >
            <svg
              v-if="form.isPending.value"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {{
              form.isPending.value
                ? t('auth.sending', 'Sending...')
                : t('auth.send_verification_code', 'Send Verification Code')
            }}
          </Btn>
        </form>
      </CardContent>
      <!-- Footer -->
      <div class="flex justify-center items-center gap-1 px-5 sm:px-12 pb-6">
        <span class="text-base font-normal text-muted-foreground">
          {{ t('auth.remember_password', 'Remember your password?') }}
        </span>
        <RouterLink
          :to="`/${locale}/admin/login`"
          class="text-base font-semibold text-foreground hover:underline"
        >
          {{ t('auth.back_to_login', 'Back to login') }}
        </RouterLink>
      </div>
    </Card>
  </AuthLayout>
</template>
