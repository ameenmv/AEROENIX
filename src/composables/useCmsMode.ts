/**
 * CMS Mode Composable
 *
 * Controls whether the CMS Builder shows developer tools (schema editing, keys, delete)
 * or client-safe content editing only.
 *
 * - Default mode is read from `VITE_CMS_MODE` env ('developer' | 'client')
 * - Toggle at runtime with keyboard shortcut: Ctrl+Shift+D
 * - State persists in sessionStorage within the browser session
 * - Shows a toast notification when toggled
 */
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

type CmsMode = 'developer' | 'client'

const STORAGE_KEY = 'cms-dev-mode'

// ── Resolve initial mode ──────────────────────────────────────────────────────
function getInitialMode(): CmsMode {
  // SessionStorage override (from keyboard toggle)
  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (stored === 'developer' || stored === 'client')
    return stored

  // Env variable
  const env = import.meta.env.VITE_CMS_MODE as string | undefined
  if (env === 'developer')
    return 'developer'

  // Default: client (safe mode)
  return 'client'
}

// ── Shared singleton state ────────────────────────────────────────────────────
const cmsMode = ref<CmsMode>(getInitialMode())
let shortcutRegistered = false

export function useCmsMode() {
  /** Whether the current mode is developer (full schema access) */
  const isDevMode = computed(() => cmsMode.value === 'developer')

  /** Whether the current mode is client (content editing only) */
  const isClientMode = computed(() => cmsMode.value === 'client')

  /** Toggle between developer and client mode */
  function toggleMode() {
    cmsMode.value = cmsMode.value === 'developer' ? 'client' : 'developer'
    sessionStorage.setItem(STORAGE_KEY, cmsMode.value)
    toast.info(
      cmsMode.value === 'developer' ? '🔧 Developer mode enabled' : '👤 Client mode enabled',
      { description: 'Press Ctrl+Shift+D to toggle' },
    )
  }

  /** Register Ctrl+Shift+D keyboard shortcut (call once, idempotent) */
  function registerShortcut() {
    if (shortcutRegistered)
      return

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        toggleMode()
      }
    })
    shortcutRegistered = true
  }

  return {
    cmsMode,
    isDevMode,
    isClientMode,
    toggleMode,
    registerShortcut,
  }
}
