<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  Calendar01Icon,
  CheckmarkCircle01Icon,
  SecurityLockIcon,
  UserCircleIcon,
} from '@hugeicons/core-free-icons'
import { Building, ChevronDown, Loader2, Mail, Phone, Save, User } from 'lucide-vue-next'
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import { Label } from '@/components/uic/label'
import { Separator } from '@/components/uic/separator'
import { Skeleton } from '@/components/uic/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/uic/collapsible'
import { useSettingsStore } from '@/stores/shared/settingsStore'
import { useSonarStore } from '@/stores/sonar'

const { t } = useI18n()
const store = useSettingsStore()
const sonar = useSonarStore()

const form = reactive({
  name: '',
  phone: '',
  current_password: '',
  password: '',
  password_confirmation: '',
})

const showPasswordSection = ref(false)
const isSaving = ref(false)
const validationErrors = ref<Record<string, string[]>>({})

watch(() => store.profile, (profile) => {
  if (profile) {
    form.name = profile.name || ''
    form.phone = profile.phone || ''
  }
}, { immediate: true })

async function handleSaveProfile() {
  validationErrors.value = {}
  isSaving.value = true
  try {
    const payload: Record<string, any> = {}
    if (form.name !== store.profile?.name) payload.name = form.name
    if (form.phone !== (store.profile?.phone || '')) payload.phone = form.phone || null

    if (showPasswordSection.value && form.password) {
      payload.current_password = form.current_password
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }

    if (Object.keys(payload).length === 0) {
      sonar.info(t('common.no_changes', 'No Changes'), t('common.no_changes_desc', 'No changes to save.'))
      return
    }

    await store.updateProfile(payload)
    sonar.success(
      t('settings.profile_updated', 'Profile Updated'),
      t('settings.profile_updated_desc', 'Your profile has been updated successfully.'),
    )

    form.current_password = ''
    form.password = ''
    form.password_confirmation = ''
    showPasswordSection.value = false
  }
  catch (err: any) {
    if (err?.errors) {
      validationErrors.value = err.errors
    }
    sonar.error(
      t('common.update_failed', 'Update Failed'),
      err?.message || t('common.update_failed_desc', 'Failed to update profile.'),
    )
  }
  finally {
    isSaving.value = false
  }
}

onMounted(() => {
  if (!store.profile) {
    store.fetchAll()
  }
})
</script>

