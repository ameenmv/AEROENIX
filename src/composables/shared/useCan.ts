export function useCan() {
  const store = usePermissionStore()
  function can(permission: string): boolean {
    return store.hasPermission(permission)
  }
  function canAny(permissions: string[]): boolean {
    return store.hasAnyPermission(permissions)
  }
  function canAll(permissions: string[]): boolean {
    return permissions.every(p => store.hasPermission(p))
  }
  function canResource(resourceKey: string, action: 'view' | 'manage' | 'delete'): boolean {
    return store.hasPermission(`${resourceKey}.${action}`)
  }
  return { can, canAny, canAll, canResource }
}
