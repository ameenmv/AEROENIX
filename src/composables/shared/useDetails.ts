import type { UseDetailsOptions, UseDetailsReturn } from '@/types/composables/details'
import { useQuery } from '@tanstack/vue-query'

export function useDetails<T = any>(options: UseDetailsOptions<T>): UseDetailsReturn<T> {
  const route = useRoute()

  const computedId = computed(() => {
    // If autoLoadId is enabled and there's an 'id' param in the route, prioritize it
    if (options.autoLoadId && route?.params?.id) {
      return route.params.id as string
    }
    // Otherwise rely on the explicitly passed `id`
    return unref(options.id)
  })
  const mergedQueryKey = computed(() => {
    if (options.queryKey)
      return options.queryKey
    return [options.resourceName, 'details', computedId.value]
  })
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: mergedQueryKey,
    queryFn: () => {
      if (!computedId.value) {
        return Promise.reject(new Error('No ID provided for useDetails'))
      }
      return options.getFn(computedId.value)
    },
    enabled: computed(() => !!computedId.value),
    retry: 1, // Minimize runaway fetching if 404
  })
  const refresh = async () => {
    await refetch()
  }
  return {
    item: data as import('vue').Ref<T | undefined>,
    loading: isLoading,
    error,
    refresh,
  }
}
