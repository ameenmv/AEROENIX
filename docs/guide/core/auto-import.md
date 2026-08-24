# Auto-Import

The project uses **unplugin-auto-import** and **unplugin-vue-components** to eliminate repetitive import statements.

## What's Auto-Imported

### Vue APIs
All Vue composition API functions are auto-imported:

```vue
<script setup>
// ✅ No import needed!
const count = ref(0)
const doubled = computed(() => count.value * 2)

watch(count, (newVal) => {
  console.log('Count changed:', newVal)
})

onMounted(() => {
  console.log('Mounted!')
})
</script>
```

### Vue Router
```ts
// ✅ Auto-imported
const route = useRoute()
const router = useRouter()
```

### Pinia
```ts
// ✅ Auto-imported
const store = defineStore('myStore', () => { ... })
```

### VueUse
Selected VueUse functions are auto-imported:

```ts
// ✅ Auto-imported
const { x, y } = useMouse()
```

## Auto-Imported Components

All Vue components in `src/components/` (and subdirectories) are auto-imported:

```vue
<template>
  <!-- ✅ No import needed for components in src/components/ -->
  <DataTable :items="items" />
  <FilterSheet />
  <Modal :open="isOpen" />
</template>
```

::: tip
Component auto-import searches recursively (`deep: true`) through all subdirectories of `src/components/`.
:::

## Configuration

The auto-import is configured in `vite.config.ts`:

```ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: [
        'vue',          // ref, computed, watch, onMounted, etc.
        'vue-router',   // useRoute, useRouter
        'pinia',        // defineStore
        {
          '@vueuse/core': ['useMouse', ['useFetch', 'useMyFetch']],
        },
      ],
      dts: 'src/auto-imports.d.ts',  // Type declarations
    }),

    Components({
      dirs: ['src/components'],     // Scan directory
      extensions: ['vue'],          // File extensions
      deep: true,                   // Recursive scan
      dts: 'src/components.d.ts',   // Type declarations
    }),
  ],
})
```

## Generated Type Files

Two `.d.ts` files are auto-generated:

- `src/auto-imports.d.ts` — Types for auto-imported functions
- `src/components.d.ts` — Types for auto-imported components

::: warning
Don't edit these files manually — they are regenerated every time the dev server starts. Add them to `.gitignore` if needed.
:::

## What Still Requires Manual Import

These are **NOT** auto-imported and must be imported manually:

```ts
// Composables from src/composables/
import { useResource } from '@/composables/useResource'
import { useCan } from '@/composables/useCan'
import { useDarkMode } from '@/composables/useDarkMode'

// Services
import { usersService } from '@/services/usersService'

// Resource configs
import { usersConfig } from '@/lib/resources/users'

// Schemas
import { UserSchema } from '@/schemas'

// Types
import type { ResourceConfig, User } from '@/types'

// External libraries
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
```

::: tip
**Rule of thumb**: Vue APIs and UI components are auto-imported. Business logic (composables, services, configs, types) requires explicit imports.
:::
