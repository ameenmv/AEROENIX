<script setup lang="ts">
/**
 * SvgImage — Smart SVG/Image component with color control.
 *
 * When the source URL is an SVG, it fetches and inlines the SVG content
 * directly into the DOM, allowing you to control fill/stroke colors via
 * CSS `currentColor` or the `color` prop. For non-SVG images, it falls
 * back to a standard `<img>` tag.
 *
 * Features:
 *   - Auto-detects SVG vs raster images (by URL extension or content-type)
 *   - Inlines SVG content for full CSS color control
 *   - Replaces hardcoded fill/stroke colors with `currentColor`
 *   - Global in-memory cache to avoid duplicate network requests
 *   - Loading skeleton & error fallback states
 *   - Supports all Tailwind classes via `class` attribute
 *
 * Usage:
 *   <!-- Basic usage with backend SVG URL -->
 *   <SvgImage src="https://api.example.com/icons/guard.svg" />
 *
 *   <!-- With color control (only works for SVGs) -->
 *   <SvgImage src="/api/icon.svg" color="#3b82f6" />
 *
 *   <!-- With size control -->
 *   <SvgImage src="/api/icon.svg" :size="32" />
 *
 *   <!-- Inherits text color from parent (Tailwind) -->
 *   <div class="text-primary">
 *     <SvgImage src="/api/icon.svg" />  <!-- will be primary color -->
 *   </div>
 *
 *   <!-- Non-SVG images work too (falls back to <img>) -->
 *   <SvgImage src="/api/photo.png" :size="64" />
 *
 *   <!-- With loading/error fallback -->
 *   <SvgImage src="/api/icon.svg" fallback="/img/default.png" />
 */

import { computed, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  /** The image URL — can be SVG or any image format */
  src: string
  /** Icon size in pixels (width & height). Pass string for custom units */
  size?: number | string
  /** Override color for SVG fill/stroke. Uses `currentColor` by default (inherits from CSS) */
  color?: string
  /** Fallback image URL if the source fails to load */
  fallback?: string
  /** Alt text for accessibility */
  alt?: string
  /** Whether to replace hardcoded colors with currentColor (SVGs only). Default: true */
  colorize?: boolean
  /** If true, preserves the original SVG colors and only uses `color` for the style wrapper */
  preserveColors?: boolean
}>(), {
  size: 24,
  color: undefined,
  fallback: undefined,
  alt: '',
  colorize: true,
  preserveColors: false,
})

// ── State ─────────────────────────────────────────────────────────

const svgContent = ref<string | null>(null)
const isLoading = ref(true)
const hasError = ref(false)
const isSvg = ref(false)

// ── Global SVG Cache ──────────────────────────────────────────────
// Shared across all SvgImage instances for maximum performance.
// Caches both the raw SVG string and the colorized version.
const svgCache = new Map<string, Promise<string>>()

// ── Computed ──────────────────────────────────────────────────────

const sizeStyle = computed(() => {
  const s = typeof props.size === 'number' ? `${props.size}px` : props.size
  return { width: s, height: s }
})

const colorStyle = computed(() => {
  if (props.color)
    return { color: props.color }
  return {}
})

