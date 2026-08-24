# SvgImage

A smart image component that **auto-detects SVG URLs** and inlines them into the DOM — giving you full CSS color control. Non-SVG images fall back to a standard `<img>` tag automatically.

## The Problem

When you render an SVG from the backend using `<img src="...svg">`, the browser treats it as a raster image. You **cannot** control its fill/stroke colors via CSS:

```vue
<!-- ❌ Colors CANNOT be changed — it's rendered as an image -->
<img src="https://api.example.com/icons/shield.svg" />
```

## The Solution

`<SvgImage>` fetches the SVG content, inlines it into the DOM, and replaces hardcoded colors with `currentColor` — so it **inherits the parent's text color**:

```vue
<!-- ✅ Colors are controlled via CSS / Tailwind -->
<div class="text-primary">
  <SvgImage src="https://api.example.com/icons/shield.svg" />
</div>
```

## Quick Start

The component is auto-imported — just use it anywhere:

```vue
<template>
  <!-- Basic: inherits parent text color -->
  <SvgImage src="https://api.example.com/icons/guard.svg" />

  <!-- Custom size (default: 24px) -->
  <SvgImage src="/api/icon.svg" :size="32" />

  <!-- Custom color via prop -->
  <SvgImage src="/api/icon.svg" color="#3b82f6" />

  <!-- Tailwind class on parent -->
  <div class="text-emerald-500">
    <SvgImage src="/api/icon.svg" :size="40" />
  </div>
</template>
```

## How It Works

```
┌────────────────────────────────────────────────────────────────┐
│  <SvgImage src="..." />                                       │
│                                                                │
│  Is URL an SVG?  (.svg extension or svg content-type)          │
│  ├─ YES → fetch() → clean → replace colors → inline as HTML   │
│  └─ NO  → render <img src="..."> (standard image)             │
│                                                                │
│  Error?                                                        │
│  ├─ Has `fallback` prop → render fallback <img>                │
│  └─ No fallback → show placeholder icon                       │
└────────────────────────────────────────────────────────────────┘
```

### SVG Processing Pipeline

When an SVG is fetched, it goes through these transformations:

1. **Remove XML declarations** — `<?xml ...?>` is stripped
2. **Remove HTML comments** — `<!-- ... -->` is removed
3. **Strip width/height** — Replaced by the `size` prop
4. **Replace colors** — All `fill` and `stroke` values become `currentColor`
5. **Protect gradients** — Colors inside `<defs>` (gradients, patterns) are preserved

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | **required** | Image URL — can be SVG or any image format |
| `size` | `number \| string` | `24` | Icon dimensions in px (applied to both width & height) |
| `color` | `string` | `undefined` | Override color (hex, rgb, etc). If omitted, uses `currentColor` |
| `alt` | `string` | `''` | Accessible alt text |
| `fallback` | `string` | `undefined` | Fallback image URL if source fails to load |
| `colorize` | `boolean` | `true` | Whether to replace SVG colors with `currentColor` |
| `preserveColors` | `boolean` | `false` | Keep original SVG colors (ignores parent text color) |

## Usage Patterns

### 1. Backend Icons with Theme Colors

The most common use case — icons from the API that should match your theme:

```vue
<script setup lang="ts">
// Assume the API returns items with an `icon_url` field
const items = ref([
  { name: 'Security', icon_url: '/api/v1/icons/shield.svg' },
  { name: 'Users', icon_url: '/api/v1/icons/users.svg' },
  { name: 'Settings', icon_url: '/api/v1/icons/gear.svg' },
])
</script>

<template>
  <div v-for="item in items" :key="item.name" class="flex items-center gap-2">
    <!-- Icon inherits text-foreground from parent -->
    <SvgImage :src="item.icon_url" :size="20" />
    <span>{{ item.name }}</span>
  </div>
</template>
```

### 2. Color Variants of the Same Icon

Show the same SVG in multiple colors — useful for status indicators:

```vue
<template>
  <div class="flex gap-4">
    <!-- Active state -->
    <div class="text-emerald-500">
      <SvgImage src="/api/icons/circle.svg" :size="16" />
    </div>

    <!-- Warning state -->
    <div class="text-amber-500">
      <SvgImage src="/api/icons/circle.svg" :size="16" />
    </div>

    <!-- Error state -->
    <div class="text-red-500">
      <SvgImage src="/api/icons/circle.svg" :size="16" />
    </div>
  </div>
</template>
```

