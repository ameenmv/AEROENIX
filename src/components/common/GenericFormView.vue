<script setup lang="ts">
import type { FormField } from '@/types'
import { useFetch } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { FormContainer } from '@/components/ui/forms'
import { MOCK_DATA } from '@/services/mockData'

const props = defineProps({
  resource: { type: String, required: true },
  title: { type: String, required: true },
  endpoint: { type: String, required: true },
  fields: { type: Array as () => FormField[], required: true },
  isEdit: { type: Boolean, default: false },
})
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const formData = ref<Record<string, any>>({})
const loading = ref(false)
const saving = ref(false)
const files = ref<Record<string, File>>({})
async function fetchData() {
  if (!props.isEdit)
    return
  loading.value = true
  const id = route.params.id
  try {
    const { data, error: fetchError } = await useFetch(`${props.endpoint}/${id}`).json()
    if (fetchError.value) {
      console.warn(`API failed for ${props.resource} details, utilizing mock data.`)
      formData.value
        = (MOCK_DATA as any)[props.resource].find((i: any) => i.id === Number(id)) || {}
    }
    else {
      formData.value = data.value?.data || data.value || {}
    }
  }
  catch {
    formData.value = (MOCK_DATA as any)[props.resource].find((i: any) => i.id === Number(id)) || {}
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
    router.push(`/admin/${props.resource}`)
  }
  catch (error) {
    console.error(error)
  }
  finally {
    saving.value = false
  }
}
onMounted(fetchData)
</script>

<template>
  <div class="max-w-4xl mx-auto mt-10">
    <CardContainer variant="form">
      <h2
        class="font-sans text-[20px] font-normal text-foreground capitalize tracking-[-0.38px] mb-8"
      >
        {{ isEdit ? t('common.edit') : t('common.create') }} {{ t(`${resource}.title`, title) }}
      </h2>
      <FormContainer
        :fields="fields"
        :model-value="formData"
        :loading="loading"
        :saving="saving"
        :is-edit="isEdit"
        @update:model-value="(val: Record<string, any>) => Object.assign(formData, val)"
        @submit="handleSubmit"
        @cancel="router.back()"
        @file-change="handleFileChange"
      />
    </CardContainer>
  </div>
</template>
