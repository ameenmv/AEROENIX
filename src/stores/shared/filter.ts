import type { ActiveFilters, FilterConfig } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useFilterStore = defineStore('filter', () => {
  const activeFilters = ref<Record<string, ActiveFilters>>({})
  const filterConfigs = ref<Record<string, FilterConfig>>({})
  const isOpen = ref<Record<string, boolean>>({})
  const hasActiveFilters = computed(() => {
    return (resource: string) => {
      const filters = activeFilters.value[resource]
      return filters && Object.keys(filters).length > 0
    }
  })
  const getActiveFilters = (resource: string) => {
    return activeFilters.value[resource] || {}
  }
  const setActiveFilter = (resource: string, key: string, value: any) => {
    if (!activeFilters.value[resource]) {
      activeFilters.value[resource] = {}
    }
    if (value === null || value === undefined || value === '') {
      delete activeFilters.value[resource][key]
    }
    else {
      activeFilters.value[resource][key] = value
    }
  }
  const setActiveFilters = (resource: string, filters: ActiveFilters) => {
    activeFilters.value[resource] = { ...filters }
  }
  const clearFilters = (resource: string) => {
    activeFilters.value[resource] = {}
  }
  const clearFilter = (resource: string, key: string) => {
    if (activeFilters.value[resource]) {
      delete activeFilters.value[resource][key]
    }
  }
  const setFilterConfig = (resource: string, config: FilterConfig) => {
    filterConfigs.value[resource] = config
  }
  const getFilterConfig = (resource: string) => {
    return filterConfigs.value[resource]
  }
  const openFilter = (resource: string) => {
    isOpen.value[resource] = true
  }
  const closeFilter = (resource: string) => {
    isOpen.value[resource] = false
  }
  const isFilterOpen = (resource: string) => {
    return isOpen.value[resource] || false
  }
  const getActiveFilterCount = (resource: string) => {
    return Object.keys(activeFilters.value[resource] || {}).length
  }
  return {
    activeFilters,
    filterConfigs,
    isOpen,
    hasActiveFilters,
    getActiveFilters,
    setActiveFilter,
    setActiveFilters,
    clearFilters,
    clearFilter,
    setFilterConfig,
    getFilterConfig,
    openFilter,
    closeFilter,
    isFilterOpen,
    getActiveFilterCount,
  }
})
