// ── Types ─────────────────────────────────────────────────────────────────
export interface ContextMenuAction {
  label: string
  icon?: object | string
  onClick?: (row?: Record<string, unknown>) => void | Promise<any>
  variant?: 'default' | 'delete'
  separator?: boolean
}

// ── Singleton state (shared across the whole app) ─────────────────────────
const state = ref<{
  show: boolean
  x: number
  y: number
  actions: ContextMenuAction[]
}>({ show: false, x: 0, y: 0, actions: [] })

let justOpened = false

// ── Core functions ────────────────────────────────────────────────────────
function openContextMenu(event: MouseEvent, actions: ContextMenuAction[]) {
  if (!actions.length)
    return
  event.preventDefault()
  event.stopPropagation()

  const vp = { w: window.innerWidth, h: window.innerHeight }
  const menuW = 200
  const menuH = actions.length * 44 + 16

  justOpened = true
  state.value = {
    show: true,
    x: Math.min(event.clientX, vp.w - menuW - 8),
    y: Math.min(event.clientY, vp.h - menuH - 8),
    actions,
  }
  requestAnimationFrame(() => {
    justOpened = false
  })
}

function closeContextMenu() {
  state.value.show = false
}

// ── Composable ────────────────────────────────────────────────────────────
export function useContextMenu() {
  return {
    /** Reactive state — consumed by ContextMenuPortal */
    ctxMenuState: state,

    /** Open the floating menu at the cursor position */
    openContextMenu,

    /** Close the floating menu */
    closeContextMenu,
  }
}

// ── Portal setup — call once inside ContextMenuPortal ────────────────────
export function useContextMenuPortal() {
  function onWindowClick() {
    if (state.value.show)
      closeContextMenu()
  }

  function onWindowContextMenu() {
    if (justOpened)
      return
    if (state.value.show)
      closeContextMenu()
  }

  function onWindowKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape')
      closeContextMenu()
  }

  onMounted(() => {
    window.addEventListener('click', onWindowClick)
    window.addEventListener('contextmenu', onWindowContextMenu)
    window.addEventListener('keydown', onWindowKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('click', onWindowClick)
    window.removeEventListener('contextmenu', onWindowContextMenu)
    window.removeEventListener('keydown', onWindowKeydown)
  })

  return { ctxMenuState: state, closeContextMenu }
}