### 3. Direct Color Prop

When you need a specific color without a wrapper element:

```vue
<template>
  <SvgImage src="/api/icon.svg" color="#8b5cf6" :size="32" />
  <SvgImage src="/api/icon.svg" color="hsl(210, 100%, 50%)" :size="32" />
  <SvgImage src="/api/icon.svg" color="var(--primary)" :size="32" />
</template>
```

### 4. Preserving Original Colors

Some SVGs (logos, illustrations) should keep their original colors:

```vue
<template>
  <!-- Keep original colors from the SVG file -->
  <SvgImage
    src="/api/company-logo.svg"
    :size="48"
    :preserve-colors="true"
  />
</template>
```

### 5. Mixed SVG & Raster Images

The component handles both automatically:

```vue
<template>
  <!-- SVG → fetched and inlined (color-controllable) -->
  <SvgImage src="/api/icon.svg" :size="32" />

  <!-- PNG → rendered as <img> (no color control) -->
  <SvgImage src="/api/avatar.png" :size="32" />

  <!-- JPG → rendered as <img> -->
  <SvgImage src="/api/cover.jpg" :size="200" />
</template>
```

### 6. Error Handling & Fallbacks

```vue
<template>
  <!-- With custom fallback image -->
  <SvgImage
    src="/api/maybe-missing.svg"
    fallback="/img/default-icon.png"
    :size="32"
  />

  <!-- Without fallback → shows placeholder icon -->
  <SvgImage src="/definitely-missing.svg" :size="32" />
</template>
```

### 7. In Tables with Dynamic Data

```vue
<template #row="{ row }">
  <TableRow>
    <TableCell>
      <div class="flex items-center gap-2">
        <div class="text-muted-foreground">
          <SvgImage :src="row.icon_url" :size="20" />
        </div>
        {{ row.name }}
      </div>
    </TableCell>
  </TableRow>
</template>
```

## Performance

### Global Cache

All fetched SVGs are cached in memory. If the same URL is used by 10 components, it's only fetched **once**:

```
First <SvgImage src="/icon.svg" />   → fetch() + cache
Second <SvgImage src="/icon.svg" />  → instant (from cache)
Third <SvgImage src="/icon.svg" />   → instant (from cache)
```

The cache key includes the `colorize` and `preserveColors` settings, so different configurations are cached separately.

### Request Deduplication

If multiple components mount simultaneously with the same URL, only **one** network request is made. All components share the same `Promise`.

### Non-SVG Performance

Non-SVG images (`png`, `jpg`, etc.) use a standard `<img>` tag with `loading="lazy"` — no fetch overhead.

## Gradient & Complex SVG Support

SVGs with gradients, patterns, and clip-paths are handled safely:

- Colors inside `<defs>` blocks are **preserved** (gradients need their stop-colors)
- Colors inside `<clipPath>` rects are **preserved** (used for mask boundaries)
- Only colors in the main SVG body are replaced with `currentColor`

```vue
<!-- Gradient SVG — gradients are preserved, body colors become currentColor -->
<SvgImage src="/api/gradient-icon.svg" :size="32" />
```

## States

The component has 4 visual states:

| State | Rendering |
|-------|-----------|
| **Loading** | Shimmer skeleton animation |
| **SVG success** | Inlined SVG with color control |
| **Image success** | Standard `<img>` tag |
| **Error** | Fallback image or placeholder icon |

## Comparison: SvgImage vs img vs Icon Components

| Feature | `<img src="*.svg">` | `<SvgImage>` | Local Icon Components |
|---------|---------------------|--------------|----------------------|
| Color control | ❌ | ✅ | ✅ |
| Backend URLs | ✅ | ✅ | ❌ (local only) |
| Caching | Browser | In-memory + browser | Bundled |
| Bundle size | 0 | ~2KB | Per-icon |
| Non-SVG support | ✅ | ✅ | ❌ |
| Gradient support | ✅ | ✅ (smart) | ✅ |

**Use `<SvgImage>`** when you receive SVG URLs from the backend and need color control.

**Use local icon components** (from `@/components/icons/`) for static icons that ship with the app.

**Use `<img>`** when you don't need color control (photos, illustrations).

## File Location

```
src/components/ui/SvgImage.vue    # Auto-imported, available everywhere
```
