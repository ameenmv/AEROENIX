<script setup lang="ts">
import type { FilterConfig } from '@/components/uic/filter-panel/FilterPanel.vue'
import { ref } from 'vue'
import { FilterBar } from '@/components/uic/filter-bar'

const search = ref('')
const filterValues = ref<Record<string, unknown>>({})

const filters: FilterConfig[] = [
  {
    model: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Pending', value: 'pending' },
    ],
  },
  {
    model: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
      { label: 'Editor', value: 'editor' },
    ],
  },
  { model: 'name', label: 'Name', type: 'text', placeholder: 'Filter by name...' },
  { model: 'date', label: 'Created Date', type: 'date' },
]
</script>

<template>
  <Story title="FilterBar" group="inputs" icon="lucide:filter">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <FilterBar
            v-model:search="search"
            v-model:filter-values="filterValues"
            :filters="filters"
            search-placeholder="Search users..."
          />
          <p class="text-xs text-muted-foreground">
            Search: "{{ search }}" | Filters: {{ JSON.stringify(filterValues) }}
          </p>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <FilterBar
            v-model:search="search"
            v-model:filter-values="filterValues"
            :filters="filters"
            search-placeholder="Search users..."
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
