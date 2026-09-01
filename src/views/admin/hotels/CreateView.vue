<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { hotelCreateSchema } from '@/modules/hotels/schema'
import { hotelsService } from '@/services/hotelsService'
import { Button } from '@/components/uic/button'
import { ArrowLeftIcon } from 'lucide-vue-next'
import { 
  Stepper, StepperItem, StepperTrigger, StepperIndicator, StepperTitle, StepperDescription, StepperSeparator 
} from '@/components/uic/stepper'

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

const currentStep = ref(1)

const steps = [
  { step: 1, title: t('hotels.wizard.step1.title', 'Basic Info'), description: t('hotels.wizard.step1.desc', 'General details') },
  { step: 2, title: t('hotels.wizard.step2.title', 'Operations'), description: t('hotels.wizard.step2.desc', 'Times & Timezone') },
  { step: 3, title: t('hotels.wizard.step3.title', 'Admin User'), description: t('hotels.wizard.step3.desc', 'Invite the manager') },
]

function nextStep() {
  // Can add manual validation for specific fields here if needed
  if (currentStep.value < 3) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}
</script>

<template>
  <div class="space-y-8 max-w-5xl mx-auto pb-12">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" class="rounded-full bg-card border shadow-sm" @click="router.push({ name: 'admin-hotels' })">
        <ArrowLeftIcon class="w-5 h-5 text-muted-foreground" />
      </Button>
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">
          {{ t('actions.create_new', 'Create New') }} {{ t('hotels.title', 'Hotel') }}
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ t('hotels.wizard.subtitle', 'Set up a new property and invite its first admin.') }}
        </p>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
      <!-- Left Sidebar: Stepper -->
      <div class="w-full md:w-64 lg:w-72 flex-shrink-0 bg-card rounded-2xl border shadow-sm p-6">
        <Stepper v-model="currentStep" class="flex flex-col gap-6">
          <StepperItem v-for="s in steps" :key="s.step" :step="s.step" class="relative flex w-full items-start gap-4">
            <StepperTrigger class="flex flex-row items-center justify-start gap-4 w-full text-left group">
              <StepperIndicator class="transition-colors group-hover:bg-primary/10">
                {{ s.step }}
              </StepperIndicator>
              <div class="flex flex-col text-left">
                <StepperTitle class="text-sm font-bold tracking-tight text-left" :class="currentStep === s.step ? 'text-primary' : 'text-foreground'">{{ s.title }}</StepperTitle>
                <StepperDescription class="text-xs text-muted-foreground/80 mt-0.5 text-left">{{ s.description }}</StepperDescription>
              </div>
            </StepperTrigger>
            <StepperSeparator v-if="s.step !== 3" class="absolute left-[18px] top-[42px] h-6 w-[2px] -translate-x-1/2 bg-muted/50" />
          </StepperItem>
        </Stepper>
      </div>

      <!-- Right Panel: Form Content -->
      <div class="flex-1 w-full bg-card rounded-2xl border shadow-sm">
        <form @submit.prevent="form.onSubmit">
          <div class="p-8">
            <!-- Step 1: Basic Info -->
            <div v-show="currentStep === 1" class="space-y-6">
              <div class="border-b pb-4 mb-6">
                <h3 class="text-lg font-bold tracking-tight">{{ t('hotels.wizard.step1.heading', 'Basic Information') }}</h3>
                <p class="text-sm text-muted-foreground">{{ t('hotels.wizard.step1.subheading', 'Enter the primary details for this hotel.') }}</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <InputField
                    name="name"
                    v-model="name"
                    v-bind="nameProps"
                    :label="t('hotels.fields.name', 'Hotel Name *')"
                    :placeholder="t('hotels.placeholders.name', 'e.g. Qusoor El Arab Camp')"
                    :error="form.displayErrors.value.name"
                  />
                </div>
                <InputField
                  name="country"
                  v-model="country"
                  v-bind="countryProps"
                  :label="t('hotels.fields.country', 'Country')"
                  :placeholder="t('hotels.placeholders.country', 'e.g. Egypt')"
                  :error="form.displayErrors.value.country"
                />
                <SelectField
                  name="currency"
                  v-model="currency"
                  v-bind="currencyProps"
                  :options="currencyOptions"
                  :label="t('hotels.fields.currency', 'Currency')"
                  :placeholder="t('hotels.placeholders.currency', 'EGP')"
                  :error="form.displayErrors.value.currency"
                />
                <InputField
                  name="phone"
                  v-model="phone"
                  v-bind="phoneProps"
                  :label="t('hotels.fields.phone', 'Phone')"
                  :placeholder="t('hotels.placeholders.phone', '+2010...')"
                  :error="form.displayErrors.value.phone"
                />
                <InputField
                  name="email"
                  type="email"
                  v-model="email"
                  v-bind="emailProps"
                  :label="t('hotels.fields.email', 'Email')"
                  :placeholder="t('hotels.placeholders.email', 'contact@hotel.com')"
                  :error="form.displayErrors.value.email"
                />
                <div class="md:col-span-2">
                  <InputField
                    name="address"
                    v-model="address"
                    v-bind="addressProps"
                    :label="t('hotels.fields.address', 'Address')"
                    :placeholder="t('hotels.placeholders.address', 'Full property address...')"
                    :error="form.displayErrors.value.address"
                  />
                </div>
              </div>
            </div>

            <!-- Step 2: Operations -->
            <div v-show="currentStep === 2" class="space-y-6">
              <div class="border-b pb-4 mb-6">
                <h3 class="text-lg font-bold tracking-tight">{{ t('hotels.wizard.step2.heading', 'Operations Settings') }}</h3>
                <p class="text-sm text-muted-foreground">{{ t('hotels.wizard.step2.subheading', 'Configure operational hours and timezone.') }}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-sm font-medium leading-none">{{ t('hotels.fields.check_in_time', 'Check-in Time') }}</label>
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
                  <label class="text-sm font-medium leading-none">{{ t('hotels.fields.check_out_time', 'Check-out Time') }}</label>
                  <TimePicker
                    v-model="checkOutTime"
                    :placeholder="t('hotels.placeholders.check_out_time', 'Select time')"
                    class="w-full"
                  />
                  <p v-if="form.displayErrors.value.check_out_time" class="text-[13px] text-destructive">
                    {{ form.displayErrors.value.check_out_time }}
                  </p>
                </div>

                <div class="md:col-span-2">
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
                </div>

                <div class="md:col-span-2">
                  <InputField
                    name="description"
                    v-model="description"
                    v-bind="descriptionProps"
                    :label="t('hotels.fields.description', 'Description (Optional)')"
                    :placeholder="t('hotels.placeholders.description', 'Brief description of the hotel')"
                    :error="form.displayErrors.value.description"
                  />
                </div>
              </div>
            </div>

            <!-- Step 3: Admin User -->
            <div v-show="currentStep === 3" class="space-y-6">
              <div class="border-b pb-4 mb-6">
                <h3 class="text-lg font-bold tracking-tight">{{ t('hotels.wizard.step3.heading', 'Admin Invitation') }}</h3>
                <p class="text-sm text-muted-foreground">{{ t('hotels.wizard.step3.subheading', 'We will send an invitation email to set up the admin account.') }}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <InputField
                    name="admin_email"
                    type="email"
                    v-model="adminEmail"
                    v-bind="adminEmailProps"
                    :label="t('hotels.fields.admin_email', 'Admin Email *')"
                    :placeholder="t('hotels.placeholders.admin_email', 'admin@hotel.com')"
                    :error="form.displayErrors.value.admin_email"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Actions Footer -->
          <div class="flex items-center justify-between px-8 py-5 border-t bg-muted/10 rounded-b-2xl">
            <div>
              <Button v-if="currentStep > 1" type="button" variant="outline" @click="prevStep" class="font-semibold text-muted-foreground hover:text-foreground">
                {{ t('actions.back', 'Back') }}
              </Button>
            </div>
            <div>
              <Button v-if="currentStep < 3" type="button" @click="nextStep" class="min-w-28 font-semibold">
                {{ t('actions.continue', 'Continue') }}
              </Button>
              <Button 
                v-if="currentStep === 3" 
                type="submit" 
                :disabled="form.isPending.value" 
                class="min-w-32 font-bold shadow-md bg-primary hover:bg-primary/90"
              >
                <span v-if="form.isPending.value" class="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                {{ t('actions.submit', 'Create Hotel') }}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
