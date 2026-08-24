import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DashboardPOV = 'super_admin' | 'provider'
export const useDashboardStore = defineStore('dashboard', () => {
  const currentPOV = ref<DashboardPOV>('super_admin')
  function setPOV(pov: DashboardPOV) {
    currentPOV.value = pov
  }
  function togglePOV() {
    currentPOV.value = currentPOV.value === 'super_admin' ? 'provider' : 'super_admin'
  }
  return {
    currentPOV,
    setPOV,
    togglePOV,
  }
})
