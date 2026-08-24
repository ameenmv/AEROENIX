import { ref } from 'vue'

export interface ColumnConfig {
  key: string
  label: string
  visible?: boolean
}

/** Alias used by ColumnToggle.vue */
export type ColumnDef = ColumnConfig

/**
 * Column visibility composable for DataTable column toggling.
 *
 * Stores visibility preferences in localStorage under the given storageKey.
 * Returns reactive columns array and toggle function.
 */
export function useColumnVisibility(storageKey: string, defaultColumns: ColumnConfig[]) {
  // Load saved state from localStorage
  const saved = localStorage.getItem(storageKey)
  const savedState: Record<string, boolean> = saved ? JSON.parse(saved) : {}

  const columns = ref(
    defaultColumns.map(col => ({
      ...col,
      visible: savedState[col.key] !== undefined ? savedState[col.key] : (col.visible !== false),
    })),
  )

  function toggle(key: string) {
    const col = columns.value.find(c => c.key === key)
    if (col) {
      col.visible = !col.visible
      // Persist state
      const state: Record<string, boolean> = {}
      columns.value.forEach((c) => {
        state[c.key] = c.visible ?? true
      })
      localStorage.setItem(storageKey, JSON.stringify(state))
    }
  }

  function isVisible(key: string): boolean {
    const col = columns.value.find(c => c.key === key)
    return col?.visible !== false
  }

  return {
    columns,
    toggle,
    isVisible,
  }
}
