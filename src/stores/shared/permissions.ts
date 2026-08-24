import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePermissionStore = defineStore('permissions', () => {
  const permissions = ref<string[]>(JSON.parse(localStorage.getItem('permissions') || '[]'))
  function setPermissions(newPermissions: string[]) {
    permissions.value = newPermissions
    localStorage.setItem('permissions', JSON.stringify(newPermissions))
  }
  function hasPermission(permission: string) {
    return permissions.value.includes(permission) || permissions.value.includes('*')
  }
  function hasAnyPermission(perms: string[]) {
    return perms.some(p => hasPermission(p))
  }
  function clearPermissions() {
    permissions.value = []
    localStorage.removeItem('permissions')
  }
  return { permissions, setPermissions, hasPermission, hasAnyPermission, clearPermissions }
})
