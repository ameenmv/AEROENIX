<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { hotelCreateSchema } from '@/modules/hotels/schema'
import { hotelsService } from '@/services/hotelsService'

const { t } = useI18n()
const router = useRouter()

const form = useForm({
  resourceName: 'hotels',
  action: 'create',
  schema: hotelCreateSchema(t),
  mutationFn: data => hotelsService.create(data),
  onSuccess: () => router.push({ name: 'admin-hotels' }),
})

const [name, nameProps] = form.defineField('name')
const [adminEmail, adminEmailProps] = form.defineField('admin_email')
const [country, countryProps] = form.defineField('country')
const [currency, currencyProps] = form.defineField('currency')
const [phone, phoneProps] = form.defineField('phone')
const [email, emailProps] = form.defineField('email')
const [address, addressProps] = form.defineField('address')
const [checkInTime, checkInTimeProps] = form.defineField('check_in_time')
const [checkOutTime, checkOutTimeProps] = form.defineField('check_out_time')
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

// All IANA timezones from the browser
const timezoneOptions = Intl.supportedValuesOf('timeZone').map(tz => ({
  value: tz,
  label: tz.replace(/_/g, ' '),
}))

</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">
      {{ t('actions.create', 'Create') }} {{ t('hotels.title', 'Hotel') }}
    </h1>

    <FormContainer :form="form" @cancel="router.push({ name: 'admin-hotels' })">
      <!-- Hotel Name -->
      <InputField
        name="name"
        v-model="name"
        v-bind="nameProps"
        :label="t('hotels.fields.name', 'Hotel Name')"
        :placeholder="t('hotels.placeholders.name', 'Enter hotel name')"
        :error="form.displayErrors.value.name"
      />

      <!-- Admin Email (for invitation) -->
      <InputField
        name="admin_email"
        type="email"
        v-model="adminEmail"
        v-bind="adminEmailProps"
        :label="t('hotels.fields.admin_email', 'Admin Email')"
        :placeholder="t('hotels.placeholders.admin_email', 'Email for the hotel admin invitation')"
        :error="form.displayErrors.value.admin_email"
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
  </div>
</template>
