import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePermissionStore = defineStore('permissions', () => {
  const permissions = ref<string[]>(JSON.parse(localStorage.getItem('permissions') || '["*"]'))

  function setPermissions(newPermissions: string[]) {
    const perms = newPermissions && newPermissions.length > 0 ? newPermissions : ['*']
    permissions.value = perms
    localStorage.setItem('permissions', JSON.stringify(perms))
  }

  function hasPermission(permission: string) {
    return permissions.value.includes(permission) || permissions.value.includes('*')
  }

  function hasAnyPermission(perms: string[]) {
    return perms.some(p => hasPermission(p))
  }

  function clearPermissions() {
    permissions.value = ['*']
    localStorage.removeItem('permissions')
  }

  return { permissions, setPermissions, hasPermission, hasAnyPermission, clearPermissions }
})
