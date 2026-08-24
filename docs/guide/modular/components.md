# Customizing Components (DataTable & FormContainer)

The true power of the modular system lies in its unopinionated use of Vue components. While `useTable` and `useForm` manage the heavy logic, the visual presentation is fully handled by `<DataTable>` and `<FormContainer>`.

You have complete control over how to mount, style, and feed data to these components.

## 1. DataTable `<DataTable />`

The `DataTable` represents the core list presentation UI. It manages pagination controls, grid layouts, drag-and-drop, inline editing, and filter sheets.

### Standard Setup

```vue
<script setup lang="ts">
import { useTable } from '@/composables'
import DataTable from '@/components/admin/table/DataTable.vue'
import { TableRow, TableCell, TableHead } from '@/components/uic/table'
// ...

const table = useTable({ ... })
</script>

<template>
  <DataTable
    :data="table.items.value"
    :loading="table.loading.value"
    :searchable="false"
    :filterable="true"
    :filterConfig="userFilters"
  >
    <template #header>
      <TableRow>
        <TableHead>{{ t('users.fields.name') }}</TableHead>
        <TableHead>{{ t('users.fields.email') }}</TableHead>
        <TableHead>{{ t('users.fields.status') }}</TableHead>
      </TableRow>
    </template>
    
    <template #row="{ row }">
      <TableRow>
        <TableCell>{{ row.name }}</TableCell>
        <TableCell>{{ row.email }}</TableCell>
        <TableCell>{{ row.status }}</TableCell>
      </TableRow>
    </template>
  </DataTable>
</template>
```

### Key Props

| Prop                | Type                        | Description                                                                                                                                                                            |
| ------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`              | `Record<string, unknown>[]` | The array of objects to render. Directly map this to `table.items.value`.                                                                                                              |
| `loading`           | `boolean`                   | Triggers the skeleton loading animation state.                                                                                                                                         |
| `searchable`        | `boolean`                   | When true, renders a top-level search input above the table.                                                                                                                           |
| `serverSide`        | `boolean`                   | Tell the table your `useTable` composable is handling pagination via the server APIs, stopping the component from slicing arrays locally.                                              |
| `tableEnhancements` | `object`                    | Toggle features like `{ rowSelection: true, inlineEditing: true }`.                                                                                                                    |

### Inline Filters — `<DataTableFilters />`

> **`FilterSheet` and `filterable`/`filterConfig` props have been removed.** Filters are now a standalone inline component placed above your `<DataTable>`.

Use `defineFilters()` + `<DataTableFilters>` for a concise, fully typed filter bar:

```vue
<script setup lang="ts">
import { DataTable, DataTableFilters } from '@/components/ui/tables'
import { TableCell, TableHead, TableRow } from '@/components/uic/table'
import { defineFilters, useTable } from '@/composables'
import { usersService } from '@/services/usersService'

const filterConfig = defineFilters('users', [
  { key: 'role', type: 'select', values: ['admin', 'editor', 'viewer', 'user'] },
  { key: 'status', type: 'select', values: ['active', 'inactive'] },
  { key: 'is_verified', type: 'toggle' },
  { key: 'created_at', type: 'dateRange' },
])

const table = useTable({
  resourceName: 'users',
  fetchFn: (params) => usersService.list(params).then(r => ({ data: r.data, total: r.meta?.total ?? 0 })),
  filterConfig,
})
</script>

<template>
  <DataTableFilters
    :fields="filterConfig.fields"
    :filters="table.activeFilters.value"
    @update:filters="table.setFilters"
  />

  <DataTable :data="table.items.value" :loading="table.loading.value" server-side>
    <template #header>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </template>
    <template #row="{ row }">
      <TableRow>
        <TableCell>{{ row.name }}</TableCell>
        <TableCell>{{ row.status }}</TableCell>
      </TableRow>
    </template>
  </DataTable>
</template>
```

#### `defineFilters(resource, fields)` API

| Field Prop      | Type                          | Description                                                                 |
| --------------- | ----------------------------- | --------------------------------------------------------------------------- |
| `key`           | `string`                      | The filter parameter key sent to the API.                                   |
| `type`          | see below                     | The UI control type.                                                        |
| `values`        | `string[]`                    | Shorthand for select/multiselect — auto-generates i18n option labels.       |
| `options`       | `FilterOption[]`              | Full option objects — takes priority over `values`.                         |
| `endpoint`      | `() => Promise<{data: any[]}>` | Load options from an API (e.g. `() => citiesService.dropdown()`).          |
| `valueKey`      | `string`                      | Key from endpoint response items to use as value. Default: `'id'`.          |
| `labelKey`      | `string`                      | Key from endpoint response items to use as label. Default: `'name'`.        |
| `label`         | `string`                      | Override auto-generated label. Default: `{resource}.fields.{key}`.          |
| `optionPrefix`  | `string`                      | Override option label prefix. Default: `{key}s` (e.g. `role` → `roles`).   |
| `placeholder`   | `string`                      | Custom placeholder text.                                                    |
| `alias`         | `string`                      | Map to a different query parameter name.                                    |
| `transform`     | `(value) => any`              | Transform the value before sending to the API.                              |

#### Supported Filter Types

| Type          | UI Control          | Notes                               |
| ------------- | ------------------- | ----------------------------------- |
| `text`        | Text input          | Free-text search                    |
| `number`      | Number input        | Numeric value                       |
| `select`      | Dropdown            | Single value from options           |
| `multiselect` | Toggle pills        | Multiple values                     |
| `toggle`      | Switch              | Boolean on/off                      |
| `range`       | Two number inputs   | `{ min, max }` object               |
| `date`        | Date picker         | Single date                         |
| `dateRange`   | Two date pickers    | `{ from, to }` object               |
| `checkbox`    | Checkbox            | Boolean                             |

#### API Endpoint Options

Load filter options dynamically from a service `dropdown()` method:

```ts
import { citiesService } from '@/services/citiesService'

