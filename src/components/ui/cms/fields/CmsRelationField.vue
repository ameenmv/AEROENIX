<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AsyncSelectField from '@/components/uic/select/AsyncSelectField.vue'
import api from '@/services/api'

const props = defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  relationType?: 'one_to_one' | 'one_to_many'
  modelTable?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const ADMIN = '/api/admin/v1'

const isMultiple = computed(() => props.relationType === 'one_to_many')

// Resolve array vs single dynamically
const standardizedModelValue = computed(() => {
  if (isMultiple.value) {
    return Array.isArray(props.modelValue)
      ? props.modelValue
      : props.modelValue
        ? [props.modelValue]
        : []
  }
  return Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue
})

// Load relation options from API dynamically
async function loadRelationOptions({ page, search }: { page: number, search: string }) {
  if (!props.modelTable)
    return { data: [], totalPages: 1 }

  const endpointEntity = props.modelTable.replace(/_/g, '-')

  try {
    const { data } = await api.get(`${ADMIN}/${endpointEntity}`, {
      params: {
        page,
        search,
        limit: 15,
      },
    })

    // Map items to standard dropdown Options { value, label }
    const mapped = (data.data || []).map((item: any) => {
      // Find the most likely readable field (name, title)
      const getLocalized = (val: any) => (typeof val === 'object' ? val?.en || val?.ar || '' : val)
      const label
        = getLocalized(item.title)
          || getLocalized(item.name)
          || getLocalized(item.label)
          || `${props.modelTable} #${item.id}`
      return {
        value: item.id,
        label: String(label),
      }
    })

    return {
      data: mapped,
      totalPages: data.meta?.last_page || 1,
    }
  }
  catch (error) {
    console.error('Failed to load relation dropdown options:', error)
    return { data: [], totalPages: 1 }
  }
}

// Initial hydration state
const initialOptions = ref<{ value: number | string, label: string }[]>([])

// Fetch metadata for pre-existing selected IDs so they don't show up as blank
onMounted(async () => {
  if (!props.modelTable || !standardizedModelValue.value)
    return

  const ids = Array.isArray(standardizedModelValue.value)
    ? standardizedModelValue.value
    : [standardizedModelValue.value]
  if (ids.length === 0)
    return

  const endpointEntity = props.modelTable.replace(/_/g, '-')

  try {
    const promises = ids.map((id: any) => api.get(`${ADMIN}/${endpointEntity}/${id}`))
    const results = await Promise.allSettled(promises)

    initialOptions.value = results
      .map((res) => {
        if (res.status === 'fulfilled' && res.value.data?.data) {
          const item = res.value.data.data
          const getLocalized = (val: any) =>
            typeof val === 'object' ? val?.en || val?.ar || '' : val
          const label
            = getLocalized(item.title)
              || getLocalized(item.name)
              || getLocalized(item.label)
              || `${props.modelTable} #${item.id}`
          return { value: item.id, label: String(label) }
        }
        return null
      })
      .filter(Boolean) as { value: number | string, label: string }[]
  }
  catch {
    console.warn('Failed to pre-fetch selected relation options')
  }
})
</script>

<template>
  <div class="relative">
    <AsyncSelectField
      :model-value="standardizedModelValue"
      :label="label"
      :required="required"
      :placeholder="placeholder || `Select ${modelTable || 'related item'}...`"
      :multiple="isMultiple"
      :options-loader="loadRelationOptions"
      :initial-option="initialOptions"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <div class="flex items-center gap-2 mt-1 px-1">
      <span
        v-if="modelTable"
        class="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-mono"
      >
        {{ $t('cms.relation_table', 'table:') }} <strong>{{ modelTable }}</strong>
      </span>
      <span v-if="relationType" class="text-[10px] text-muted-foreground capitalize">
        {{ relationType.replace('_', ' ') }}
      </span>
    </div>
  </div>
</template>
