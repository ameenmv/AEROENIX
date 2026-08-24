# Dark Mode & Theming

The framework supports dark and light modes using CSS custom properties and a `useDarkMode` composable.

## useDarkMode Composable

```ts
import { useDarkMode } from '@/composables/useDarkMode'

const { isDark, toggleDarkMode, currentTheme } = useDarkMode()

// Toggle
toggleDarkMode()

// Check
if (isDark.value) {
  console.log('Dark mode is active')
}
```

### How It Works

- Uses **VueUse's `useDark`** under the hood
- Adds `data-theme="dark"` and class `dark` to `<html>`
- Persists preference in `localStorage` key `theme-preference`
- Toggles CSS variables between dark and light sets

## CSS Variables

All colors and theming use CSS custom properties defined in `src/style.css`:

### Dark Mode (Default)

::: important
**Dark mode is the default.** The `:root` selector applies dark values, and the `.light` class overrides them. To change the default to light mode, swap the variable assignments in `src/style.css`.
:::

```css
:root {
  /* Default Light Mode */
  --background: #f8f9fa;
  --foreground: #1e2025;
  --card: #ffffff;
  --card-foreground: #1e2025;
  --primary: #fc034c;
  --primary-foreground: #ffffff;
  --muted: rgba(0, 0, 0, 0.05);
  --muted-foreground: #67748e;
  --border: rgba(0, 0, 0, 0.05);
  
  /* Custom Semantic Colors */
  --success: #fc034c; /* Adjust as needed */
  --warning: #ffcc00;
  --info: #17c1e8;
}
```

### Dark Mode

```css
.dark {
  --background: #161616;
  --foreground: #ffffff;
  --card: #1e2025;
  --card-foreground: #ffffff;
  --primary: #fc034c;
  --primary-foreground: #ffffff;
  --muted: rgba(238, 238, 238, 0.1);
  --muted-foreground: #a7a7a7;
  --border: rgba(238, 238, 238, 0.1);
  
  /* Custom Semantic Colors */
  --success: #fc034c;
  --warning: #ffcc00;
  --info: #17c1e8;
}
```

## The `<Logo />` Component

When rendering the application's logo, **always use the `<Logo />` component** (`src/components/layout/Logo.vue`).

```html
<Logo />                <!-- Default size (md) -->
<Logo size="lg" />      <!-- Large size -->
```

This component automatically detects the current theme (`isDark` from `useDarkMode()`) and switches between the light and dark versions of the logo SVGs seamlessly. No manual CSS is required.

## Using Theme Variables

Always use CSS variables in your styles:

```css
/* ✅ Correct — adapts to theme */
.card {
  background-color: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
}

/* ❌ Wrong — won't adapt to theme changes */
.card {
  background-color: #1e2025;
  color: white;
}
```

## Variable Reference

| Variable | Light Value | Dark Value | Purpose |
|---|---|---|---|
| `--background` | `#f8f9fa` | `#161616` | Page background |
| `--foreground` | `#1e2025` | `#ffffff` | Body text |
| `--card` | `#ffffff` | `#1e2025` | Card/panel background |
| `--card-foreground` | `#1e2025` | `#ffffff` | Card text |
| `--primary` | `#fc034c` | `#fc034c` | Brand/primary color |
| `--muted` | `rgba(0,0,0,0.05)` | `rgba(238,238,238,0.1)` | Subtle backgrounds |
| `--muted-foreground`| `#67748e` | `#a7a7a7` | Hint/secondary text |
| `--border` | `rgba(0,0,0,0.05)` | `rgba(238,238,238,0.1)` | Global borders |

## Fonts

```css
--font-sans: 'IBM Plex Sans Arabic', sans-serif;
```

## Pre-built CSS Classes

The framework includes utility classes for common UI patterns:

| Class | Purpose |
|---|---|
| `.neop-table-container` | Table wrapper |
| `.neop-table` | Table element |
| `.neop-form-container` | Form card |
| `.neop-input-field` | Themed input |
| `.neop-input-label` | Input label |
| `.neop-btn-save` | Primary save button |
| `.neop-btn-add` | Add/create button |
| `.neop-pagination-btn` | Pagination button |
| `.action-btn-circle` | Circular action button |

::: tip
Use the `neop-*` CSS classes to maintain consistent styling across all resources. They all respect the light/dark theme variables.
:::

## Changing the Default Mode

Dark mode is the default. To **switch the default to light mode**:

1. In `src/composables/useDarkMode.ts`, change the `useLocalStorage` default value:
```ts
// Change 'dark' or 'light' as needed.
const currentTheme = useLocalStorage('theme-preference', 'light', { 
  listenToStorageChanges: true,
})
```

2. To force a specific initial class, you can modify `index.html`:
```html
<html class="light" data-theme="light">
```

## Changing System Colors

To change the brand color or any system color, update the CSS variables in `src/style.css`:

```css
:root {
  /* Change the primary/brand color */
  --primary: #6366f1;    /* Indigo instead of pink/red */

  /* Change status colors */
  --success: #22c55e;  /* Green */
  --warning: #f59e0b;  /* Amber */
  --info: #06b6d4;     /* Cyan */
}
```

If you want **different brand colors per theme**, set them in both selectors:

```css
:root {
  --primary: #4f46e5;    /* Light mode brand */
}

.dark {
  --primary: #6366f1;    /* Dark mode brand (slightly lighter) */
}
```

::: tip
All UI components use `var(--primary)`, so changing this one variable updates buttons, checkboxes, focus rings, and other primary-colored elements globally across your shadcn components.
:::
