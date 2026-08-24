<script setup lang="ts">
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import Logo from '@/components/layout/Logo.vue'
import { Button as Btn } from '@/components/uic/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uic/card'
import InputField from '@/components/uic/inputs/InputField.vue'
import { useAuth } from '@/composables'
import { useSonarStore } from '@/stores'

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const { locale, t } = useI18n()
const { register, isLoading, error, clearError, requiresOtp } = useAuth()
const sonarStore = useSonarStore()
const router = useRouter()
const route = useRoute()

async function handleRegister() {
  clearError()
  if (password.value !== passwordConfirmation.value) {
    sonarStore.warning(
      t('auth.password_mismatch_title', 'Password Mismatch'),
      t('auth.password_mismatch_message', 'Passwords do not match'),
    )
    return
  }
  const completed = await register({
    name: name.value,
    email: email.value,
    password: password.value,
    password_confirmation: passwordConfirmation.value,
  })
  const lang = (route.params.lang as string) || 'en'
  if (completed) {
    router.push(`/${lang}/admin/dashboard`)
  }
  else if (requiresOtp.value) {
    router.push({ path: `/${lang}/admin/otp` })
  }
}
</script>

<template>
  <AuthLayout>
    <div class="flex flex-col items-center gap-6">
      <Logo size="lg" />
      <Card class="w-full border-border">
        <CardHeader class="text-center space-y-1 pb-4">
          <CardTitle class="text-xl font-bold">
            {{ t('auth.register_title') }}
          </CardTitle>
          <CardDescription>
            {{ t('auth.register_subtitle', 'Create your account to get started') }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="flex flex-col gap-5" @submit.prevent="handleRegister">
            <!-- Error message -->
            <p
              v-if="error"
              class="text-sm text-destructive text-center bg-destructive/10 rounded-md p-2"
            >
              {{ error }}
            </p>
            <InputField id="name" v-model="name" :label="t('auth.name_label')" required />
            <InputField
              id="email"
              v-model="email"
              type="email"
              :label="t('auth.email_label')"
              required
            />
            <InputField
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :label="t('auth.password_label')"
              required
            >
              <template #suffix>
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  @click="showPassword = !showPassword"
                >
                  <HugeiconsIcon :icon="showPassword ? ViewIcon : ViewOffSlashIcon" :size="18" />
                </button>
              </template>
            </InputField>
            <InputField
              id="password-confirm"
              v-model="passwordConfirmation"
              :type="showPassword ? 'text' : 'password'"
              :label="t('auth.confirm_password_label')"
              required
            />
            <Btn type="submit" variant="primary" size="lg" class="w-full" :disabled="isLoading">
              {{ isLoading ? t('common.loading', 'Loading...') : t('auth.register_btn') }}
            </Btn>
          </form>
        </CardContent>
      </Card>
      <p class="text-xs text-muted-foreground text-center">
        {{ t('auth.have_account', 'Already have an account?') }}
        <RouterLink :to="`/${locale}/admin/login`" class="text-primary hover:underline font-medium">
          {{ t('auth.login_btn', 'Login') }}
        </RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>
