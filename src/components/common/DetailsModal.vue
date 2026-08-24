<script setup lang="ts">
import type { FormField, ViewConfig } from '@/types'
import { useFetch } from '@vueuse/core'
import { computed, ref, useSlots, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ResourceDetails } from '@/components/ui'
import { DetailsDisplay } from '@/components/ui/forms'
import { ConfirmModal, POV } from '@/components/ui/modals'
import { Button as Btn } from '@/components/uic/button'
import { API_ENDPOINTS } from '@/config/endpoints'
import { MOCK_DATA } from '@/services/mockData'

const props = withDefaults(defineProps<Props>(), {
  show: false,
  endpoint: undefined,
  endpointKey: undefined,
  fields: () => [],
  viewConfig: undefined,
  id: null,
  canEdit: true,
  canDelete: false,
  resourceName: '',
  noPadding: false,
  maxWidth: '4xl',
})
const emit = defineEmits(['close', 'edit', 'delete'])
const { t } = useI18n()
type EndpointKey = keyof typeof API_ENDPOINTS
interface Props {
  show?: boolean
  resource: string
  title: string
  endpoint?: string
  endpointKey?: EndpointKey
  fields?: FormField[]
  viewConfig?: ViewConfig
  id?: string | number | null
  canEdit?: boolean
  canDelete?: boolean
  resourceName?: string
  noPadding?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
}
const slots = useSlots()
const itemData = ref<Record<string, unknown>>({})
function getViewForResource(_resource: string): (() => ViewConfig) | undefined {
  return undefined
}
const fallbackViewConfig: ViewConfig = {
  sections: [
    {
      title: 'Details',
      cols: 2,
      fields: [],
    },
  ],
}
const viewConfigForResource = computed(() => {
  const viewFn = getViewForResource(props.resource)
  return viewFn?.() || props.viewConfig || fallbackViewConfig
})
const loading = ref(false)
const error = ref<unknown>(null)
const modalTitle = computed(() => {
  return t(
    `${props.resource}.view_details`,
    `${t(`${props.resource}.title`, props.title)} - ${t('common.details', 'Details')}`,
  )
})
const showConfirmModal = ref(false)
async function fetchData() {
  if (!props.id) {
    itemData.value = {}
    return
  }
  loading.value = true
  error.value = null
  try {
    const endpoint = props.endpoint
      ? `${props.endpoint}/${props.id}`
      : props.endpointKey
        ? (API_ENDPOINTS[props.endpointKey] as any).GET(props.id)
        : `/api/${props.resource}/${props.id}`
    const { data, error: fetchError } = await useFetch(endpoint).json()
    if (fetchError.value) {
      console.warn(`API failed for ${props.resource} details, utilizing mock data.`)
      itemData.value
        = (MOCK_DATA as Record<string, any[]>)[props.resource]?.find(
          (i: Record<string, any>) => i.id === Number(props.id),
        ) || {}
    }
    else {
      itemData.value = data.value?.data || data.value || {}
    }
  }
  catch (e) {
    error.value = e
    itemData.value
      = (MOCK_DATA as Record<string, any[]>)[props.resource]?.find(
        (i: Record<string, any>) => i.id === Number(props.id),
      ) || {}
  }
  finally {
    loading.value = false
  }
}
watch(
  () => props.id,
  () => {
    if (props.show && props.id)
      fetchData()
  },
  { immediate: false },
)
function handleClose() {
  itemData.value = {}
  emit('close')
}
function handleEdit() {
  if (props.id) {
    emit('edit', props.id)
  }
}
function handleDelete() {
  if (props.id) {
    showConfirmModal.value = true
  }
}
function handleConfirmDelete() {
  if (props.id) {
    emit('delete', props.id)
  }
  showConfirmModal.value = false
}
function handleCancelDelete() {
  showConfirmModal.value = false
}
watch(
  () => props.show,
  (newShow) => {
    if (newShow && props.id)
      fetchData()
  },
)
const modalActions = computed(() => {
  if (slots.default)
    return []
  const actions: Record<string, any>[] = []
  if (props.canEdit) {
    actions.push({
      label: t('common.edit', 'Edit'),
      component: Btn,
      props: {
        variant: 'secondary',
        noSyne: true,
      },
      onClick: handleEdit,
    })
  }
  if (props.canDelete) {
    actions.push({
      label: t('common.delete', 'Delete'),
      component: Btn,
      props: {
        variant: 'danger',
        noSyne: true,
      },
      onClick: handleDelete,
    })
  }
  return actions
})
</script>

<template>
  <POV
    :show="show"
    :title="modalTitle"
    :actions="modalActions"
    :max-width="maxWidth"
    :no-padding="noPadding"
    @close="handleClose"
  >
    <slot v-if="$slots.default" :item="itemData" :loading="loading" :error="error" />
    <ResourceDetails
      v-else-if="viewConfig"
      :config="viewConfig"
      :item="itemData"
      :loading="loading"
      :error="error"
      :resource-name="resourceName || title"
    />
    <ResourceDetails
      v-else-if="!fields && (viewConfigForResource || getViewForResource(resource))"
      :config="viewConfigForResource"
      :item="itemData"
      :loading="loading"
      :error="error"
      :resource-name="resourceName || title"
    />
    <DetailsDisplay
      v-else-if="fields"
      :fields="fields"
      :model-value="itemData"
      :loading="loading"
    />
  </POV>
  <ConfirmModal
    :show="showConfirmModal"
    :title="t('common.confirm_delete_title', 'Confirm Deletion')"
    :message="t('common.confirm_delete', 'Are you sure?')"
    @confirm="handleConfirmDelete"
    @cancel="handleCancelDelete"
  />
</template>