const filterConfig = defineFilters('orders', [
  { key: 'city_id', type: 'select', endpoint: () => citiesService.dropdown(), labelKey: 'name' },
  { key: 'status', type: 'select', values: ['pending', 'completed', 'cancelled'] },
])

### Slots

The `DataTable` component provides full structural control via powerful slot customization. You use these slots to define the layouts for the table head and body.

#### Structural Slots (`#header` and `#row`)
For maximum flexibility, you entirely define the rendering of the `<thead>` or the `<tr>`'s. This allows you to create heavily customized grids, responsive cards, or multi-row layouts while keeping `useTable.ts` as the brain:

```vue
<DataTable :data="data">
  <!-- Replace the entire table header -->
  <template #header>
    <TableRow class="bg-gray-50/50">
      <TableHead>
        {{ t('common.name') }}
      </TableHead>
      <TableHead>
        {{ t('common.email') }}
      </TableHead>
    </TableRow>
  </template>

  <!-- Replace the entire row layout -->
  <template #row="{ row }">
    <TableRow class="hover:bg-muted/50 cursor-pointer">
      <TableCell>
        {{ row.name }}
      </TableCell>
      <TableCell>
        {{ row.email }}
      </TableCell>
    </TableRow>
  </template>
</DataTable>
```

---

## 2. FormContainer `<FormContainer />`

`FormContainer` is a **layout shell** that provides the form tag, responsive grid, multi-step wizard navigation, and submit/cancel footer. You place your own form inputs inside it via slots.

### Standard Setup

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { userSchema } from '@/modules/users/schema'
import { usersService } from '@/services/usersService'
import InputField from '@/components/uic/input/InputField.vue'
import SelectField from '@/components/uic/select/SelectField.vue'

const { t } = useI18n()
const router = useRouter()

const form = useForm({
  resourceName: 'users',
  action: 'create',
  schema: userSchema,
  mutationFn: (data) => usersService.create(data),
  onSuccess: () => router.push({ name: 'admin-users' }),
})
</script>

<template>
  <FormContainer
    :form="form"
    @cancel="router.push({ name: 'admin-users' })"
  >
    <!-- You build the form fields yourself! -->
    <InputField
      :model-value="form.values.name"
      :label="t('users.fields.name')"
      required
      @update:model-value="form.setFieldValue('name', $event)"
    />
    <InputField
      :model-value="form.values.email"
      :label="t('users.fields.email')"
      type="email"
      required
      @update:model-value="form.setFieldValue('email', $event)"
    />
    <SelectField
      :model-value="form.values.role"
      :options="[{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }]"
      :label="t('users.fields.role')"
      @update:model-value="form.setFieldValue('role', $event)"
    />
  </FormContainer>
</template>
```

### Key Props

| Prop          | Type                                    | Description                                                              |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| `form`        | `ReturnType<typeof useForm>`            | The unified form object. Handles values, errors, saving state, and submit. |
| `isEdit`      | `boolean`                               | Switches the submit button label to "Save Changes" instead of "Create".  |
| `showStepper` | `boolean`                               | Enables multi-step wizard mode.                                          |
| `steps`       | `StepConfig[]`                          | Step labels, descriptions, and icons for the stepper.                    |
| `stepCount`   | `number`                                | Number of steps (alternative to passing `steps` array).                  |
| `loading`     | `boolean`                               | Shows a loading spinner instead of the form content.                     |


### Handling Steps (Multi-Step Form Wizards)

`FormContainer` natively features a fully-fledged `Stepper` UI!

To create a multi-step wizard, use `showStepper` and named slots for each step:

```vue
<script setup lang="ts">
const stepTitles = [
  { label: 'Basic Info', description: 'Name and email', icon: 'UserIcon' },
  { label: 'Security', description: 'Passwords and roles', icon: 'LockIcon' }
]
</script>

<template>
  <FormContainer
    :form="form"
    show-stepper
    :steps="stepTitles"
    @cancel="router.back()"
  >
    <template #step-1>
      <InputField
        :model-value="form.values.name"
        :label="t('users.fields.name')"
        @update:model-value="form.setFieldValue('name', $event)"
      />
      <InputField
        :model-value="form.values.email"
        :label="t('users.fields.email')"
        type="email"
        @update:model-value="form.setFieldValue('email', $event)"
      />
    </template>

    <template #step-2>
      <InputField
        :model-value="form.values.password"
        :label="t('users.fields.password')"
        type="password"
        @update:model-value="form.setFieldValue('password', $event)"
      />
    </template>
  </FormContainer>
</template>
```

When `showStepper` is active, the submit footer will convert into "Previous" / "Next" buttons, ensuring HTML5 validation is parsed before allowing progression. The final "Next" button automatically becomes a "Submit" or "Create" action button!

