<script setup lang="ts">
import type { Hotel } from '@/types/hotel'
import { watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { ArrowLeft01Icon, Building04Icon, Location01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from '@/components/uic/button'
import { Skeleton } from '@/components/uic/skeleton'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from '@/composables/shared/useForm'
import { hotelUpdateSchema } from '@/modules/hotels/schema'
import { hotelsService } from '@/services/hotelsService'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const queryClient = useQueryClient()
const id = route.params.id as string

const { data: item, isLoading } = useQuery<Hotel>({
  queryKey: ['hotels', id],
  queryFn: () => hotelsService.get(id),
  retry: false,
  refetchOnWindowFocus: false,
})

const form = useForm({
  resourceName: 'hotels',
  action: 'update',
  schema: hotelUpdateSchema(t),
  mutationFn: data => hotelsService.update(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['hotels'] })
    router.push({ name: 'admin-hotels' })
  },
})

const [name, nameProps] = form.defineField('name')
const [country, countryProps] = form.defineField('country')
const [currency, currencyProps] = form.defineField('currency')
const [phone, phoneProps] = form.defineField('phone')
const [email, emailProps] = form.defineField('email')
const [address, addressProps] = form.defineField('address')
const [checkInTime] = form.defineField('check_in_time')
const [checkOutTime] = form.defineField('check_out_time')
const [timezone, timezoneProps] = form.defineField('timezone')
const [description, descriptionProps] = form.defineField('description')

const currencyOptions = [
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'EGP', label: 'EGP — Egyptian Pound' },
  { value: 'KWD', label: 'KWD — Kuwaiti Dinar' },
  { value: 'BHD', label: 'BHD — Bahraini Dinar' },
  { value: 'OMR', label: 'OMR — Omani Rial' },
  { value: 'QAR', label: 'QAR — Qatari Riyal' },
  { value: 'JOD', label: 'JOD — Jordanian Dinar' },
  { value: 'TRY', label: 'TRY — Turkish Lira' },
]

const timezoneOptions = Intl.supportedValuesOf('timeZone').map(tz => ({
  value: tz,
  label: tz.replace(/_/g, ' '),
}))