<template>
  <div class="space-y-6 max-w-[720px]">

    <!-- Loading Skeleton -->
    <template v-if="store.isLoading && !store.profile">
      <div class="flex items-center gap-4 mb-6">
        <Skeleton class="w-14 h-14 rounded-xl" />
        <div class="space-y-2 flex-1">
          <Skeleton class="h-5 w-32" />
          <Skeleton class="h-3.5 w-48" />
        </div>
      </div>
      <div class="space-y-5">
        <div v-for="i in 3" :key="i" class="space-y-2">
          <Skeleton class="h-3.5 w-24" />
          <Skeleton class="h-9 w-full rounded-md" />
        </div>
      </div>
    </template>

    <template v-else-if="store.profile">

      <!-- Profile Identity -->
      <div class="relative rounded-xl overflow-hidden border border-border/40 bg-card">
        <div class="h-14 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div class="-mt-7 px-5 pb-5">
          <div class="flex items-end gap-4">
            <div class="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg ring-4 ring-card shrink-0">
              <HugeiconsIcon :icon="UserCircleIcon" :size="26" class="text-primary-foreground" />
            </div>
            <div class="flex-1 min-w-0 pb-0.5">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base font-bold text-foreground tracking-tight truncate">
                  {{ store.profile.name }}
                </h2>
                <Badge v-if="store.profile.role" variant="secondary" class="text-[10px] font-semibold">
                  {{ store.profile.role.name }}
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground truncate mt-0.5">
                {{ store.profile.email }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div>
        <h3 class="text-sm font-semibold text-foreground mb-1">
          {{ t('settings.profile_settings', 'Profile Settings') }}
        </h3>
        <p class="text-xs text-muted-foreground mb-5">
          {{ t('settings.profile_settings_desc', 'Manage your personal information and security settings.') }}
        </p>

        <form class="space-y-5" @submit.prevent="handleSaveProfile">
          <!-- Name -->
          <div class="space-y-2">
            <Label for="settings-name" class="text-xs">
              <User :size="13" class="text-muted-foreground" />
              {{ t('settings.full_name', 'Full Name') }}
            </Label>
            <Input
              id="settings-name"
              v-model="form.name"
              type="text"
              :placeholder="t('settings.name_placeholder', 'Enter your full name')"
              :class="validationErrors.name ? 'border-destructive' : ''"
            />
            <p v-if="validationErrors.name" class="text-xs text-destructive">
              {{ validationErrors.name[0] }}
            </p>
          </div>

          <!-- Email (read-only) -->
          <div class="space-y-2">
            <Label class="text-xs">
              <Mail :size="13" class="text-muted-foreground" />
              {{ t('settings.email', 'Email Address') }}
            </Label>
            <div class="flex h-9 w-full items-center rounded-md border border-input bg-muted/30 px-3 text-sm text-muted-foreground select-all">
              {{ store.profile.email }}
            </div>
            <p class="text-xs text-muted-foreground">
              {{ t('settings.email_hint', 'Email cannot be changed. Contact your administrator if needed.') }}
            </p>
          </div>

          <!-- Phone -->
          <div class="space-y-2">
            <Label for="settings-phone" class="text-xs">
              <Phone :size="13" class="text-muted-foreground" />
              {{ t('settings.phone', 'Phone Number') }}
            </Label>
            <Input
              id="settings-phone"
              v-model="form.phone"
              type="text"
              :placeholder="t('settings.phone_placeholder', '+1 234 567 8900')"
              :class="validationErrors.phone ? 'border-destructive' : ''"
            />
            <p v-if="validationErrors.phone" class="text-xs text-destructive">
              {{ validationErrors.phone[0] }}
            </p>
          </div>

          <Separator />

          <!-- Password Change Section -->
          <Collapsible v-model:open="showPasswordSection">
            <CollapsibleTrigger as-child>
              <Button type="button" variant="ghost" size="sm" class="gap-2 text-muted-foreground hover:text-foreground -ml-2 h-8">
                <HugeiconsIcon :icon="SecurityLockIcon" :size="14" />
                <span class="text-xs font-semibold">
                  {{ showPasswordSection
                    ? t('settings.hide_password', 'Hide Password Change')
                    : t('settings.change_password', 'Change Password')
                  }}
                </span>
                <ChevronDown
                  :size="14"
                  class="transition-transform duration-200"
                  :class="showPasswordSection ? 'rotate-180' : ''"
                />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div class="mt-4 space-y-4 p-4 rounded-lg border border-dashed border-border bg-muted/20">
                <div class="space-y-2">
                  <Label for="settings-current-password" class="text-xs">
                    {{ t('settings.current_password', 'Current Password') }}
                  </Label>
                  <Input
                    id="settings-current-password"
                    v-model="form.current_password"
                    type="password"
                    :placeholder="t('settings.current_password_placeholder', 'Enter current password')"
                    autocomplete="current-password"
                    :class="validationErrors.current_password ? 'border-destructive' : ''"
                  />
                  <p v-if="validationErrors.current_password" class="text-xs text-destructive">
                    {{ validationErrors.current_password[0] }}
                  </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label for="settings-new-password" class="text-xs">
                      {{ t('settings.new_password', 'New Password') }}
                    </Label>
                    <Input
                      id="settings-new-password"
                      v-model="form.password"
                      type="password"
                      :placeholder="t('settings.new_password_placeholder', 'Min. 8 characters')"
                      autocomplete="new-password"
                      :class="validationErrors.password ? 'border-destructive' : ''"
                    />
                    <p v-if="validationErrors.password" class="text-xs text-destructive">
                      {{ validationErrors.password[0] }}
                    </p>
                  </div>

                  <div class="space-y-2">
                    <Label for="settings-confirm-password" class="text-xs">
                      {{ t('settings.confirm_password', 'Confirm Password') }}
                    </Label>
                    <Input
                      id="settings-confirm-password"
                      v-model="form.password_confirmation"
                      type="password"
                      :placeholder="t('settings.confirm_password_placeholder', 'Re-enter new password')"
                      autocomplete="new-password"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <!-- Save Button -->
          <div class="flex justify-end pt-2">
            <Button type="submit" :disabled="isSaving">
              <Loader2 v-if="isSaving" :size="15" class="animate-spin" />
              <Save v-else :size="15" />
              {{ isSaving ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save Changes') }}
            </Button>
          </div>
        </form>
      </div>

      <Separator />

      <!-- Account Information (read-only) -->
      <div>
        <h3 class="text-sm font-semibold text-foreground mb-4">
          {{ t('settings.account_info', 'Account Information') }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <HugeiconsIcon :icon="CheckmarkCircle01Icon" :size="16" class="text-emerald-400" />
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {{ t('settings.status', 'Status') }}
              </p>
              <p class="text-sm font-semibold text-foreground capitalize mt-0.5">
                {{ store.profile.status || 'active' }}
              </p>
            </div>
          </div>

          <div v-if="store.profile.hotel_name" class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
            <div class="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
              <Building :size="16" class="text-blue-400" />
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {{ t('settings.hotel', 'Hotel') }}
              </p>
              <p class="text-sm font-semibold text-foreground mt-0.5 truncate">
                {{ store.profile.hotel_name }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
            <div class="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
              <HugeiconsIcon :icon="Calendar01Icon" :size="16" class="text-violet-400" />
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {{ t('settings.member_since', 'Member Since') }}
              </p>
              <p class="text-sm font-semibold text-foreground mt-0.5">
                {{ new Date(store.profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>
