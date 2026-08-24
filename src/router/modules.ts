import type { RouteRecordRaw } from 'vue-router'

export interface ModuleConfig {
  name: string
  path: string
  icon?: any
  order?: number
  permissionKey?: string
  routes: RouteRecordRaw[]
}
const modules: Record<string, ModuleConfig> = {}
export function registerModule(config: ModuleConfig) {
  if (config.permissionKey) {
    config.routes.forEach((route) => {
      route.meta = route.meta || {}
      if (!route.meta.permission) {
        route.meta.permission = `${config.permissionKey}.view`
      }
    })
  }
  modules[config.name] = config
}
export function getModules() {
  return Object.values(modules).sort((a, b) => (a.order || 99) - (b.order || 99))
}
export function getModuleRoutes() {
  return getModules().flatMap(m => m.routes)
}
