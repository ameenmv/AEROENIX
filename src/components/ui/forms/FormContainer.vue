<script setup lang="ts">
import type { StepConfig } from '@/types/config'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { Button as Btn } from '@/components/uic/button'
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/uic/stepper'

interface Props {
  modelValue?: Record<string, any>
  loading?: boolean
  saving?: boolean
  errors?: Record<string, string | string[] | undefined>
  isEdit?: boolean
  title?: string
  /** Unified multi-step configuration */
  steps?: StepConfig[]
  /** Whether to show the stepper component for multi-step forms */
  showStepper?: boolean
  /** Number of steps (required when showStepper is true and no steps config is provided) */
  stepCount?: number
  /** The unified form object returned by useForm() */
  form?: any
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  loading: false,
  saving: false,
  errors: () => ({}),
  isEdit: false,
  title: '',
  steps: () => [],
  showStepper: false,
  stepCount: 1,
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()
const formModel = computed(() => props.form?.values || props.modelValue)
const formErrors = computed(
  () => props.form?.displayErrors?.value ?? props.form?.errors?.value ?? props.errors,
)
const formSaving = computed(() => {
  if (props.form?.isPending !== undefined) {
    return typeof props.form.isPending === 'boolean'
      ? props.form.isPending
      : props.form.isPending.value
  }
  return props.saving
})
const { t } = useI18n()
/** Resolve label: if it looks like a translation key (contains a dot), translate it; otherwise return as-is */
function tl(label: string): string {
  return label.includes('.') ? t(label) : label
}
const currentStep = ref(1)
const maxStep = computed(() => {
  if (props.steps && props.steps.length > 0)
    return props.steps.length
  return props.stepCount > 1 ? props.stepCount : 1
})
const isMultiStep = computed(() => props.showStepper && maxStep.value > 1)
const stepNumbers = computed(() => Array.from({ length: maxStep.value }, (_, i) => i + 1))
const formRef = ref<HTMLFormElement | null>(null)
function handleNext() {
  if (formRef.value && !formRef.value.reportValidity()) {
    return
  }
  if (currentStep.value < maxStep.value) {
    currentStep.value++
  }
}
function handlePrevious() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

/** Scroll to the first field that has a validation error */
function scrollToFirstError() {
  nextTick(() => {
    const errorEl = formRef.value?.querySelector(
      '[data-error="true"], .text-destructive, [aria-invalid="true"]',
    )
    if (errorEl) {
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

function handleSubmit() {
  if (props.form && typeof props.form.onSubmit === 'function') {
    props.form.onSubmit()
    // After validation runs, scroll to the first error if any exist
    scrollToFirstError()
  }
  else {
    emit('submit')
  }
}
// Confirmation dialog handlers
function handleConfirmSubmit() {
  if (props.form && typeof props.form.executeSubmit === 'function') {
    props.form.executeSubmit()
  }
  else {
    emit('submit')
  }
}
function handleCancelSubmit() {
  if (props.form && typeof props.form.cancelSubmit === 'function') {
    props.form.cancelSubmit()
  }
}
</script>

<template>
  <form ref="formRef" class="space-y-6 pt-4" @submit.prevent="handleSubmit">
    <div v-if="loading" class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
    </div>
    <!-- Multi-step form with Stepper component -->
    <template v-else-if="isMultiStep">
      <Stepper v-model="currentStep" class="w-full flex-col gap-10">
        <div class="flex w-full items-start gap-4 justify-center">
          <template v-for="step in stepNumbers" :key="step">
            <StepperItem
              :step="step"
              class="relative flex w-64 flex-col items-center justify-center gap-2"
            >
              <StepperTrigger
                as-child
                class="flex flex-col cursor-pointer items-center justify-center rounded-sm p-2 text-center outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                <StepperIndicator class="bg-white/5 border border-white/10 shrink-0">
                  <template v-if="steps && steps[step - 1]?.icon">
                    <div
                      v-if="
                        typeof steps[step - 1]?.icon === 'string'
                          && steps[step - 1]?.icon?.startsWith('<')
                      "
                      class="w-4 h-4 flex items-center justify-center"
                      v-html="steps[step - 1]?.icon"
                    />
                    <HugeiconsIcon
                      v-else-if="
                        typeof steps[step - 1]?.icon === 'object'
                          || typeof steps[step - 1]?.icon === 'function'
                      "
                      :icon="steps[step - 1]?.icon"
                      class="w-4 h-4"
                    />
                    <component :is="steps[step - 1]?.icon" v-else class="w-4 h-4" />
                  </template>
                  <template v-else>
                    {{ step }}
                  </template>
                </StepperIndicator>
                <div class="flex flex-col text-center">
                  <StepperTitle
                    v-if="steps && steps[step - 1]?.label"
                    class="text-sm font-semibold tracking-tight text-white whitespace-nowrap uppercase"
                  >
                    {{ tl(steps[step - 1]!.label) }}
                  </StepperTitle>
                  <StepperDescription
                    v-if="steps && steps[step - 1]?.description"
                    class="text-[10px] text-muted-foreground whitespace-nowrap"
                  >
                    {{ tl(steps[step - 1]!.description!) }}
                  </StepperDescription>
                </div>
              </StepperTrigger>
              <StepperSeparator
                v-if="step !== stepNumbers[stepNumbers.length - 1]"
                class="absolute start-[calc(50%+30px)] end-[calc(-50%+20px)] top-5 block h-0.5 shrink-0 rounded-full bg-white/10"
              />
            </StepperItem>
          </template>
        </div>
        <StepperItem
          v-for="step in stepNumbers"
          :key="step"
          :step="step"
          class="w-full flex-col! items-stretch! gap-0!"
        >
          <div
            v-if="currentStep === step"
            class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 md:gap-x-12"
          >
            <slot :name="`step-${step}`" :form="formModel" :errors="formErrors" />
          </div>
        </StepperItem>
      </Stepper>
    </template>
    <!-- Single-step form (slot-only) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 md:gap-x-12">
      <slot :form="formModel" :errors="formErrors" />
    </div>
    <!-- Footer: step counter + navigation buttons -->
    <div class="flex justify-between items-center gap-4 pt-6 md:pt-4 border-t border-border">
      <div>
        <span
          v-if="isMultiStep"
          class="text-xs text-muted-foreground uppercase tracking-wider font-semibold"
        >
          {{ t('common.step', 'Step') }} {{ currentStep }} {{ t('common.of', 'of') }} {{ maxStep }}
        </span>
      </div>
      <div class="flex gap-4">
        <Btn
          v-if="isMultiStep && currentStep > 1"
          type="button"
          variant="secondary"
          :disabled="formSaving"
          @click="handlePrevious"
        >
          {{ t('common.previous', 'Previous') }}
        </Btn>
        <Btn
          v-if="!isMultiStep || currentStep === maxStep"
          type="button"
          variant="secondary"
          :disabled="formSaving"
          @click="emit('cancel')"
        >
          {{ t('common.cancel', 'Cancel') }}
        </Btn>
        <Btn
          v-if="isMultiStep && currentStep < maxStep"
          type="button"
          variant="default"
          :disabled="formSaving"
          @click="handleNext"
        >
          {{ t('common.next', 'Next') }}
        </Btn>
        <Btn
          v-if="!isMultiStep || currentStep === maxStep"
          type="submit"
          variant="default"
          :loading="formSaving"
          :disabled="formSaving"
        >
          {{
            isEdit || form?.action === 'update'
              ? t('common.save_changes', 'Save Changes')
              : t('common.create', 'Create')
          }}
        </Btn>
      </div>
    </div>
  </form>

  <!-- Confirmation Dialog -->
  <ConfirmDialog
    v-if="form?.hasConfirmBeforeSubmit?.value ?? form?.hasConfirmBeforeSubmit"
    :show="form?.showConfirmDialog?.value ?? form?.showConfirmDialog"
    :title="form?.confirmTitle?.value ?? form?.confirmTitle"
    :message="form?.confirmMessage?.value ?? form?.confirmMessage"
    :confirm-label="form?.confirmLabel?.value ?? form?.confirmLabel"
    :cancel-label="form?.cancelLabel?.value ?? form?.cancelLabel"
    @confirm="handleConfirmSubmit"
    @cancel="handleCancelSubmit"
  />
</template>
