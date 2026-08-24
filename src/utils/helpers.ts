export function getStatusVariant(status: any): 'default' | 'destructive' | 'secondary' | 'outline' | 'success' | 'warning' | 'info' {
  if (!status)
    return 'secondary'

  // Color-first approach — the API color is the best cross-resource signal.
  // Different resources reuse the same integer values with different meanings
  // (e.g. value 4 = "Invited" in admins, "Cancelled" in subscriptions),
  // so value alone can't be a reliable global discriminator.
  const color = status.color
  if (color) {
    // Direct variant names from the API
    if (['default', 'destructive', 'secondary', 'outline', 'success', 'warning', 'info'].includes(color))
      return color as any
    if (color === 'green')
      return 'success'
    if (color === 'danger' || color === 'red')
      return 'destructive'
    if (color === 'blue')
      return 'info'
    if (color === 'gray')
      return 'secondary'

    // "yellow" is ambiguous — the API sends it for both Cancelled and Pending.
    // Disambiguate using the label text.
    if (color === 'yellow' || color === 'orange') {
      const label = (status.label || status.badge || '').toLowerCase()
      if (label.includes('cancel'))
        return 'destructive'
      return 'warning'
    }
  }

  // Fallback: value-based mapping when no color is provided
  const value = typeof status === 'number' ? status : status.value
  if (value !== undefined) {
    if (value === 1)
      return 'success'
    if (value === 2)
      return 'info'
    if (value === 3)
      return 'destructive'
    if (value === 5)
      return 'secondary'
  }

  return 'default'
}

export function getDisplayName(entity: any): string {
  if (!entity)
    return '—'
  if (typeof entity.display_name === 'string' && entity.display_name) {
    return entity.display_name
  }
  return entity.name || '—'
}

export function getRoleNames(admin: any): string {
  if (!admin)
    return '—'
  if (admin.role_name)
    return admin.role_name
  const roles = admin.roles?.length ? admin.roles : (admin.role ? [admin.role] : [])
  if (roles.length > 0) {
    return roles.map((r: any) => getDisplayName(r)).join(', ')
  }
  return '—'
}

export function formatPrice(price?: string | number, locale = 'en-US', currency = 'SAR') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(price) || 0)
}
