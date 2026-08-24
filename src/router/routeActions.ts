import type { RouteLocationRaw } from 'vue-router'

export type ActionType = 'create' | 'edit' | 'show' | 'list'
export type OpenMode = 'modal' | 'page'
export interface RouteActionParams {
  /** The base route name of the resource (e.g., 'admin-products') */
  resource: string
  /** The action to perform */
  action: ActionType
  /** Whether to open in a modal (using query params) or a separate page */
  openMode?: OpenMode
  /** The ID of the resource (required for edit and show actions) */
  id?: string | number
}
/**
 * Resolves the Vue Router location for a resource action.
 * Allows opening forms/details either as a modal (via query params) or a full page.
 *
 * @example
 * // Returns { name: 'admin-products-create' }
 * getRouteAction({ resource: 'admin-products', action: 'create', openMode: 'page' })
 *
 * @example
 * // Returns { name: 'admin-products', query: { action: 'edit', id: '123' } }
 * getRouteAction({ resource: 'admin-products', action: 'edit', openMode: 'modal', id: 123 })
 *
 *
 * @param {RouteActionParams} params - The configuration for the route action
 * @param {string} params.resource - The base route name of the resource
 * @param {ActionType} params.action - The action to perform
 * @param {OpenMode} [params.openMode] - Whether to open in a modal or a separate page
 * @param {string|number} [params.id] - The ID of the resource
 * @returns {RouteLocationRaw} The Vue Router location object
 */
export function getRouteAction({
  resource,
  action,
  openMode = 'modal',
  id,
}: RouteActionParams): RouteLocationRaw {
  if (action === 'list') {
    return { name: resource }
  }
  const queryAction = action === 'show' ? 'view' : action
  if (openMode === 'page') {
    if (action === 'create') {
      return { name: `${resource}-create` }
    }
    if (action === 'edit' && id !== undefined) {
      return { name: `${resource}-edit`, params: { id: String(id) } }
    }
    if (action === 'show' && id !== undefined) {
      return { name: `${resource}-show`, params: { id: String(id) } }
    }
    // Fallback if ID is missing for edit/show
    console.warn(
      `[getRouteAction] ID is required for action '${action}' when openMode is 'page'. Falling back to list.`,
    )
    return { name: resource }
  }
  // openMode === 'modal'
  return {
    name: resource,
    query: {
      action: queryAction,
      ...(id !== undefined ? { id: String(id) } : {}),
    },
  }
}
