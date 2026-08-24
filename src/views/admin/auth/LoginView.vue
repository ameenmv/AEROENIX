<script setup lang="ts">
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { Button as Btn } from '@/components/uic/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uic/card'
import { Checkbox } from '@/components/uic/checkbox'
import InputField from '@/components/uic/inputs/InputField.vue'
import { Label } from '@/components/uic/label'
import { useForm } from '@/composables/useForm'
import { loginSchema } from '@/modules/auth/schema'
import { useAuthStore } from '@/stores'

const showPassword = ref(false)
const { locale, t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// ── useForm: Zod validation + mutation + API error mapping ──────────────────
const form = useForm<string | null>({
  resourceName: 'auth',
  schema: loginSchema(t),
  action: 'custom',
  showNotifications: false,
  initialValues: {
    email: '',
    password: '',
    remember: false,
  },
  mutationFn: data => authStore.login(data),
  onSuccess: (otpChallengeToken) => {
    const lang = (route.params.lang as string) || 'en'
    if (!otpChallengeToken) {
      // Direct login — no 2FA
      router.push({ path: `/${lang}/admin/dashboard` })
    }
    else {
      // 2FA required — pass token via route
      router.push({ path: `/${lang}/admin/otp`, query: { token: otpChallengeToken } })
    }
  },
})

// defineField gives proper reactive validation tracking (errors clear on input)
const [email] = form.defineField('email')
const [password] = form.defineField('password')
const [remember] = form.defineField('remember')
</script>

<template>
  <AuthLayout>
    <Card class="w-full max-w-[547px] !rounded-3xl !border-border !shadow-[0_4px_20px_rgba(148,163,184,0.1)] ">
      <CardHeader class="!px-5 sm:!px-12 !pt-8 !pb-0 text-center">
        <CardTitle class="!text-[32px] !leading-[48px] font-semibold !text-foreground">
          {{ t('auth.login_title', 'Super Admin Login') }}
        </CardTitle>
        <CardDescription class="!text-sm font-medium !text-foreground/80">
          {{ t('auth.login_subtitle', 'Enter your credentials to access the admin panel') }}
        </CardDescription>
      </CardHeader>
      <CardContent class="!px-5 sm:!px-12 !pb-0">
        <!-- Error Alert (only non-field errors like "Invalid credentials") -->
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
        <form class="flex flex-col gap-6" @submit.prevent="form.onSubmit">
          <InputField
            id="login-email" v-model="email" type="email" :label="t('auth.email_label', 'Email')"
            :placeholder="t('auth.email_placeholder', 'e.g admin@neop.com')" :error="form.errors.value.email"
            size="lg"
          />
          <div class="flex flex-col gap-3">
            <InputField
              id="login-password" v-model="password" :type="showPassword ? 'text' : 'password'"
              :label="t('auth.password_label', 'Password')" :placeholder="t('auth.password_placeholder', '••••••••')" :error="form.errors.value.password"
              size="lg"
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
            <!-- Stay signed in + Forgot password -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Checkbox
                  id="login-remember" :checked="remember"
                  class="!size-6 !rounded-md !border-border data-[state=checked]:!bg-muted-foreground data-[state=checked]:!border-muted-foreground"
                  @update:checked="(val: boolean) => (remember = val)"
                />
                <Label for="login-remember" class="text-base font-normal !text-foreground cursor-pointer">
                  {{ t('auth.stay_signed_in', 'Stay Signed in') }}
                </Label>
              </div>
              <RouterLink
                :to="`/${locale}/admin/forgot-password`"
                class="text-base font-normal text-foreground hover:opacity-80 transition-opacity"
              >
                {{ t('auth.forgot_password', 'Forgot Password?') }}
              </RouterLink>
            </div>
          </div>
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
                ? t('auth.logging_in', 'Signing in...')
                : t('auth.login_btn', 'Log In')
            }}
          </Btn>
        </form>
      </CardContent>
      <!-- Footer info -->
    </Card>
  </AuthLayout>
</template>
