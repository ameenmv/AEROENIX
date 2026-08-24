import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

export type SonarType = 'success' | 'error' | 'warning' | 'info'
export interface SonarMessage {
  id: string
  type: SonarType
  title: string
  message: string
  duration?: number
  closable?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}
export const useSonarStore = defineStore('sonar', () => {
  const sonars = ref<SonarMessage[]>([])
  const toastIdMap = ref<Map<string, string | number>>(new Map())
  const removeSonar = (id: string) => {
    const index = sonars.value.findIndex(s => s.id === id)
    if (index !== -1) {
      sonars.value.splice(index, 1)
    }
    const toastId = toastIdMap.value.get(id)
    if (toastId) {
      toast.dismiss(toastId)
      toastIdMap.value.delete(id)
    }
  }
  const addSonar = (sonar: Omit<SonarMessage, 'id'>) => {
    const id = `sonar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newSonar = {
      id,
      closable: true,
      ...sonar,
      duration: sonar.duration ?? 2500,
    }
    sonars.value.push(newSonar)
    const toastFn
      = {
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
      }[newSonar.type] || toast
    const toastId = toastFn(newSonar.title, {
      description: newSonar.message,
      duration: newSonar.duration,
      action: newSonar.action
        ? {
            label: newSonar.action.label,
            onClick: newSonar.action.onClick,
          }
        : undefined,
      onDismiss: () => {
        removeSonar(id)
      },
      onAutoClose: () => {
        removeSonar(id)
      },
    })
    toastIdMap.value.set(id, toastId)
    return id
  }
  const clearSonars = () => {
    toast.dismiss()
    sonars.value = []
    toastIdMap.value.clear()
  }
  const success = (title: string, message: string, duration?: number) => {
    return addSonar({ type: 'success', title, message, duration })
  }
  const error = (title: string, message: string, duration?: number) => {
    return addSonar({ type: 'error', title, message, duration })
  }
  const warning = (title: string, message: string, duration?: number) => {
    return addSonar({ type: 'warning', title, message, duration })
  }
  const info = (title: string, message: string, duration?: number) => {
    return addSonar({ type: 'info', title, message, duration })
  }
  return {
    sonars,
    addSonar,
    removeSonar,
    clearSonars,
    success,
    error,
    warning,
    info,
  }
})
