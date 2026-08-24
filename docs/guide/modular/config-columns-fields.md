# Modular Configurations (Columns & Fields)

While the monolithic `<ResourcePage />` relied on a single large `config` object, the modular system gives you the freedom to organize your resource definitions strictly for scalability.

We highly recommend separating your **Table Columns** and **Form Fields** into distinct files inside `src/modules/<resource_name>/`. This keeps your Vue components pristine.

## Recommended Project Structure

For a "Users" module, your directory should look like this:

```text
src/
  modules/
    users/
      schema.ts    # Zod validation rules
      columns.ts   # DataTable column definitions
      fields.ts    # FormContainer field definitions
  services/
    users.ts       # API fetch and mutate methods
  views/
    admin/
      users/
        IndexView.vue  # The orchestration Vue component
```

## 1. Defining Table Columns (`columns.ts`)

Columns define how data is presented in the `<DataTable>`. The modular approach uses the exact same `TableColumn` type you are already used to.

```ts
// src/modules/users/columns.ts
import type { TableColumn } from '@/types'
import { h } from 'vue'

// Custom components you might want to render inside cells
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import CustomUserAvatar from '@/components/admin/users/Avatar.vue'

export const userColumns: TableColumn[] = [
  // 1. Normal Type (Text)
  {
    key: 'id',
    label: 'ID',
    sortable: true
  },

  // 2. Normal Type (Date formatting)
  {
    key: 'created_at',
    label: 'Joined Date',
    type: 'date'
  },

  // 3. Custom Rendering via Vue render function `h()`
  {
    key: 'status',
    label: 'Status',
    render: (value, row) => {
      // Return a VNode.
      // First arg: Component, Second arg: Props
      return h(StatusBadge, {
        status: value,
        isPremium: row.plan === 'premium'
      })
    }
  },

  // 4. Custom Rendering mapped to entirely custom layouts
  {
    key: 'profile',
    label: 'User Profile',
    render: (value, row) => {
      return h(CustomUserAvatar, {
        user: row,
        size: 'md'
      })
    }
  }
]
```

## 2. Defining Form Fields (`fields.ts`)

Fields define the inputs rendered by `<FormContainer>`. Again, the `FormField` type is fully retained.

```ts
// src/modules/users/fields.ts
import type { FormField } from '@/types'
import { h } from 'vue'

// Custom input component
import RoleSelectDropdown from '@/components/admin/users/RoleSelectDropdown.vue'

export const userFields: FormField[] = [
  // 1. Normal Types (Text, Email, Number, Password)
  {
    key: 'name',
    label: 'Full Name',
    type: 'text',
    placeholder: 'John Doe'
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'email'
  },
  {
    key: 'is_active',
    label: 'Active Account',
    type: 'boolean' // Renders a switch/checkbox
  },

  // 2. Normal Select Options mapping
  {
    key: 'department',
    label: 'Department',
    type: 'select',
    options: [
      { label: 'Engineering', value: 'eng' },
      { label: 'Marketing', value: 'mkt' }
    ]
  },

  // 3. Searchable Paginated Dropdowns (DDL)
  {
    key: 'manager_id',
    label: 'Manager',
    type: 'async-select', // Combobox with infinite scroll + search
    optionsLoader: async (params) => {
      // Receives { page: 1, search: 'John...' } dynamically as the user types or scrolls down
      const result = await usersService.list({ 
        role: 'manager', 
        q: params?.search,
        page: params?.page 
      })
      
      return {
        data: result.data.map(u => ({ value: String(u.id), label: u.name })),
        totalPages: result.meta?.last_page // Helps the async-select know when to stop loading
      }
    }
  },

  // 3. Custom Rendering (Replacing the default HTML Input)
  {
    key: 'role_id',
    label: 'User Role',
    render: (value, emitUpdate, rowData) => {
      // Return a dynamically bound component
      // `value`: The current reactive state of this field
      // `emitUpdate`: Callback to update the internal form state
      return h(RoleSelectDropdown, {
        modelValue: value,
        'onUpdate:modelValue': (newVal: any) => emitUpdate(newVal),
        userId: rowData.id // You have access to other filled form data!
      })
    }
  }
]
```

## 3. Bringing it together (`IndexView.vue`)

Inside your orchestration component, you simply import these isolated configurations and feed them into the composables:

```vue
<script setup lang="ts">
import { useTable, useForm } from '@/composables'
import { usersService } from '@/services/users'

// Import the separated configurations!
import { userColumns } from '@/modules/users/columns'
import { userFields } from '@/modules/users/fields'
import { userSchema } from '@/modules/users/schema'

const table = useTable({
  resourceName: 'users',
  fetchFn: (params) => usersService.list(params),
  columns: userColumns // Passed to useTable
})

const form = useForm({
  resourceName: 'users',
  createFn: (data) => usersService.create(data),
  updateFn: (id, data) => usersService.update(id, data),
  getFn: (id) => usersService.get(id),
  schema: userSchema,
  fields: userFields // Passed to useForm
})
</script>

<template>
  <!-- Table rendering -->
  <DataTable :columns="userColumns" :data="table.items.value" />

  <!-- Form rendering -->
  <FormContainer
    :fields="form.computedFields.value"
    :model-value="form.formData.value"
    @update:model-value="form.setFields"
  />
</template>
```

### Why this is better?

By explicitly removing the monolithic `config.ts` exporting `{ columns, fields }`, you:

1. Allow `columns.ts` to import Vue visual components (like Badges) without polluting the Form config.
2. Allow `fields.ts` to import Interactive UI inputs without polluting the Table config.
3. Keep module directories extremely structured and predictable, making AI generation via prompts significantly simpler.
