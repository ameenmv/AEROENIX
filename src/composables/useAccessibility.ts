import { reactive, watch } from 'vue'

const STORAGE_KEY = 'a11y-preferences'

export interface A11yPreferences {
  zoomLevel: number
  fontScale: number
  grayscale: boolean
  highContrast: boolean
  underlineLinks: boolean
  bigCursor: boolean
  readingGuide: boolean
  barVisible: boolean
}

const defaults: A11yPreferences = {
  zoomLevel: 100,
  fontScale: 100,
  grayscale: false,
  highContrast: false,
  underlineLinks: false,
  bigCursor: false,
  readingGuide: false,
  barVisible: false,
}

const ZOOM_STEPS = [50, 60, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 140, 150, 175, 200]
const FONT_STEPS = [50, 60, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 140, 150, 175, 200]

// Shared reactive state (singleton) — survives across component instances
const prefs = reactive<A11yPreferences>({ ...defaults })
let _initialized = false
let _guideHandler: ((e: MouseEvent) => void) | null = null

function loadPrefs(): A11yPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored)
      return { ...defaults, ...JSON.parse(stored) }
  }
  catch {
    // ignore
  }
  return { ...defaults }
}

function savePrefs(p: A11yPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  }
  catch {
    // ignore
  }
}

function applyToDOM(p: A11yPreferences) {
  const html = document.documentElement
  const body = document.body

  // Zoom — use CSS zoom (Chrome/Safari/Edge) with transform fallback (Firefox)
  const supportsZoom = CSS.supports('zoom', '1')
  if (supportsZoom) {
    html.style.setProperty('zoom', `${p.zoomLevel / 100}`)
    html.style.removeProperty('transform')
    html.style.removeProperty('transform-origin')
  }
  else {
    html.style.removeProperty('zoom')
    html.style.transform = `scale(${p.zoomLevel / 100})`
    html.style.transformOrigin = 'top left'
  }

  // Font scale — set on html so all rem-based sizing responds
  html.style.fontSize = `${p.fontScale}%`

  // Toggle CSS classes on body
  toggleClass(body, 'a11y-grayscale', p.grayscale)
  toggleClass(body, 'a11y-high-contrast', p.highContrast)
  toggleClass(body, 'a11y-underline-links', p.underlineLinks)
  toggleClass(body, 'a11y-big-cursor', p.bigCursor)
  toggleClass(body, 'a11y-reading-guide', p.readingGuide)

  // Reading guide mouse tracker
  if (p.readingGuide) {
    if (!_guideHandler) {
      _guideHandler = (e: MouseEvent) => {
        html.style.setProperty('--a11y-guide-y', `${e.clientY}px`)
      }
      window.addEventListener('mousemove', _guideHandler, { passive: true })
    }
  }
  else if (_guideHandler) {
    window.removeEventListener('mousemove', _guideHandler)
    _guideHandler = null
  }
}

function toggleClass(el: HTMLElement, className: string, add: boolean) {
  el.classList.toggle(className, add)
}

export function useAccessibility() {
  // Initialize once — load saved prefs and start watching
  if (!_initialized) {
    _initialized = true
    Object.assign(prefs, loadPrefs())

    // Apply immediately if DOM is ready, otherwise wait
    if (document.readyState !== 'loading') {
      applyToDOM(prefs)
    }
    else {
      document.addEventListener('DOMContentLoaded', () => applyToDOM(prefs), { once: true })
    }

    // Reactively apply on every change
    watch(prefs, (newPrefs) => {
      savePrefs(newPrefs)
      applyToDOM(newPrefs)
    }, { deep: true })
  }

  // --- Actions ---
  function zoomIn() {
    const idx = ZOOM_STEPS.indexOf(prefs.zoomLevel)
    if (idx >= 0 && idx < ZOOM_STEPS.length - 1) {
      prefs.zoomLevel = ZOOM_STEPS[idx + 1]!
    }
    else if (idx === -1) {
      const next = ZOOM_STEPS.find(s => s > prefs.zoomLevel)
      if (next)
        prefs.zoomLevel = next
    }
  }

  function zoomOut() {
    const idx = ZOOM_STEPS.indexOf(prefs.zoomLevel)
    if (idx > 0) {
      prefs.zoomLevel = ZOOM_STEPS[idx - 1]!
    }
    else if (idx === -1) {
      const prev = [...ZOOM_STEPS].reverse().find(s => s < prefs.zoomLevel)
      if (prev)
        prefs.zoomLevel = prev
    }
  }

  function fontIncrease() {
    const idx = FONT_STEPS.indexOf(prefs.fontScale)
    if (idx >= 0 && idx < FONT_STEPS.length - 1) {
      prefs.fontScale = FONT_STEPS[idx + 1]!
    }
    else if (idx === -1) {
      const next = FONT_STEPS.find(s => s > prefs.fontScale)
      if (next)
        prefs.fontScale = next
    }
  }

  function fontDecrease() {
    const idx = FONT_STEPS.indexOf(prefs.fontScale)
    if (idx > 0) {
      prefs.fontScale = FONT_STEPS[idx - 1]!
    }
    else if (idx === -1) {
      const prev = [...FONT_STEPS].reverse().find(s => s < prefs.fontScale)
      if (prev)
        prefs.fontScale = prev
    }
  }

  function toggleGrayscale() {
    prefs.grayscale = !prefs.grayscale
  }

  function toggleHighContrast() {
    prefs.highContrast = !prefs.highContrast
  }

  function toggleUnderlineLinks() {
    prefs.underlineLinks = !prefs.underlineLinks
  }

  function toggleBigCursor() {
    prefs.bigCursor = !prefs.bigCursor
  }

  function toggleReadingGuide() {
    prefs.readingGuide = !prefs.readingGuide
  }

  function toggleBar() {
    prefs.barVisible = !prefs.barVisible
  }

  function resetAll() {
    Object.assign(prefs, { ...defaults, barVisible: prefs.barVisible })
  }

  return {
    prefs,
    zoomIn,
    zoomOut,
    fontIncrease,
    fontDecrease,
    toggleGrayscale,
    toggleHighContrast,
    toggleUnderlineLinks,
    toggleBigCursor,
    toggleReadingGuide,
    toggleBar,
    resetAll,
    ZOOM_STEPS,
    FONT_STEPS,
  }
}
