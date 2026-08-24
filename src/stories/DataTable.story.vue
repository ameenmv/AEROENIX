<script setup lang="ts">
import { Copy01Icon, Delete01Icon, Edit02Icon, ViewIcon } from '@hugeicons/core-free-icons'
import { ref } from 'vue'
import DataTable from '@/components/ui/tables/DataTable.vue'
import { Button } from '@/components/uic/button'

const sampleColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status' },
]
const sampleData = [
  { id: 1, name: 'Ahmed Hassan', email: 'ahmed@neop.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Sara Ali', email: 'sara@neop.com', role: 'Editor', status: 'Active' },
  { id: 3, name: 'Omar Khaled', email: 'omar@neop.com', role: 'Viewer', status: 'Inactive' },
  { id: 4, name: 'Lina Naser', email: 'lina@neop.com', role: 'Admin', status: 'Active' },
  { id: 5, name: 'Youssef Tarek', email: 'youssef@neop.com', role: 'Editor', status: 'Pending' },
  { id: 6, name: 'Nour Ibrahim', email: 'nour@neop.com', role: 'Viewer', status: 'Active' },
  { id: 7, name: 'Mona Farid', email: 'mona@neop.com', role: 'Admin', status: 'Active' },
  { id: 8, name: 'Hadi Mansour', email: 'hadi@neop.com', role: 'Editor', status: 'Inactive' },
  { id: 9, name: 'Dalia Samir', email: 'dalia@neop.com', role: 'Viewer', status: 'Active' },
  { id: 10, name: 'Karim Fathi', email: 'karim@neop.com', role: 'Admin', status: 'Pending' },
  { id: 11, name: 'Rania Adel', email: 'rania@neop.com', role: 'Editor', status: 'Active' },
  { id: 12, name: 'Walid Nabil', email: 'walid@neop.com', role: 'Viewer', status: 'Inactive' },
]
const selected = ref<(string | number)[]>([])
const lastAction = ref('')
</script>

<template>
  <Story title="DataTable" group="display" icon="lucide:table-2">
    <Variant title="Basic">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Basic Table
          </h3>
          <DataTable :columns="sampleColumns" :data="sampleData" />
        </div>
      </div>
    </Variant>
    <Variant title="Searchable">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            With Search
          </h3>
          <DataTable :columns="sampleColumns" :data="sampleData" searchable />
        </div>
      </div>
    </Variant>
    <Variant title="Row Selection">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            With Row Selection
          </h3>
          <p class="text-sm text-muted-foreground">
            Selected: {{ selected.length }} rows
          </p>
          <DataTable
            v-model:selected="selected"
            :columns="sampleColumns"
            :data="sampleData"
            searchable
            :table-enhancements="{ rowSelection: true }"
          />
        </div>
      </div>
    </Variant>
    <Variant title="Drag & Drop">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            With Drag & Drop Reordering
          </h3>
          <DataTable
            :columns="sampleColumns"
            :data="sampleData.slice(0, 5)"
            searchable
            :drag-and-drop="{ enabled: true }"
          />
        </div>
      </div>
    </Variant>
    <Variant title="With Actions Slot">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Custom Actions Column
          </h3>
          <DataTable :columns="sampleColumns" :data="sampleData" searchable>
            <template #actions>
              <div class="flex gap-1">
                <Button variant="ghost" size="icon-sm">
                  ✏️
                </Button>
                <Button variant="ghost" size="icon-sm">
                  🗑️
                </Button>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </Variant>
    <Variant title="Context Menu">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Right-click Context Menu
          </h3>
          <p class="text-sm text-muted-foreground">
            Right-click any row to see the context menu.
            <span v-if="lastAction" class="text-primary font-medium"> Last: {{ lastAction }}</span>
          </p>
          <DataTable
            :columns="sampleColumns"
            :data="sampleData"
            searchable
            :context-menu-actions="[
              { label: 'View', icon: ViewIcon, onClick: (row) => { lastAction = `View: ${row?.name}` } },
              { label: 'Edit', icon: Edit02Icon, onClick: (row) => { lastAction = `Edit: ${row?.name}` } },
              { label: 'Copy ID', icon: Copy01Icon, onClick: (row) => { lastAction = `Copy: ${row?.id}` } },
              { label: 'Delete', icon: Delete01Icon, variant: 'delete', separator: true, onClick: (row) => { lastAction = `Delete: ${row?.name}` } },
            ]"
          />
        </div>
      </div>
    </Variant>
    <Variant title="Loading State">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            Loading Skeleton
          </h3>
          <DataTable :columns="sampleColumns" :data="[]" loading />
        </div>
      </div>
    </Variant>
    <Variant title="Empty State">
      <div class="grid grid-cols-1 gap-8 p-8">
        <div class="dark p-6 rounded-xl bg-background border border-border space-y-4">
          <h3 class="text-lg font-bold text-foreground">
            No Data
          </h3>
          <DataTable :columns="sampleColumns" :data="[]" />
        </div>
      </div>
    </Variant>
  </Story>
</template>
