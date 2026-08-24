<script setup lang="ts">
import type { FormField } from '@/types'
import { useFetch } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { DetailsDisplay } from '@/components/ui/forms'
import { MOCK_DATA } from '@/services/mockData'

const props = defineProps({
  resource: { type: String, required: true },
  title: { type: String, required: true },
  endpoint: { type: String, required: true },
  fields: { type: Array as () => FormField[], required: true },
})
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const itemData = ref<Record<string, any>>({})
const loading = ref(false)
async function fetchData() {
  loading.value = true
  const id = route.params.id
  if (!id) {
    loading.value = false
    return
  }
  try {
    const { data, error: fetchError } = await useFetch(`${props.endpoint}/${id}`).json()
    if (fetchError.value) {
      console.warn(`API failed for ${props.resource} details, utilizing mock data.`)
      itemData.value
        = (MOCK_DATA as any)[props.resource]?.find((i: any) => i.id === Number(id)) || {}
    }
    else {
      itemData.value = data.value?.data || data.value || {}
    }
  }
  catch {
    if ((MOCK_DATA as any)[props.resource]) {
      itemData.value
        = (MOCK_DATA as any)[props.resource].find((i: any) => i.id === Number(id)) || {}
    }
  }
  finally {
    loading.value = false
  }
}
onMounted(fetchData)
</script>

<template>
  <div class="max-w-4xl mx-auto mt-10">
    <CardContainer variant="form">
      <div class="flex justify-between items-center mb-6">
        <h2
          class="font-sans text-[20px] font-normal text-foreground capitalize tracking-[-0.38px] mb-0"
        >
          {{ t(`${resource}.details_title`, `${t(`${resource}.title`, title)} Details`) }}
        </h2>
        <button
          class="text-white/60 hover:text-white transition-colors text-sm"
          @click="router.back()"
        >
          {{ t('common.back', 'Back') }}
        </button>
      </div>
      <DetailsDisplay :fields="fields" :model-value="itemData" :loading="loading" />
      <div class="mt-8 flex justify-end">
        <button
          class="bg-blue hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-[10px] transition-all"
          @click="router.push(`/admin/${resource}/${route.params.id}/edit`)"
        >
          {{ t('common.edit', 'Edit') }}
        </button>
      </div>
    </CardContainer>
  </div>
</template>
