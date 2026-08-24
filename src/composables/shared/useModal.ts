import type { UseModalOptions } from '@/types/composables/modal'

export function useModal<T = unknown>(options: UseModalOptions<T> = {}) {
  const { onCreate, onEdit, onFetchOne, getFormData, clearErrors } = options
  const showCreate = ref(false)
  const showEdit = ref(false)
  const showView = ref(false)
  const selectedId = ref<number | string | null>(null)
  const createFormData = ref<Record<string, unknown>>({})
  const editFormData = ref<Record<string, unknown>>({})
  const openCreate = () => {
    createFormData.value = {}
    clearErrors?.()
    showCreate.value = true
  }
  const closeCreate = () => {
    showCreate.value = false
    createFormData.value = {}
  }
  const openEdit = async (id: number | string) => {
    selectedId.value = id
    clearErrors?.()
    if (onFetchOne) {
      await onFetchOne(id)
      if (getFormData) {
        editFormData.value = { ...getFormData() }
      }
    }
    showEdit.value = true
  }
  const closeEdit = () => {
    showEdit.value = false
    editFormData.value = {}
    selectedId.value = null
  }
  const openView = async (id: number | string) => {
    selectedId.value = id
    if (onFetchOne) {
      await onFetchOne(id)
    }
    showView.value = true
  }
  const closeView = () => {
    showView.value = false
    selectedId.value = null
  }
  const handleCreate = async (): Promise<boolean> => {
    if (!onCreate)
      return false
    const result = await onCreate(createFormData.value as Partial<T>)
    if (result.success) {
      closeCreate()
      return true
    }
    return false
  }
  const handleEdit = async (): Promise<boolean> => {
    if (!onEdit || !selectedId.value)
      return false
    const result = await onEdit(selectedId.value, editFormData.value as Partial<T>)
    if (result.success) {
      closeEdit()
      return true
    }
    return false
  }
  return {
    showCreate,
    showEdit,
    showView,
    selectedId,
    createFormData,
    editFormData,
    openCreate,
    openEdit,
    openView,
    closeCreate,
    closeEdit,
    closeView,
    handleCreate,
    handleEdit,
  }
}
