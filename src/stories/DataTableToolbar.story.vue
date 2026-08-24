<script setup lang="ts">
import type { PaginationMeta } from '@/components/uic/data-table-toolbar'
import { ref } from 'vue'
import { DataTableToolbar } from '@/components/uic/data-table-toolbar'

const pagination = ref<PaginationMeta>({
  current_page: 3,
  last_page: 10,
  per_page: 20,
  total: 195,
  from: 41,
  to: 60,
})

function goToPage(page: number) {
  pagination.value.current_page = page
  pagination.value.from = (page - 1) * pagination.value.per_page + 1
  pagination.value.to = Math.min(page * pagination.value.per_page, pagination.value.total)
}

function changePageSize(size: number) {
  pagination.value.per_page = size
  pagination.value.last_page = Math.ceil(pagination.value.total / size)
  goToPage(1)
}
</script>

<template>
  <Story title="DataTableToolbar" group="display" icon="lucide:table">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div
            class="border border-border rounded-lg p-4 text-sm text-muted-foreground text-center"
          >
            Table content here...
          </div>
          <DataTableToolbar
            :pagination="pagination"
            @paginate="goToPage"
            @update:page-size="changePageSize"
          />
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div
            class="border border-border rounded-lg p-4 text-sm text-muted-foreground text-center"
          >
            Table content here...
          </div>
          <DataTableToolbar
            :pagination="pagination"
            @paginate="goToPage"
            @update:page-size="changePageSize"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