const wrapperStyle = computed(() => ({
  ...sizeStyle.value,
  ...colorStyle.value,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

// ── SVG Detection ─────────────────────────────────────────────────

function isSvgUrl(url: string): boolean {
  if (!url)
    return false
  // Check extension
  const cleanUrl = url.split('?')[0]?.split('#')[0] ?? ''
  if (cleanUrl.toLowerCase().endsWith('.svg'))
    return true
  // Check for common SVG URL patterns
  if (url.includes('image/svg') || url.includes('svg+xml'))
    return true
  return false
}

// ── SVG Cleaning ──────────────────────────────────────────────────

// Static regex patterns (module-scope to avoid re-compilation)
const RE_XML_DECL = /<?xml[^?]*?>\s*/gi
const RE_COMMENTS = /<!--[\s\S]*?-->/g
const RE_WIDTH_ATTR = /\s+width=["'][^"']*["']/i
const RE_HEIGHT_ATTR = /\s+height=["'][^"']*["']/i
const RE_SVG_OPEN = /<svg/
const RE_DEFS = /(<defs>[\s\S]*?<\/defs>)/i
const RE_FILL = /fill=["'](?!none["']|url)[^"']*["']/gi
const RE_STROKE = /stroke=["'](?!none["']|url)[^"']*["']/gi

function cleanAndColorizeSvg(raw: string): string {
  let svg = raw.trim()

  // Remove XML declaration
  svg = svg.replace(RE_XML_DECL, '')
  // Remove comments
  svg = svg.replace(RE_COMMENTS, '')

  // Strip width/height from <svg> tag (we control size via the wrapper)
  svg = svg.replace(RE_WIDTH_ATTR, (match, offset) => {
    // Only strip from the opening <svg> tag
    const before = svg.slice(0, offset)
    return before.lastIndexOf('<svg') > before.lastIndexOf('>') ? '' : match
  })
  svg = svg.replace(RE_HEIGHT_ATTR, (match, offset) => {
    const before = svg.slice(0, offset)
    return before.lastIndexOf('<svg') > before.lastIndexOf('>') ? '' : match
  })

  // Make SVG fill the container
  if (!svg.includes('width=') && !svg.includes('height=')) {
    svg = svg.replace(RE_SVG_OPEN, '<svg width="100%" height="100%"')
  }

  if (props.colorize && !props.preserveColors) {
    // Protect <defs> content (gradients, patterns, clip-paths)
    const defsMatch = svg.match(RE_DEFS)
    const defsBlock = defsMatch?.[1] ?? ''
    let body = defsBlock ? svg.replace(defsBlock, '___DEFS___') : svg

    // Replace fill colors (not none, not url())
    body = body.replace(RE_FILL, 'fill="currentColor"')
    // Replace stroke colors (not none, not url())
    body = body.replace(RE_STROKE, 'stroke="currentColor"')

    svg = defsBlock ? body.replace('___DEFS___', defsBlock) : body
  }

  return svg
}

// ── Fetch & Process ───────────────────────────────────────────────

async function fetchSvg(url: string): Promise<string> {
  // Check cache first
  const cacheKey = `${url}:${props.colorize}:${props.preserveColors}`
  const cached = svgCache.get(cacheKey)
  if (cached)
    return cached

  // Fetch and cache the promise (deduplicates concurrent requests)
  const fetchPromise = (async () => {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.status}`)
    }

    const contentType = response.headers.get('content-type') ?? ''
    const text = await response.text()

    // Verify it's actually SVG content
    if (!contentType.includes('svg') && !text.trim().startsWith('<svg') && !text.includes('xmlns="http://www.w3.org/2000/svg"')) {
      throw new Error('Response is not SVG content')
    }

    return cleanAndColorizeSvg(text)
  })()

  svgCache.set(cacheKey, fetchPromise)

  try {
    return await fetchPromise
  }
  catch (err) {
    // Remove failed entries from cache so they can be retried
    svgCache.delete(cacheKey)
    throw err
  }
}

async function loadImage(url: string) {
  if (!url) {
    hasError.value = true
    isLoading.value = false
    return
  }

  isLoading.value = true
  hasError.value = false
  svgContent.value = null

  if (isSvgUrl(url)) {
    isSvg.value = true
    try {
      svgContent.value = await fetchSvg(url)
    }
    catch {
      hasError.value = true
      // Fall back to <img> rendering if SVG fetch fails
      isSvg.value = false
    }
  }
  else {
    isSvg.value = false
  }

  isLoading.value = false
}

// ── Lifecycle ─────────────────────────────────────────────────────

onMounted(() => loadImage(props.src))
watch(() => props.src, newSrc => loadImage(newSrc))
watch(() => [props.colorize, props.preserveColors], () => {
  if (isSvg.value && props.src) {
    // Re-process with new color settings (cache key includes these)
    loadImage(props.src)
  }
})
</script>

<template>
  <!-- Loading state -->
  <span
    v-if="isLoading"
    class="svg-image svg-image--loading"
    :style="wrapperStyle"
    role="img"
    :aria-label="alt || 'Loading image'"
  >
    <span class="svg-image__skeleton" />
  </span>

  <!-- Inline SVG (colorizable) -->
  <span
    v-else-if="isSvg && svgContent"
    class="svg-image svg-image--svg"
    :style="wrapperStyle"
    role="img"
    :aria-label="alt"
    v-html="svgContent"
  />

  <!-- Raster image fallback -->
  <img
    v-else-if="!hasError"
    class="svg-image svg-image--img"
    :src="src"
    :alt="alt"
    :style="sizeStyle"
    loading="lazy"
    @error="hasError = true"
  >

  <!-- Error fallback -->
  <img
    v-else-if="fallback"
    class="svg-image svg-image--fallback"
    :src="fallback"
    :alt="alt"
    :style="sizeStyle"
    loading="lazy"
  >

  <!-- Final error state (no fallback) -->
  <span
    v-else
    class="svg-image svg-image--error"
    :style="wrapperStyle"
    role="img"
    :aria-label="alt || 'Image failed to load'"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  </span>
</template>

<style scoped>
.svg-image {
  flex-shrink: 0;
  line-height: 0;
}

.svg-image--svg :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.svg-image--img {
  object-fit: contain;
  display: block;
}

.svg-image--loading {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.svg-image__skeleton {
  position: absolute;
  inset: 0;
  background: var(--muted, hsl(0 0% 20%));
  border-radius: 4px;
  animation: svg-image-shimmer 1.5s ease-in-out infinite;
}

.svg-image--error {
  opacity: 0.3;
}

@keyframes svg-image-shimmer {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
</style>
