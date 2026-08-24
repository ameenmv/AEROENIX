import type { DirectiveBinding } from 'vue'
import { usePermissionStore } from '@/stores/permissions'

export const vCan = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const store = usePermissionStore()
    const value = binding.value
    if (!value)
      return
    let hasPerm = false
    if (Array.isArray(value)) {
      hasPerm = store.hasAnyPermission(value)
    }
    else {
      hasPerm = store.hasPermission(value)
    }
    if (!hasPerm) {
      el.style.display = 'none'
      // Optional: completely remove from DOM for better security
      // el.parentNode?.removeChild(el)
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const store = usePermissionStore()
    const value = binding.value
    if (!value)
      return
    let hasPerm = false
    if (Array.isArray(value)) {
      hasPerm = store.hasAnyPermission(value)
    }
    else {
      hasPerm = store.hasPermission(value)
    }
    if (!hasPerm) {
      el.style.display = 'none'
    }
    else {
      el.style.display = '' // Revert to original display
    }
  },
}