// Pre-fill form when data loads
watch(
  item,
  (hotel) => {
    if (hotel) {
      form.setValues({
        name: hotel.name || '',
        country: hotel.country || '',
        currency: hotel.currency || '',
        phone: hotel.phone || '',
        email: hotel.email || '',
        address: hotel.address || '',
        check_in_time: hotel.check_in_time || '',
        check_out_time: hotel.check_out_time || '',
        timezone: hotel.timezone || '',
        description: hotel.description || '',
      })
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Top Bar -->
    <div class="flex items-center justify-between pb-2 border-b border-border/50">
      <div class="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          class="h-9 w-9 rounded-xl border-border/60 hover:bg-muted/80 transition-colors"
          @click="router.push({ name: 'admin-hotels' })"
        >
          <HugeiconsIcon :icon="ArrowLeft01Icon" :size="16" class="rtl:rotate-180" />
        </Button>
        <div>
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {{ t('actions.edit', 'Edit') }} {{ t('hotels.title', 'Hotel') }}
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ item?.name || t('hotels.subtitle', 'Update hotel information and operational settings') }}
          </p>
        </div>
      </div>

      <Skeleton v-if="isLoading" class="h-6 w-16 rounded-full" />
      <span
        v-else-if="item"
        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider border select-none"
        :class="item.status === 'active'
          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
          : 'border-amber-500/25 bg-amber-500/10 text-amber-400'"
      >
        <span
          class="h-1.5 w-1.5 rounded-full me-1.5 shrink-0"
          :class="item.status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]' : 'bg-amber-400'"
        />
        {{ item.status }}
      </span>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="space-y-6 animate-in fade-in duration-300">
      <div class="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl flex items-center gap-3.5">
        <Skeleton class="h-12 w-12 rounded-xl" />
        <div class="space-y-2">
          <Skeleton class="h-5 w-48 rounded-md" />
          <Skeleton class="h-3.5 w-64 rounded-md" />
        </div>
      </div>

      <div class="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div v-for="i in 6" :key="i" class="space-y-2">
            <Skeleton class="h-4 w-24 rounded-md" />
            <Skeleton class="h-10 w-full rounded-xl" />
          </div>
        </div>
        <div class="space-y-2">
          <Skeleton class="h-4 w-24 rounded-md" />
          <Skeleton class="h-24 w-full rounded-xl" />
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Skeleton class="h-9 w-20 rounded-xl" />
          <Skeleton class="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>

    <template v-else-if="item">
      <!-- Hotel Quick Banner -->
      <div class="rounded-2xl border border-border/60 bg-gradient-to-r from-primary/10 via-card to-card p-5 backdrop-blur-xl flex items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="h-12 w-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shadow-sm">
            <HugeiconsIcon :icon="Building04Icon" :size="22" />
          </div>
          <div>
            <h2 class="text-base font-bold text-foreground">{{ item.name }}</h2>
            <p v-if="item.address" class="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <HugeiconsIcon :icon="Location01Icon" :size="12" />
              <span>{{ item.address }}</span>
            </p>
          </div>
        </div>
      </div>

      <FormContainer
        :form="form"
        :is-edit="true"
        @cancel="router.push({ name: 'admin-hotels' })"
      >
        <!-- Hotel Name -->
        <InputField
          name="name"
          v-model="name"
          v-bind="nameProps"
          :label="t('hotels.fields.name', 'Hotel Name')"
          :placeholder="t('hotels.placeholders.name', 'Enter hotel name')"
          :error="form.displayErrors.value.name"
        />

        <!-- Country -->
        <InputField
          name="country"
          v-model="country"
          v-bind="countryProps"
          :label="t('hotels.fields.country', 'Country')"
          :placeholder="t('hotels.placeholders.country', 'e.g. Saudi Arabia')"
          :error="form.displayErrors.value.country"
        />

        <!-- Currency -->
        <SelectField
          name="currency"
          v-model="currency"
          v-bind="currencyProps"
          :options="currencyOptions"
          :label="t('hotels.fields.currency', 'Currency')"
          :placeholder="t('hotels.placeholders.currency', 'Select currency')"
          :error="form.displayErrors.value.currency"
        />

        <!-- Phone -->
        <InputField
          name="phone"
          v-model="phone"
          v-bind="phoneProps"
          :label="t('hotels.fields.phone', 'Phone')"
          :placeholder="t('hotels.placeholders.phone', '+966 ...')"
          :error="form.displayErrors.value.phone"
        />

        <!-- Email -->
        <InputField
          name="email"
          type="email"
          v-model="email"
          v-bind="emailProps"
          :label="t('hotels.fields.email', 'Hotel Email')"
          :placeholder="t('hotels.placeholders.email', 'info@hotel.com')"
          :error="form.displayErrors.value.email"
        />

        <!-- Address -->
        <div class="md:col-span-2">
          <InputField
            name="address"
            v-model="address"
            v-bind="addressProps"
            :label="t('hotels.fields.address', 'Address')"
            :placeholder="t('hotels.placeholders.address', 'Full hotel address')"
            :error="form.displayErrors.value.address"
          />
        </div>

        <!-- Check-in / Check-out Times -->
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none">
            {{ t('hotels.fields.check_in_time', 'Check-in Time') }}
          </label>
          <TimePicker
            v-model="checkInTime"
            :placeholder="t('hotels.placeholders.check_in_time', 'Select time')"
            class="w-full"
          />
          <p v-if="form.displayErrors.value.check_in_time" class="text-[13px] text-destructive">
            {{ form.displayErrors.value.check_in_time }}
          </p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium leading-none">
            {{ t('hotels.fields.check_out_time', 'Check-out Time') }}
          </label>
          <TimePicker
            v-model="checkOutTime"
            :placeholder="t('hotels.placeholders.check_out_time', 'Select time')"
            class="w-full"
          />
          <p v-if="form.displayErrors.value.check_out_time" class="text-[13px] text-destructive">
            {{ form.displayErrors.value.check_out_time }}
          </p>
        </div>

        <!-- Timezone -->
        <SelectField
          name="timezone"
          v-model="timezone"
          v-bind="timezoneProps"
          variant="search"
          :options="timezoneOptions"
          :label="t('hotels.fields.timezone', 'Timezone')"
          :placeholder="t('hotels.placeholders.timezone', 'Select timezone')"
          :error="form.displayErrors.value.timezone"
        />

        <!-- Description -->
        <div class="md:col-span-2">
          <InputField
            name="description"
            v-model="description"
            v-bind="descriptionProps"
            :label="t('hotels.fields.description', 'Description')"
            :placeholder="t('hotels.placeholders.description', 'Brief description of the hotel')"
            :error="form.displayErrors.value.description"
          />
        </div>
      </FormContainer>
    </template>
  </div>
</template>
