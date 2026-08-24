import { VueQueryPlugin } from '@tanstack/vue-query'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'
import { createI18n } from 'vue-i18n'

// Create mock i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      common: {
        add: 'Add',
        edit: 'Edit',
        delete: 'Delete',
        view: 'View',
        cancel: 'Cancel',
        save: 'Save',
        confirm_delete: 'Are you sure?',
        total_items: 'Total items',
        entries_per_page: 'entries per page',
        search: 'Search',
        actions: 'Actions',
        previous: 'Previous',
        next: 'Next',
        showing_info: 'Showing {start} to {end} of {total} entries',
        no_data_available: 'No data available',
        archive: 'Archive',
        success: 'Success',
        error: 'Error',
      },
    },
  },
})

// Mock for @hugeicons/vue
vi.mock('@hugeicons/vue', () => ({
  HugeiconsIcon: {
    name: 'HugeiconsIcon',
    props: ['icon', 'size', 'strokeWidth'],
    template: '<span class="mock-icon" :data-icon="icon" :data-size="size"></span>',
  },
}))

// Mock for environment variables
vi.mock('import.meta.env', () => ({
  VITE_MOCK_AUTH: 'false',
}))

// Setup Pinia before each test
beforeEach(() => {
  setActivePinia(createPinia())
})

// Configure Vue Test Utils with global plugins
config.global.plugins = [i18n, VueQueryPlugin]

// Add global stubs for common components
config.global.stubs = {
  'router-link': true,
  'router-view': true,
}

// Extend matchers if needed
expect.extend({
  // Custom matchers can be added here
})
