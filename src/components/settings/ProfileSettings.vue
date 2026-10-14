<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  Building04Icon,
  Calendar03Icon,
  CheckmarkBadge01Icon,
  Copy01Icon,
  Mail01Icon,
  SecurityLockIcon,
  SmartPhone01Icon,
  Tick01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { ChevronDown, Loader2 } from 'lucide-vue-next'
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import { Label } from '@/components/uic/label'
import { Separator } from '@/components/uic/separator'
import { Skeleton } from '@/components/uic/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/uic/collapsible'
import { useSettingsStore } from '@/stores/shared/settingsStore'
import { useSonarStore } from '@/stores/shared/sonar'

const { t, locale } = useI18n()
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

const copiedEmail = ref(false)
function copyEmail(email: string) {
  navigator.clipboard.writeText(email)
  copiedEmail.value = true
  toast.success(t('settings.copied', 'Copied to clipboard'))
  setTimeout(() => (copiedEmail.value = false), 2000)
}

watch(() => store.profile, (profile) => {
  if (profile) {
    form.name = profile.name || ''
    form.phone = profile.phone || ''
  }
}, { immediate: true })

function getInitials(name?: string): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => (p?.[0] ? p[0].toUpperCase() : ''))
    .join('')
}

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
  <div class="space-y-8 max-w-[760px] mx-auto">

    <!-- Loading Skeleton -->
    <template v-if="store.isLoading && !store.profile">
      <div class="flex items-center gap-4 mb-6">
        <Skeleton class="w-16 h-16 rounded-2xl" />
        <div class="space-y-2 flex-1">
          <Skeleton class="h-6 w-36" />
          <Skeleton class="h-4 w-48" />
        </div>
      </div>
      <div class="space-y-5">
        <div v-for="i in 3" :key="i" class="space-y-2">
          <Skeleton class="h-4 w-28" />
          <Skeleton class="h-10 w-full rounded-xl" />
        </div>
      </div>
    </template>

    <template v-else-if="store.profile">

      <!-- ── Profile Identity Hero Card ───────────────────────────────── -->
      <div class="relative rounded-2xl overflow-hidden border border-border/50 bg-card/60 backdrop-blur-md shadow-xs">
        <div class="h-16 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div class="-mt-8 px-6 pb-6">
          <div class="flex items-end gap-5">
            <!-- Monogram Avatar -->
            <div class="relative shrink-0">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/15 to-primary/5 border-2 border-primary/40 flex items-center justify-center font-extrabold text-xl text-primary shadow-md tracking-wider">
                {{ getInitials(store.profile.name) }}
              </div>
              <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-card flex items-center justify-center shadow-xs">
                <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="12" class="text-white" />
              </span>
            </div>

            <div class="flex-1 min-w-0 pb-0.5">
              <div class="flex items-center gap-2.5 flex-wrap">
                <h2 class="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">
                  {{ store.profile.name }}
                </h2>
                <Badge v-if="store.profile.role" variant="secondary" class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {{ store.profile.role.name }}
                </Badge>
              </div>
              <p class="text-xs sm:text-sm text-muted-foreground truncate mt-0.5 font-mono">
                {{ store.profile.email }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Profile Settings Form ────────────────────────────────────── -->
      <div class="space-y-6">
        <div>
          <h3 class="text-base font-bold text-foreground">
            {{ t('settings.personal_info', 'Personal Information') }}
          </h3>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ t('settings.profile_settings_desc', 'Manage your personal information and security settings.') }}
          </p>
        </div>

        <form class="space-y-5" @submit.prevent="handleSaveProfile">
          <!-- Full Name -->
          <div class="space-y-2">
            <Label for="settings-name" class="text-xs font-medium flex items-center gap-1.5 text-foreground/80">
              <HugeiconsIcon :icon="UserIcon" :size="14" class="text-primary" />
              <span>{{ t('settings.full_name', 'Full Name') }}</span>
            </Label>
            <Input
              id="settings-name"
              v-model="form.name"
              type="text"
              :placeholder="t('settings.name_placeholder', 'Enter your full name')"
              class="h-11 rounded-xl bg-muted/20 border-border/50 text-sm focus:border-primary/50"
              :class="validationErrors.name ? 'border-destructive' : ''"
            />
            <p v-if="validationErrors.name" class="text-xs text-destructive">
              {{ validationErrors.name[0] }}
            </p>
          </div>

          <!-- Email (read-only) -->
          <div class="space-y-2">
            <Label class="text-xs font-medium flex items-center gap-1.5 text-foreground/80">
              <HugeiconsIcon :icon="Mail01Icon" :size="14" class="text-primary" />
              <span>{{ t('settings.email', 'Email Address') }}</span>
            </Label>
            <div class="flex h-11 w-full items-center justify-between rounded-xl border border-border/40 bg-muted/30 px-4 text-xs sm:text-sm text-muted-foreground font-mono select-all">
              <span>{{ store.profile.email }}</span>
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground transition-colors p-1"
                @click="copyEmail(store.profile.email)"
              >
                <HugeiconsIcon
                  :icon="copiedEmail ? Tick01Icon : Copy01Icon"
                  :size="14"
                  :class="{ 'text-emerald-400': copiedEmail }"
                />
              </button>
            </div>
            <p class="text-[11px] text-muted-foreground/70">
              {{ t('settings.email_hint', 'Email cannot be changed. Contact your administrator if needed.') }}
            </p>
          </div>

          <!-- Phone Number -->
          <div class="space-y-2">
            <Label for="settings-phone" class="text-xs font-medium flex items-center gap-1.5 text-foreground/80">
              <HugeiconsIcon :icon="SmartPhone01Icon" :size="14" class="text-primary" />
              <span>{{ t('settings.phone', 'Phone Number') }}</span>
            </Label>
            <Input
              id="settings-phone"
              v-model="form.phone"
              type="text"
              dir="ltr"
              :placeholder="t('settings.phone_placeholder', '+1 234 567 8900')"
              class="h-11 rounded-xl bg-muted/20 border-border/50 text-sm font-mono focus:border-primary/50"
              :class="validationErrors.phone ? 'border-destructive' : ''"
            />
            <p v-if="validationErrors.phone" class="text-xs text-destructive">
              {{ validationErrors.phone[0] }}
            </p>
          </div>

          <Separator class="my-6 border-border/40" />

          <!-- Password Change Section -->
          <Collapsible v-model:open="showPasswordSection">
            <CollapsibleTrigger as-child>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="gap-2 text-foreground/80 hover:text-foreground -ml-2 h-9 rounded-xl border border-transparent hover:border-border/40"
              >
                <HugeiconsIcon :icon="SecurityLockIcon" :size="15" class="text-primary" />
                <span class="text-xs font-bold">
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
              <div class="mt-4 space-y-4 p-5 rounded-2xl border border-border/50 bg-muted/20 backdrop-blur-xs">
                <div class="space-y-2">
                  <Label for="settings-current-password" class="text-xs font-medium">
                    {{ t('settings.current_password', 'Current Password') }}
                  </Label>
                  <Input
                    id="settings-current-password"
                    v-model="form.current_password"
                    type="password"
                    :placeholder="t('settings.current_password_placeholder', 'Enter current password')"
                    autocomplete="current-password"
                    class="h-10 rounded-xl bg-card border-border/50 text-sm"
                    :class="validationErrors.current_password ? 'border-destructive' : ''"
                  />
                  <p v-if="validationErrors.current_password" class="text-xs text-destructive">
                    {{ validationErrors.current_password[0] }}
                  </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label for="settings-new-password" class="text-xs font-medium">
                      {{ t('settings.new_password', 'New Password') }}
                    </Label>
                    <Input
                      id="settings-new-password"
                      v-model="form.password"
                      type="password"
                      :placeholder="t('settings.new_password_placeholder', 'Min. 8 characters')"
                      autocomplete="new-password"
                      class="h-10 rounded-xl bg-card border-border/50 text-sm"
                      :class="validationErrors.password ? 'border-destructive' : ''"
                    />
                    <p v-if="validationErrors.password" class="text-xs text-destructive">
                      {{ validationErrors.password[0] }}
                    </p>
                  </div>

                  <div class="space-y-2">
                    <Label for="settings-confirm-password" class="text-xs font-medium">
                      {{ t('settings.confirm_password', 'Confirm Password') }}
                    </Label>
                    <Input
                      id="settings-confirm-password"
                      v-model="form.password_confirmation"
                      type="password"
                      :placeholder="t('settings.confirm_password_placeholder', 'Re-enter new password')"
                      autocomplete="new-password"
                      class="h-10 rounded-xl bg-card border-border/50 text-sm"
                    />
                  </div>
                </div>
                <p class="text-[11px] text-muted-foreground">
                  {{ t('settings.password_hint', 'Use 8 or more characters with a mix of letters and numbers') }}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <!-- Save Button -->
          <div class="flex justify-end pt-3">
            <Button
              type="submit"
              class="rounded-xl h-11 px-6 font-bold text-sm bg-primary text-primary-foreground shadow-xs shadow-primary/25 hover:shadow-md hover:shadow-primary/30 transition-all cursor-pointer"
              :disabled="isSaving"
            >
              <Loader2 v-if="isSaving" :size="16" class="animate-spin mr-2" />
              <HugeiconsIcon v-else :icon="CheckmarkBadge01Icon" :size="16" class="mr-2" />
              {{ isSaving ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save Changes') }}
            </Button>
          </div>
        </form>
      </div>

      <Separator class="my-6 border-border/40" />

      <!-- ── Account & Organization Information ──────────────────────── -->
      <div>
        <h3 class="text-sm font-bold text-foreground mb-4">
          {{ t('settings.account_info', 'Account Information') }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <!-- Status Tile -->
          <div class="flex items-start gap-3.5 p-4 rounded-xl bg-muted/20 border border-border/40">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="18" class="text-emerald-400" />
            </div>
            <div class="min-w-0">
              <p class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {{ t('settings.status', 'Status') }}
              </p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p class="text-sm font-bold text-foreground capitalize">
                  {{ store.profile.status || 'active' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Hotel / Property Tile -->
          <div class="flex items-start gap-3.5 p-4 rounded-xl bg-muted/20 border border-border/40">
            <div class="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <HugeiconsIcon :icon="Building04Icon" :size="18" class="text-primary" />
            </div>
            <div class="min-w-0">
              <p class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {{ t('settings.hotel', 'Hotel Scope') }}
              </p>
              <p class="text-sm font-bold text-foreground mt-0.5 truncate">
                {{ store.profile.hotel_name || t('settings.all_hotels', 'All Properties') }}
              </p>
            </div>
          </div>

          <!-- Member Since Tile -->
          <div class="flex items-start gap-3.5 p-4 rounded-xl bg-muted/20 border border-border/40">
            <div class="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
              <HugeiconsIcon :icon="Calendar03Icon" :size="18" class="text-violet-400" />
            </div>
            <div class="min-w-0">
              <p class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {{ t('settings.member_since', 'Member Since') }}
              </p>
              <p class="text-sm font-bold text-foreground mt-0.5 font-mono">
                {{ new Date(store.profile.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>
