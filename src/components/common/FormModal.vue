<script setup lang="ts">
import { useFetch } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { POV } from '@/components/ui/modals'
import { Button as Btn } from '@/components/uic/button'
import InputField from '@/components/uic/inputs/InputField.vue'
import SelectField from '@/components/uic/select/SelectField.vue'
import { MOCK_DATA } from '@/services/mockData'

const props = withDefaults(defineProps<Props>(), {
  show: false,
  isEdit: false,
  id: null,
  endpoint: '',
  fields: () => [],
})
const emit = defineEmits(['close', 'saved'])
const { t } = useI18n()
interface Field {
  key: string
  label: string
  type?: string
  required?: boolean
  options?: any[]
  placeholder?: string
}
interface Props {
  show?: boolean
  resource: string
  title: string
  endpoint?: string
  fields?: Field[]
  isEdit?: boolean
  id?: string | number | null
}
const formData = ref<Record<string, any>>({})
const loading = ref(false)
const saving = ref(false)
const files = ref<Record<string, File>>({})
const modalTitle = computed(() => {
  return `${props.isEdit ? t('common.edit') : t('common.create')} ${t(`${props.resource}.title`, props.title)}`
})
async function fetchData() {
  if (!props.isEdit || !props.id) {
    formData.value = {}
    return
  }
  loading.value = true
  try {
    const { data, error: fetchError } = await useFetch(`${props.endpoint}/${props.id}`).json()
    if (fetchError.value) {
      console.warn(`API failed for ${props.resource} details, utilizing mock data.`)
      formData.value
        = (MOCK_DATA as Record<string, any[]>)[props.resource]?.find(
          (i: Record<string, any>) => i.id === Number(props.id),
        ) || {}
    }
    else {
      formData.value = data.value?.data || data.value || {}
    }
  }
  catch {
    formData.value
      = (MOCK_DATA as Record<string, any[]>)[props.resource]?.find(
        (i: Record<string, any>) => i.id === Number(props.id),
      ) || {}
  }
  finally {
    loading.value = false
  }
}
function handleFileChange(event: Event, key: string) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    files.value[key] = target.files[0]
  }
}
async function handleSubmit() {
  saving.value = true
  try {
    const payload = new FormData()
    Object.keys(formData.value).forEach((key) => {
      if (formData.value[key] !== null && formData.value[key] !== undefined) {
        payload.append(key, formData.value[key])
      }
    })
    Object.keys(files.value).forEach((key) => {
      const file = files.value[key]
      if (file) {
        payload.append(key, file)
      }
    })
    if (props.isEdit) {
      payload.append('_method', 'PUT')
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.warn('Saved with FormData', payload)
    emit('saved')
    handleClose()
  }
  catch (e) {
    console.error(e)
  }
  finally {
    saving.value = false
  }
}
function handleClose() {
  formData.value = {}
  files.value = {}
  emit('close')
}
onMounted(() => {
  if (props.show)
    fetchData()
})
const modalActions = computed(() => [
  {
    label: t('common.cancel'),
    component: Btn,
    props: {
      variant: 'secondary',
      noSyne: true,
      disabled: saving.value,
    },
    onClick: handleClose,
  },
  {
    label: saving.value ? t('common.saving') : t('common.save'),
    component: Btn,
    props: {
      variant: 'primary',
      loading: saving.value,
      disabled: saving.value,
      type: 'submit',
    },
    onClick: handleSubmit,
  },
])
</script>

<template>
  <POV
    :show="show"
    :title="modalTitle"
    :actions="modalActions"
    max-width="4xl"
    @close="handleClose"
  >
    <form id="modal-form" @submit.prevent="handleSubmit">
      <div v-if="loading" class="flex justify-center items-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue" />
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div v-for="field in fields" :key="field.key" class="flex flex-col">
          <InputField
            v-if="
              !field.type
                || ['text', 'email', 'number', 'date', 'password', 'time', 'textarea'].includes(
                  field.type,
                )
            "
            :id="field.key"
            v-model="formData[field.key]"
            :type="field.type || 'text'"
            :label="field.label"
            :required="field.required"
            :placeholder="
              field.placeholder
                || t(`${resource}.placeholders.${field.key}`, `Enter ${field.label.toLowerCase()}...`)
            "
          />
          <SelectField
            v-else-if="field.type === 'select'"
            :id="field.key"
            v-model="formData[field.key]"
            :options="field.options || []"
            :label="field.label"
            :required="field.required"
            :placeholder="t('common.select_option', 'Select an option...')"
          />
          <div v-else-if="field.type === 'file'" class="mt-1 space-y-2">
            <label class="text-sm font-medium text-white/70">
              {{ t(`${resource}.fields.${field.key}`, field.label) }}
              <span v-if="field.required" class="text-red-500">*</span>
            </label>
            <div class="flex items-center justify-center w-full">
              <label
                :for="`modal-${field.key}`"
                class="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/10 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all"
              >
                <div class="flex flex-col items-center justify-center pt-2 pb-2 text-center px-4">
                  <svg
                    class="w-6 h-6 mb-2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p class="text-xs text-gray-400">
                    <span class="font-semibold text-white">{{
                      files[field.key]?.name || t('common.click_to_upload')
                    }}</span>
                  </p>
                </div>
                <input
                  :id="`modal-${field.key}`"
                  type="file"
                  class="hidden"
                  @change="(e) => handleFileChange(e, field.key)"
                >
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  </POV>
</template>
