<script setup lang="ts">
import type { FilterConfig } from '@/components/uic/filter-panel/FilterPanel.vue'
import { ref } from 'vue'
import FilterPanel from '@/components/uic/filter-panel/FilterPanel.vue'

const filterValues = ref<Record<string, unknown>>({})

const filters: FilterConfig[] = [
  { model: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] },
  { model: 'name', label: 'Name', type: 'text', placeholder: 'Enter name...' },
  { model: 'created', label: 'Created', type: 'date' },
  { model: 'range', label: 'Date Range', type: 'daterange' },
]
</script>

<template>
  <Story title="FilterPanel" group="inputs" icon="lucide:sliders-horizontal">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="w-[320px] border border-border rounded-lg overflow-hidden">
            <FilterPanel v-model="filterValues" :filters="filters" />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="w-[320px] border border-border rounded-lg overflow-hidden">
            <FilterPanel v-model="filterValues" :filters="filters" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
