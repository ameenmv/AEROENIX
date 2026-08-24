const pageTitle = ref('')
const pageDescription = ref('')
const pageActions = shallowRef<Component | null>(null)

export interface PageHeaderPayload {
  title: string
  description?: string
  actions?: Component | null
}

export function usePageHeader() {
  const setPageHeader = (payload: PageHeaderPayload) => {
    pageTitle.value = payload.title
    pageDescription.value = payload.description || ''
    pageActions.value = payload.actions || null
  }

  const clearPageHeader = () => {
    pageTitle.value = ''
    pageDescription.value = ''
    pageActions.value = null
  }

  return {
    pageTitle,
    pageDescription,
    pageActions,
    setPageHeader,
    clearPageHeader,
  }
}
