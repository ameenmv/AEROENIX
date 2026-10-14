<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import {
  ArrowLeft01Icon,
  CheckmarkBadge01Icon,
  InformationCircleIcon,
  SparklesIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

import { useForm } from '@/composables/shared/useForm'
import { inviteUserSchema } from '@/modules/users/schema'
import { usersService } from '@/services/usersService'
import { rolesService } from '@/services/rolesService'
import { hotelsService } from '@/services/hotelsService'
import { Button } from '@/components/uic/button'
import { Card } from '@/components/uic/card'

const { t } = useI18n()
const router = useRouter()

// ── Dropdown Options ─────────────────────────────────────────────────────────
const { data: matrixData, isLoading: isLoadingRoles } = useQuery({
  queryKey: ['roles-matrix'],
  queryFn: () => rolesService.getMatrix(),
})

const { data: hotelsData, isLoading: isLoadingHotels } = useQuery({
  queryKey: ['hotels-all'],
  queryFn: () => hotelsService.list({ limit: 999 }),
})

const roleOptions = computed(() => {
  const roles = matrixData.value?.roles || []
  return roles
    .filter(r => r.scope === 'hotel')
    .map(r => ({
      value: r.id,
      label: r.name,
    }))
})

const hotelOptions = computed(() => {
  const hotels = hotelsData.value?.data || []
  return hotels.map(h => ({
    value: h.id,
    label: h.name,
  }))
})

// ── Form Setup ───────────────────────────────────────────────────────────────
const form = useForm({
  resourceName: 'users',
  action: 'create',
  schema: inviteUserSchema(t),
  mutationFn: data => usersService.invite(data),
  onSuccess: () => router.push({ name: 'admin-users' }),
})

const [email, emailProps] = form.defineField('email')
const [roleId, roleIdProps] = form.defineField('role_id')
const [hotelId, hotelIdProps] = form.defineField('hotel_id')

// ── Computed for Preview Card ────────────────────────────────────────────────
const selectedRoleName = computed(() => {
  if (!roleId.value) return null
  const found = roleOptions.value.find(r => r.value === roleId.value)
  return found?.label || null
})

const selectedHotelName = computed(() => {
  if (!hotelId.value) return null
  const found = hotelOptions.value.find(h => h.value === hotelId.value)
  return found?.label || null
})
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-7 pb-20 px-2 sm:px-4 animate-in fade-in duration-300">
    <!-- ── Top Header ──────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3.5">
        <Button
          variant="ghost"
          size="icon"
          class="shrink-0 rounded-xl hover:bg-muted/50 border border-border/40"
          @click="router.push({ name: 'admin-users' })"
        >
          <HugeiconsIcon :icon="ArrowLeft01Icon" :size="20" class="rtl:rotate-180" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">
            {{ t('users.actions.invite', 'Invite User') }}
          </h1>
          <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {{ t('users.invite_subtitle', 'Send an invitation to a new user to join the platform') }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── 2-Column Layout ─────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Form (7 cols) -->
      <div class="lg:col-span-7">
        <Card class="rounded-2xl border-border/50 bg-card/70 backdrop-blur-md p-6 sm:p-8 shadow-sm">
          <FormContainer :form="form" @cancel="router.push({ name: 'admin-users' })">
            <!-- Email Field -->
            <div class="md:col-span-2">
              <InputField
                name="email"
                type="email"
                v-model="email"
                v-bind="emailProps"
                :label="t('users.fields.email', 'Email Address')"
                :placeholder="t('users.placeholders.email', 'colleague@hotel.com')"
                :error="form.displayErrors.value.email"
              />
            </div>

            <!-- Role Select -->
            <div>
              <SelectField
                name="role_id"
                v-model="roleId"
                v-bind="roleIdProps"
                :options="roleOptions"
                :label="t('users.fields.role', 'User Role')"
                :placeholder="isLoadingRoles ? t('common.loading') : t('users.placeholders.role')"
                :disabled="isLoadingRoles"
                :error="form.displayErrors.value.role_id"
              />
            </div>

            <!-- Hotel Select -->
            <div>
              <SelectField
                name="hotel_id"
                v-model="hotelId"
                v-bind="hotelIdProps"
                :options="hotelOptions"
                :label="t('users.fields.hotel', 'Target Hotel')"
                :placeholder="isLoadingHotels ? t('common.loading') : t('users.placeholders.hotel')"
                :disabled="isLoadingHotels"
                :error="form.displayErrors.value.hotel_id"
              />
            </div>
          </FormContainer>
        </Card>
      </div>

      <!-- Right Column: Live Invitation Preview & Notes (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        <!-- Live Invitation Preview Card -->
        <Card class="rounded-2xl border-border/50 bg-card/60 backdrop-blur-md p-6 space-y-5 shadow-sm relative overflow-hidden">
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <HugeiconsIcon :icon="SparklesIcon" :size="15" class="text-primary" />
            {{ t('users.invite_preview_title', 'Invitation Preview') }}
          </div>

          <!-- Preview Body -->
          <div class="rounded-xl border border-border/50 bg-muted/20 p-5 space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center font-bold text-lg text-primary shrink-0 shadow-xs">
                {{ email ? email[0].toUpperCase() : '?' }}
              </div>
              <div class="min-w-0 space-y-1">
                <p class="font-bold text-sm text-foreground truncate">
                  {{ email || t('users.fields.email', 'Email Address') }}
                </p>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  <span class="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {{ t('users.status.invited', 'Invited') }}
                </span>
              </div>
            </div>

            <div class="pt-2 border-t border-border/40 grid grid-cols-2 gap-3 text-xs">
              <div class="space-y-0.5">
                <span class="text-muted-foreground/70">{{ t('users.fields.role', 'Role') }}</span>
                <p class="font-medium text-foreground truncate">
                  {{ selectedRoleName || '—' }}
                </p>
              </div>
              <div class="space-y-0.5">
                <span class="text-muted-foreground/70">{{ t('users.fields.hotel', 'Hotel') }}</span>
                <p class="font-medium text-foreground truncate">
                  {{ selectedHotelName || '—' }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Information / Guidance Card -->
        <Card class="rounded-2xl border-border/50 bg-card/40 backdrop-blur-md p-6 space-y-4 shadow-sm">
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <HugeiconsIcon :icon="InformationCircleIcon" :size="16" class="text-sky-400" />
            {{ t('users.invite_guidance_title', 'Invitation Notes') }}
          </div>
          <ul class="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
            <li class="flex items-start gap-2">
              <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="14" class="text-primary mt-0.5 shrink-0" />
              <span>{{ t('users.invite_guidance_1', 'An activation email will be sent with a secure link to set their password.') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="14" class="text-primary mt-0.5 shrink-0" />
              <span>{{ t('users.invite_guidance_2', 'Invitations expire automatically after 7 days if not accepted.') }}</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  </div>
</template>
