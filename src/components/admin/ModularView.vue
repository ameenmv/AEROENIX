<script setup lang="ts">
/**
 * ModularView — Generic wrapper for modular page layouts.
 *
 * Wrap your index/list content with this component. It will automatically
 * handle child route rendering based on route meta:
 *
 *   meta: { openMode: 'modal' }  → child renders in a POV dialog overlay
 *   meta: { openMode: 'full' }   → child renders as a full page (table hidden)
 *
 * Usage:
 *   <ModularView>
 *     <!-- your table / list content here -->
 *   </ModularView>
 *
 * Routes:
 *   { path: 'admin/products', component: IndexView, children: [
 *       { path: 'create', component: CreateView, meta: { openMode: 'full' } },
 *       { path: ':id/edit', component: EditView, meta: { openMode: 'modal', modalTitle: 'titles.editProduct' } },
 *   ]}
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { POV } from '@/components/ui/modals'

const props = withDefaults(
  defineProps<{
    /** Max width for the POV modal dialog */
    modalMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
  }>(),
  {
    modalMaxWidth: '4xl',
  },
)
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
/**
 * Get the deepest matched route's meta (the active child route).
 */
const childMeta = computed(() => {
  const lastMatch = route.matched.at(-1)
  return lastMatch?.meta || {}
})
/**
 * A child route is active when the deepest matched route has an openMode meta.
 */
const hasChildRoute = computed(() => !!childMeta.value.openMode)
const isChildModal = computed(() => childMeta.value.openMode === 'modal')
/**
 * Modal title — reads from route meta `modalTitle` and translates via i18n.
 * If the key contains a dot (e.g., 'titles.editProduct'), it's treated as
 * an i18n key. Otherwise it's used as-is.
 */
const modalTitle = computed(() => {
  const raw = (childMeta.value.modalTitle as string) || ''
  return raw.includes('.') ? t(raw) : raw
})
/**
 * Navigate back to the parent route (the index/list page).
 */
function goBack() {
  // Navigate to the parent route (second-to-last matched)
  const parentRoute = route.matched[route.matched.length - 2]
  if (parentRoute?.name) {
    router.push({ name: parentRoute.name as string })
  }
  else {
    router.back()
  }
}
</script>

<template>
  <div>
    <!-- Main content (table/list) — visible when no child active OR child is in modal mode -->
    <div v-show="!hasChildRoute || isChildModal">
      <slot />
    </div>
    <!-- Modal mode: child renders inside a POV dialog overlay -->
    <POV
      v-if="isChildModal && hasChildRoute"
      :show="true"
      :title="modalTitle"
      :max-width="props.modalMaxWidth"
      @close="goBack"
    >
      <router-view />
    </POV>
    <!-- Full page mode: child renders directly (table is hidden via v-show above) -->
    <router-view v-else-if="hasChildRoute" />
  </div>
</template>
