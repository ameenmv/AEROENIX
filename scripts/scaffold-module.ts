import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import inquirer from 'inquirer'

// ─── CLI Flags ──────────────────────────────────────────────────
const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const DRY_RUN = args.includes('--dry-run')

// ─── Naming Helpers ──────────────────────────────────────────────
const toCamelCase = (str: string) => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
function toPascalCase(str: string) {
  const c = toCamelCase(str)
  return c.charAt(0).toUpperCase() + c.slice(1)
}
const toSnakeCase = (str: string) => str.replace(/-/g, '_')
const toPlural = (str: string) => (str.endsWith('s') ? str : `${str}s`)

// ─── Interactive Wizard ─────────────────────────────────────────
async function run() {
  console.warn('')
  console.warn('  ╔══════════════════════════════════════╗')
  console.warn('  ║   🏗️  Module Scaffold Wizard         ║')
  console.warn('  ╚══════════════════════════════════════╝')
  console.warn('')

  // ── Step 1: Resource Name ──────────────────────────────────────
  const { resourceName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'resourceName',
      message: 'Module resource name (kebab-case, e.g. products, blog-posts):',
      validate: (v: string) => {
        if (!v.trim())
          return 'Resource name is required'
        if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(v.trim()))
          return 'Must be kebab-case (e.g. clients, blog-posts)'
        const camel = v.trim().replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
        const moduleDir = path.join(process.cwd(), 'src', 'modules', camel)
        if (fs.existsSync(moduleDir) && !FORCE)
          return `Module "${v.trim()}" already exists at src/modules/${camel}/. Use --force to overwrite.`
        return true
      },
      filter: (v: string) => v.trim(),
    },
  ])

  // ── Step 2: Feature Selection ──────────────────────────────────
  const { features } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features to include:',
      choices: [
        { name: 'Index (List Page)', value: 'index', checked: true, disabled: 'always included' },
        { name: 'Create Page', value: 'create', checked: true },
        { name: 'Edit Page', value: 'edit', checked: true },
        { name: 'Show (Detail) Page', value: 'show', checked: true },
        new inquirer.Separator('── Optional ──'),
        { name: 'Permission Guards', value: 'permissions', checked: false },
        { name: 'Mock Data (faker.js)', value: 'mock', checked: false },
      ],
    },
  ])

  const hasCreate = features.includes('create')
  const hasEdit = features.includes('edit')
  const hasShow = features.includes('show')
  const hasPermissions = features.includes('permissions')
  const hasMock = features.includes('mock')

  // ── Step 3: Permission Key (if permissions enabled) ────────────
  let permissionKey = toSnakeCase(resourceName)
  if (hasPermissions) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'permissionKey',
        message: `Permission key [${toSnakeCase(resourceName)}]:`,
        filter: (v: string) => v.trim() || toSnakeCase(resourceName),
      },
    ])
    permissionKey = answer.permissionKey
  }

  // ── Step 4-6: Open Modes ───────────────────────────────────────
  let createOpenMode = 'modal'
  let editOpenMode = 'modal'
  let showOpenMode = 'full'

  const openModePrompts: any[] = []
  if (hasCreate) {
    openModePrompts.push({
      type: 'rawlist',
      name: 'createOpenMode',
      message: 'Create page opens as:',
      choices: [
        { name: 'Modal (overlay)', value: 'modal' },
        { name: 'Full Page', value: 'full' },
      ],
      default: 1,
    })
  }
  if (hasEdit) {
    openModePrompts.push({
      type: 'rawlist',
      name: 'editOpenMode',
      message: 'Edit page opens as:',
      choices: [
        { name: 'Modal (overlay)', value: 'modal' },
        { name: 'Full Page', value: 'full' },
      ],
      default: 1,
    })
  }
  if (hasShow) {
    openModePrompts.push({
      type: 'rawlist',
      name: 'showOpenMode',
      message: 'Show (detail) page opens as:',
      choices: [
        { name: 'Modal (overlay)', value: 'modal' },
        { name: 'Full Page', value: 'full' },
      ],
      default: 2,
    })
  }

  if (openModePrompts.length > 0) {
    const openModeAnswers = await inquirer.prompt(openModePrompts)
    createOpenMode = openModeAnswers.createOpenMode || createOpenMode
    editOpenMode = openModeAnswers.editOpenMode || editOpenMode
    showOpenMode = openModeAnswers.showOpenMode || showOpenMode
  }

  // ── Step 7: Actions Style ──────────────────────────────────────
  const { actionsStyle } = await inquirer.prompt([
    {
      type: 'rawlist',
      name: 'actionsStyle',
      message: 'Table actions style:',
      choices: [
        { name: 'Inline Buttons (view, edit, delete side by side)', value: 'inline' },
        { name: 'Dropdown Menu (⋮ three dots menu)', value: 'dropdown' },
      ],
      default: 1,
    },
  ])
  const isDropdown = actionsStyle === 'dropdown'

  // ── Step 7.5: Sidebar Navigation Placement ─────────────────────
  const navContentRaw = fs.readFileSync(path.join(process.cwd(), 'src/config/navigation.ts'), 'utf8')
  const groupRegex = /name:\s*'([^']+)'[\s\S]*?children:\s*\[/g
  let matchGroup
  const existingGroups: string[] = []
  while ((matchGroup = groupRegex.exec(navContentRaw)) !== null) {
    if (matchGroup[1])
      existingGroups.push(matchGroup[1])
  }

  const navChoices: { name: string, value: string }[] = [
    { name: 'Root level (no parent)', value: 'root' },
  ]
  if (existingGroups.length > 0) {
    navChoices.push({ name: 'Add to Existing Group', value: 'existing_group' })
  }
  navChoices.push({ name: 'Create New Group', value: 'new_group' })

  const { navPlacement } = await inquirer.prompt([
    {
      type: 'rawlist',
      name: 'navPlacement',
      message: 'Where should this module be placed in the sidebar?',
      choices: navChoices,
      default: 0,
    },
  ])

  let selectedGroup = ''
  let newGroupName = ''
  const newGroupIcon = 'Folder01Icon'

  if (navPlacement === 'existing_group') {
    const { group } = await inquirer.prompt([
      {
        type: 'rawlist',
        name: 'group',
        message: 'Select a group:',
        choices: existingGroups.map(g => ({ name: g, value: g })),
      },
    ])
    selectedGroup = group
  }
  else if (navPlacement === 'new_group') {
    const { groupName } = await inquirer.prompt([
      { type: 'input', name: 'groupName', message: 'Enter new group name (e.g. organization):', filter: (v: string) => v.trim() },
    ])
    newGroupName = groupName
  }

  // ── Step 8: Summary & Confirm ──────────────────────────────────
  const camelName = toCamelCase(resourceName)
  const pascalName = toPascalCase(resourceName)
  const pluralName = toPlural(resourceName)

  console.warn('')
  console.warn('  ┌─────────────────────────────────────┐')
  console.warn('  │         📋 Module Summary            │')
  console.warn('  ├─────────────────────────────────────┤')
  console.warn(`  │  Module:       ${pascalName.padEnd(22)}│`)
  console.warn(`  │  Views:        Index${hasCreate ? `, Create (${createOpenMode})` : ''}${hasEdit ? `, Edit (${editOpenMode})` : ''}${hasShow ? `, Show (${showOpenMode})` : ''}`)
  console.warn(`  │  Permissions:  ${hasPermissions ? `ON (${permissionKey})` : 'OFF'}`)
  console.warn(`  │  Mock Data:    ${hasMock ? 'ON' : 'OFF'}`)
  console.warn(`  │  Actions:      ${isDropdown ? 'Dropdown Menu (⋮)' : 'Inline Buttons'}`)
  console.warn('  └─────────────────────────────────────┘')
  console.warn('')

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Generate module?',
      default: true,
    },
  ])
  if (!confirm) {
    console.warn('  Aborted.')
    return
  }

  // ─── Derived Names ──────────────────────────────────────────────
  const snakeName = toSnakeCase(resourceName)
  const pluralSnake = toSnakeCase(pluralName)
  const ENDPOINT_KEY = snakeName.toUpperCase()

  const ROOT = process.cwd()

  // ─── File Paths ──────────────────────────────────────────────────
  const filePaths = {
    service: path.join(ROOT, 'src/services', `${camelName}Service.ts`),
    moduleDir: path.join(ROOT, 'src/modules', camelName),
    viewDir: path.join(ROOT, 'src/views/admin', camelName),
    entityType: path.join(ROOT, 'src/types/entities', `${resourceName}.ts`),
    typesIndex: path.join(ROOT, 'src/types/index.ts'),
    router: path.join(ROOT, 'src/router/index.ts'),
    i18nEn: path.join(ROOT, 'src/i18n/locales/en', `${pluralSnake}.json`),
    i18nAr: path.join(ROOT, 'src/i18n/locales/ar', `${pluralSnake}.json`),
    navigation: path.join(ROOT, 'src/config/navigation.ts'),
    menuEn: path.join(ROOT, 'src/i18n/locales/en/menu.json'),
    menuAr: path.join(ROOT, 'src/i18n/locales/ar/menu.json'),
    mockData: path.join(ROOT, 'src/services/mock', `${camelName}Mock.ts`),
  }

  const moduleFiles = {
    schema: path.join(filePaths.moduleDir, 'schema.ts'),
    index: path.join(filePaths.moduleDir, 'index.ts'),
    endpoints: path.join(filePaths.moduleDir, 'endpoints.ts'),
  }

  const viewFiles = {
    indexView: path.join(filePaths.viewDir, 'IndexView.vue'),
    createView: path.join(filePaths.viewDir, 'CreateView.vue'),
    editView: path.join(filePaths.viewDir, 'EditView.vue'),
    showView: path.join(filePaths.viewDir, 'ShowView.vue'),
    actionsDropdown: path.join(filePaths.viewDir, 'partials', 'ActionsDropdown.vue'),
  }

  // ═══════════════════════════════════════════════════════════════
  // ═══ TEMPLATE GENERATION ═══════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════

  // endpoints.ts
  const endpointsContent = `export const API_PREFIX = '/api/v1'

export const ${ENDPOINT_KEY}_ENDPOINTS = {
  LIST: \`\${API_PREFIX}/${pluralName}\`,
  GET: (id: string | number) => \`\${API_PREFIX}/${pluralName}/\${id}\`,
  CREATE: \`\${API_PREFIX}/${pluralName}\`,
  UPDATE: (id: string | number) => \`\${API_PREFIX}/${pluralName}/\${id}\`,
  DELETE: (id: string | number) => \`\${API_PREFIX}/${pluralName}/\${id}\`,
} as const
`

  // schema.ts
  const schemaContent = `import { z } from 'zod'

export const ${camelName}Schema = z.object({
  // TODO: Define your schema fields
  // name: z.string().min(1, 'Name is required'),
  // email: z.string().email('Invalid email'),
})
`

  // module/index.ts — CONDITIONAL permissionKey & child routes
  const childRoutes: string[] = []
  if (hasCreate) {
    childRoutes.push(`      {
        path: 'create',
        name: 'admin-${resourceName}-create',
        component: () => import('@/views/admin/${camelName}/CreateView.vue'),
        meta: { openMode: '${createOpenMode}' },
      }`)
  }
  if (hasShow) {
    childRoutes.push(`      {
        path: ':id',
        name: 'admin-${resourceName}-show',
        component: () => import('@/views/admin/${camelName}/ShowView.vue'),
        meta: { openMode: '${showOpenMode}' },
      }`)
  }
  if (hasEdit) {
    childRoutes.push(`      {
        path: ':id/edit',
        name: 'admin-${resourceName}-edit',
        component: () => import('@/views/admin/${camelName}/EditView.vue'),
        meta: { openMode: '${editOpenMode}' },
      }`)
  }

  const permissionLine = hasPermissions
    ? `  permissionKey: '${permissionKey}',`
    : `  // permissionKey: '${permissionKey}', // Uncomment when backend permissions are ready`

  const moduleRouterContent = `import { registerModule } from '@/router/modules'
import { Home01Icon } from '@hugeicons/core-free-icons'

registerModule({
  name: '${camelName}',
  path: 'admin/${camelName}',
  icon: Home01Icon,
${permissionLine}
  routes: [
    {
      path: 'admin/${camelName}',
      name: 'admin-${resourceName}',
      component: () => import('@/views/admin/${camelName}/IndexView.vue'),
${childRoutes.length > 0 ? `      children: [\n${childRoutes.join(',\n')}\n      ],` : '      meta: { resource: true },'}
    }
  ]
})
`

  // ─── 2. Views ──────────────────────────────────────────────────

  // Build icon imports based on selected features
  const iconImports: string[] = []
  if (hasCreate)
    iconImports.push('PlusSignIcon')
  if (!isDropdown) {
    if (hasShow)
      iconImports.push('ViewIcon')
    if (hasEdit)
      iconImports.push('Edit02Icon')
    iconImports.push('Delete02Icon')
  }
  else {
    iconImports.push('MoreVerticalIcon')
  }

  // Build action buttons (inline mode)
  const actionButtons: string[] = []
  if (!isDropdown) {
    if (hasShow) {
      actionButtons.push(`            <Button size="sm" variant="ghost" @click="router.push({ name: 'admin-${resourceName}-show', params: { id: row.id } })">
              <HugeiconsIcon :icon="ViewIcon" :size="16" class="text-gray-500" />
            </Button>`)
    }
    if (hasEdit) {
      actionButtons.push(`            <Button size="sm" variant="ghost" @click="router.push({ name: 'admin-${resourceName}-edit', params: { id: row.id } })">
              <HugeiconsIcon :icon="Edit02Icon" :size="16" class="text-blue-500" />
            </Button>`)
    }
    const deleteVCan = hasPermissions ? ` v-can="'${permissionKey}.manage'"` : ''
    actionButtons.push(`            <Button size="sm" variant="ghost"${deleteVCan} :loading="deleteMutation.isPending.value" @click="handleDelete(row.id)">
              <HugeiconsIcon :icon="Delete02Icon" :size="16" class="text-red-500" />
            </Button>`)
  }

  const addButtonVCan = hasPermissions ? ` v-can="'${permissionKey}.manage'"` : ''
  const mockImport = hasMock ? `\nimport { ${camelName}MockData } from '@/services/mock/${camelName}Mock'` : ''
  const mockDataLine = hasMock ? `\n  mockData: ${camelName}MockData,` : ''
  const dropdownImport = isDropdown ? `\nimport ActionsDropdown from './partials/ActionsDropdown.vue'` : ''

  const indexViewContent = `<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTable } from '@/composables'
import { useConfirm } from '@/composables/useConfirm'
import { DataTable } from '@/components/ui/tables'
import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import { ${iconImports.join(', ')} } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ${camelName}Service } from '@/services/${camelName}Service'
import type { ${pascalName} } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'${mockImport}${dropdownImport}

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()
const { confirmState, confirm, cancel } = useConfirm()

const table = useTable<${pascalName}>({
  resourceName: '${pluralSnake}',
  fetchFn: (params) => ${camelName}Service.list(params),${mockDataLine}
})

const columns = [
  { key: 'id', label: '#' },
  // TODO: Add your columns here using i18n keys
  // { key: 'name', label: t('${pluralSnake}.fields.name') },
  // { key: 'email', label: t('${pluralSnake}.fields.email') },
  { key: 'created_at', label: t('${pluralSnake}.fields.created_at', 'Created At') },
]

const deleteMutation = useMutation({
  mutationFn: (id: string | number) => ${camelName}Service.delete(id),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['${pluralSnake}'] }),
})

const handleDelete = (id: string | number) => {
  confirm(t('common.confirm_delete', 'Confirm Delete'), t('common.confirm_delete_message', 'Are you sure you want to delete this item?'), () => {
    deleteMutation.mutate(id, {
      onSettled: () => cancel(),
    })
  })
}
</script>

<template>
  <ModularView>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ t('${pluralSnake}.title', '${pascalName}') }}</h1>
          <p class="mt-1 text-sm text-muted-foreground">{{ t('${pluralSnake}.subtitle', 'Manage ${pluralName}') }}</p>
        </div>${hasCreate
          ? `
        <Button${addButtonVCan} @click="router.push({ name: 'admin-${resourceName}-create' })">
          <HugeiconsIcon :icon="PlusSignIcon" :size="20" class="mr-2" />
          {{ t('actions.add') }}
        </Button>`
          : ''}
      </div>

      <DataTable
        :columns="columns"
        :data="table.items.value"
        :loading="table.loading.value"
        :total-items="table.totalItems.value"
        :page="table.page.value"
        :per-page="table.perPage.value"
        server-side
        searchable
        @update:page="table.goToPage"
        @update:per-page="table.setPerPage"
        @update:search="table.setSearchQuery"
        @sort="table.setSorting"
      >
        <!-- Override any column cell via slots: -->
        <!-- <template #name="{ row }">{{ row.name }}</template> -->

        <template #actions="{ row }">
${isDropdown
  ? `          <ActionsDropdown
            :row="row"
            :delete-loading="deleteMutation.isPending.value"
            @view="router.push({ name: 'admin-${resourceName}-show', params: { id: row.id } })"
            @edit="router.push({ name: 'admin-${resourceName}-edit', params: { id: row.id } })"
            @delete="handleDelete(row.id)"
          />`
  : `          <div class="flex items-center justify-end gap-2">
${actionButtons.join('\n')}
          </div>`}
        </template>
      </DataTable>

      <ConfirmModal
        :show="confirmState.show"
        :title="confirmState.title"
        :message="confirmState.message"
        @confirm="confirmState.callback?.()"
        @cancel="cancel"
      />
    </div>
  </ModularView>
</template>
`

  // CreateView.vue
  const createViewContent = `<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { ${camelName}Schema } from '@/modules/${camelName}/schema'
import { ${camelName}Service } from '@/services/${camelName}Service'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const form = useForm({
  resourceName: '${pluralSnake}',
  action: 'create',
  schema: ${camelName}Schema,
  mutationFn: (data) => ${camelName}Service.create(data),
  onSuccess: () => router.push({ name: 'admin-${resourceName}' }),
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('actions.create') }} {{ t('${pluralSnake}.title', '${pascalName}') }}</h1>

    <FormContainer
      :form="form"
      @cancel="router.push({ name: 'admin-${resourceName}' })"
    >
      <!-- TODO: Add your form fields here -->
      <!-- <InputField name="name" :label="t('${pluralSnake}.fields.name')" :error="form.errors.value.name" /> -->
      <!-- <InputField name="email" type="email" :label="t('${pluralSnake}.fields.email')" :error="form.errors.value.email" /> -->
    </FormContainer>
  </div>
</template>
`

  // EditView.vue
  const editViewContent = `<script setup lang="ts">
import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { useForm } from '@/composables'
import { ${camelName}Schema } from '@/modules/${camelName}/schema'
import { ${camelName}Service } from '@/services/${camelName}Service'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const { data: item, isLoading } = useQuery({
  queryKey: ['${pluralSnake}', id],
  queryFn: () => ${camelName}Service.get(id),
  retry: false,
  refetchOnWindowFocus: false,
})

const form = useForm({
  resourceName: '${pluralSnake}',
  action: 'update',
  schema: ${camelName}Schema,
  mutationFn: (data) => ${camelName}Service.update(id, data),
  onSuccess: () => router.push({ name: 'admin-${resourceName}' }),
})

watch(item, (newItem) => {
  if (newItem) form.setValues(newItem)
}, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('actions.edit') }} {{ t('${pluralSnake}.title', '${pascalName}') }}</h1>

    <div v-if="isLoading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>

    <FormContainer
      v-else
      :form="form"
      :is-edit="true"
      @cancel="router.push({ name: 'admin-${resourceName}' })"
    >
      <!-- TODO: Add your form fields here -->
      <!-- <InputField name="name" :label="t('${pluralSnake}.fields.name')" :error="form.errors.value.name" /> -->
      <!-- <InputField name="email" type="email" :label="t('${pluralSnake}.fields.email')" :error="form.errors.value.email" /> -->
    </FormContainer>
  </div>
</template>
`

  // ShowView.vue
  const showViewContent = `<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDetails } from '@/composables'
import { ${camelName}Service } from '@/services/${camelName}Service'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const { item, loading } = useDetails({
  resourceName: '${pluralSnake}',
  getFn: (id) => ${camelName}Service.get(id),
  autoLoadId: true
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('${pluralSnake}.title', '${pascalName}') }} {{ t('common.details', 'Details') }}</h1>
      <Button variant="ghost" @click="router.push({ name: 'admin-${resourceName}' })">{{ t('actions.back', 'Back') }}</Button>
    </div>

    <div class="rounded-xl border border-border bg-card">
      <div v-if="loading" class="py-12 text-center text-muted-foreground">{{ t('common.loading', 'Loading...') }}</div>
      <div v-else-if="item" class="grid grid-cols-2 gap-4 p-6">
        <!-- TODO: Add your detail fields here -->
        <!-- <div>
          <span class="text-sm text-muted-foreground">{{ t('${pluralSnake}.fields.name') }}</span>
          <p class="font-medium">{{ item.name }}</p>
        </div> -->
      </div>
    </div>
  </div>
</template>
`

  // ─── 3. Entity & Service ──────────────────────────────────────────

  const entityContent = `export interface ${pascalName} {
  [key: string]: unknown
  id: number
  // TODO: Add your entity fields here
  // name: string
  // email: string
  created_at: string
}
`

  const serviceContent = `import api from './api'
import type { ${pascalName}, PaginatedResponse } from '@/types'
import { ${ENDPOINT_KEY}_ENDPOINTS } from '@/modules/${camelName}/endpoints'

export const ${camelName}Service = {
  async list(params = {}) {
    const response = await api.get<PaginatedResponse<${pascalName}>>(${ENDPOINT_KEY}_ENDPOINTS.LIST, { params })
    return { data: response.data?.data || [], total: response.data?.total || 0 }
  },
  async get(id: string | number) {
    const response = await api.get<{ data: ${pascalName} }>(${ENDPOINT_KEY}_ENDPOINTS.GET(id))
    return (response.data as any)?.data || response.data
  },
  async create(data: Partial<${pascalName}>) {
    const response = await api.post<{ data: ${pascalName} }>(${ENDPOINT_KEY}_ENDPOINTS.CREATE, data)
    return (response.data as any)?.data || response.data
  },
  async update(id: string | number, data: Partial<${pascalName}>) {
    const response = await api.put<{ data: ${pascalName} }>(${ENDPOINT_KEY}_ENDPOINTS.UPDATE(id), data)
    return (response.data as any)?.data || response.data
  },
  async delete(id: string | number) {
    await api.delete(${ENDPOINT_KEY}_ENDPOINTS.DELETE(id))
  }
}
`

  // ─── 4. i18n Locale Files ─────────────────────────────────────────
  const i18nEnContent = `${JSON.stringify({
    title: pascalName,
    subtitle: `Manage ${pluralName}`,
    fields: {
      created_at: 'Created At',
    },
  }, null, 2)}\n`

  const i18nArContent = `${JSON.stringify({
    title: pascalName,
    subtitle: `إدارة ${pluralName}`,
    fields: {
      created_at: 'تاريخ الإنشاء',
    },
  }, null, 2)}\n`

  // ─── 5. Mock Data File (optional) ─────────────────────────────────
  const mockDataContent = `import { faker } from '@faker-js/faker'

export const ${camelName}MockData = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  // TODO: Add your mock fields here
  // name: faker.person.fullName(),
  // email: faker.internet.email(),
  // status: faker.helpers.arrayElement(['active', 'inactive']),
  created_at: faker.date.past().toISOString(),
}))
`

  // ─── 6. ActionsDropdown Partial (optional) ────────────────────
  const deleteVCanDirective = hasPermissions ? `\n      <DropdownMenuItem variant="destructive" v-can="'${permissionKey}.manage'" @click="$emit('delete')">` : `\n      <DropdownMenuItem variant="destructive" @click="$emit('delete')">`

  const actionsDropdownContent = `<script setup lang="ts">
import { MoreVerticalIcon${hasShow ? ', ViewIcon' : ''}${hasEdit ? ', Edit02Icon' : ''}, Delete02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/uic/dropdown-menu'

defineProps<{
  row: Record<string, unknown>
  deleteLoading?: boolean
}>()

defineEmits<{
  (e: 'view'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="flex items-center justify-end">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button size="sm" variant="ghost" class="h-8 w-8 p-0">
          <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-40">${hasShow
        ? `
        <DropdownMenuItem @click="$emit('view')">
          <HugeiconsIcon :icon="ViewIcon" :size="14" class="mr-2 text-muted-foreground" />
          View
        </DropdownMenuItem>`
        : ''}${hasEdit
        ? `
        <DropdownMenuItem @click="$emit('edit')">
          <HugeiconsIcon :icon="Edit02Icon" :size="14" class="mr-2 text-muted-foreground" />
          Edit
        </DropdownMenuItem>`
        : ''}
        <DropdownMenuSeparator />${deleteVCanDirective}
          <HugeiconsIcon :icon="Delete02Icon" :size="14" class="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
`

  // ─── Safe Write Helper ─────────────────────────────────────────
  function safeWrite(filePath: string, content: string, label: string) {
    if (DRY_RUN) {
      const exists = fs.existsSync(filePath)
      console.warn(`  ${exists ? '⚠️  OVERWRITE' : '📄 CREATE'}  ${label}`)
      return
    }
    if (fs.existsSync(filePath) && !FORCE) {
      console.warn(`  ⏭️  ${label}  (already exists, use --force to overwrite)`)
      return
    }
    fs.writeFileSync(filePath, content)
    console.warn(`  ✅ ${label}`)
  }

  // ═══ Write Files ════════════════════════════════════════════════
  if (DRY_RUN) {
    console.warn('\n  🔍 Dry run — no files will be written\n')
  }
  else {
    console.warn('\n  ⏳ Generating modular files...\n')
  }

  if (!DRY_RUN) {
    fs.mkdirSync(filePaths.moduleDir, { recursive: true })
    fs.mkdirSync(filePaths.viewDir, { recursive: true })
    if (isDropdown) {
      fs.mkdirSync(path.join(filePaths.viewDir, 'partials'), { recursive: true })
    }
    if (hasMock) {
      fs.mkdirSync(path.dirname(filePaths.mockData), { recursive: true })
    }
  }

  // Core files (always generated)
  safeWrite(moduleFiles.schema, schemaContent, `src/modules/${camelName}/schema.ts`)
  safeWrite(moduleFiles.index, moduleRouterContent, `src/modules/${camelName}/index.ts`)
  safeWrite(moduleFiles.endpoints, endpointsContent, `src/modules/${camelName}/endpoints.ts`)
  safeWrite(filePaths.entityType, entityContent, `src/types/entities/${resourceName}.ts`)
  safeWrite(filePaths.service, serviceContent, `src/services/${camelName}Service.ts`)

  // Views (conditional)
  safeWrite(viewFiles.indexView, indexViewContent, `src/views/admin/${camelName}/IndexView.vue`)
  if (hasCreate)
    safeWrite(viewFiles.createView, createViewContent, `src/views/admin/${camelName}/CreateView.vue`)
  if (hasEdit)
    safeWrite(viewFiles.editView, editViewContent, `src/views/admin/${camelName}/EditView.vue`)
  if (hasShow)
    safeWrite(viewFiles.showView, showViewContent, `src/views/admin/${camelName}/ShowView.vue`)

  // Partials (conditional)
  if (isDropdown)
    safeWrite(viewFiles.actionsDropdown, actionsDropdownContent, `src/views/admin/${camelName}/partials/ActionsDropdown.vue`)

  // i18n files
  safeWrite(filePaths.i18nEn, i18nEnContent, `src/i18n/locales/en/${pluralSnake}.json`)
  safeWrite(filePaths.i18nAr, i18nArContent, `src/i18n/locales/ar/${pluralSnake}.json`)

  // Mock data (optional)
  if (hasMock) {
    safeWrite(filePaths.mockData, mockDataContent, `src/services/mock/${camelName}Mock.ts`)
  }

  // ─── Append to existing files (skip in dry-run) ─────────────────
  if (DRY_RUN) {
    console.warn('\n  📋 Append operations (would be applied):')
  }

  // types/index.ts
  const typesIndexContent = fs.readFileSync(filePaths.typesIndex, 'utf8')
  const entityExportLine = `export * from './entities/${resourceName}'`
  if (!typesIndexContent.includes(entityExportLine)) {
    if (!DRY_RUN) {
      const lines = typesIndexContent.split('\n')
      const lastEntityIdx = lines.findLastIndex(l => l.includes('./entities/'))
      if (lastEntityIdx >= 0) {
        lines.splice(lastEntityIdx + 1, 0, entityExportLine)
      }
      else {
        lines.push(entityExportLine)
      }
      fs.writeFileSync(filePaths.typesIndex, lines.join('\n'))
    }
    console.warn(`  ✅ src/types/index.ts  (added entity export)`)
  }

  // router/index.ts
  const routerContent = fs.readFileSync(filePaths.router, 'utf8')
  const moduleImport = `import '../modules/${camelName}'`
  if (!routerContent.includes(moduleImport)) {
    if (!DRY_RUN) {
      const lines = routerContent.split('\n')
      const markerIdx = lines.findIndex(l => l.includes('Module Imports'))
      if (markerIdx >= 0) {
        const insertIdx = lines.findIndex((l, i) => i > markerIdx && !l.startsWith('import'))
        lines.splice(insertIdx >= 0 ? insertIdx : markerIdx + 1, 0, moduleImport)
      }
      else {
        const modulesImportIdx = lines.findIndex(l => l.includes('./modules'))
        if (modulesImportIdx >= 0) {
          lines.splice(modulesImportIdx + 1, 0, '// ─── Module Imports ─────────────', moduleImport)
        }
        else {
          const lastImport = lines.findLastIndex(l => l.startsWith('import'))
          lines.splice(lastImport + 1, 0, '// ─── Module Imports ─────────────', moduleImport)
        }
      }
      fs.writeFileSync(filePaths.router, lines.join('\n'))
    }
    console.warn(`  ✅ src/router/index.ts  (registered module router)`)
  }

  // navigation.ts — auto-add nav item
  const navContent = fs.readFileSync(filePaths.navigation, 'utf8')
  if (!navContent.includes(`name: '${pluralSnake}'`)) {
    if (!DRY_RUN) {
      let currentNavContent = navContent
      const permLine = hasPermissions ? `\n        permission: '${permissionKey}.view',` : ''
      const permLineRoot = hasPermissions ? `\n    permission: '${permissionKey}.view',` : ''
      const navItemObjStr = [
        `      {`,
        `        name: '${pluralSnake}',`,
        `        label: 'menu.${pluralSnake}',`,
        `        to: '/admin/${camelName}',${permLine}`,
        `      },`,
      ].join('\n')

      if (navPlacement === 'root') {
        const lines = currentNavContent.split('\n')
        const closingIdx = lines.findLastIndex(l => l.trim() === ']')
        if (closingIdx >= 0) {
          const navItem = [
            `  {`,
            `    name: '${pluralSnake}',`,
            `    label: 'menu.${pluralSnake}',`,
            `    icon: Home01Icon,`,
            `    to: '/admin/${camelName}',${permLineRoot}`,
            `  },`,
          ].join('\n')
          lines.splice(closingIdx, 0, navItem)
          currentNavContent = lines.join('\n')
        }
      }
      else if (navPlacement === 'new_group') {
        if (!currentNavContent.includes(newGroupIcon)) {
          const importRegex = /import\s*\{([^}]+)\}\s*from\s*'@hugeicons\/core-free-icons'/
          currentNavContent = currentNavContent.replace(importRegex, (match, p1) => {
            return `import { ${p1.trim()}, ${newGroupIcon} } from '@hugeicons/core-free-icons'`
          })
        }
        const lines = currentNavContent.split('\n')
        const closingIdx = lines.findLastIndex(l => l.trim() === ']')
        if (closingIdx >= 0) {
          const groupNameSnake = toSnakeCase(newGroupName)
          const newGroupStr = [
            `  {`,
            `    name: '${groupNameSnake}',`,
            `    label: 'menu.${groupNameSnake}',`,
            `    icon: ${newGroupIcon},`,
            `    children: [`,
            navItemObjStr,
            `    ]`,
            `  },`,
          ].join('\n')
          lines.splice(closingIdx, 0, newGroupStr)
          currentNavContent = lines.join('\n')
        }
      }
      else if (navPlacement === 'existing_group') {
        const targetGroup = selectedGroup
        const groupPattern = new RegExp(`(name:\\s*'${targetGroup}'[\\s\\S]*?children:\\s*\\[)`)
        currentNavContent = currentNavContent.replace(groupPattern, `$1\n${navItemObjStr}`)
      }

      fs.writeFileSync(filePaths.navigation, currentNavContent)
    }
    console.warn(`  ✅ src/config/navigation.ts  (added nav item to ${navPlacement})`)
  }

  // menu.json — auto-add menu key
  function addMenuKey(filePath: string, key: string, value: string, label: string) {
    const content = fs.readFileSync(filePath, 'utf8')
    const json = JSON.parse(content)
    if (!json[key]) {
      json[key] = value
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`)
      }
      console.warn(`  ✅ ${label}  (added menu.${key})`)
    }
  }
  if (navPlacement === 'new_group') {
    const groupSnake = toSnakeCase(newGroupName)
    addMenuKey(filePaths.menuEn, groupSnake, toPascalCase(newGroupName), 'src/i18n/locales/en/menu.json')
    addMenuKey(filePaths.menuAr, groupSnake, newGroupName, 'src/i18n/locales/ar/menu.json')
  }
  addMenuKey(filePaths.menuEn, pluralSnake, pascalName, 'src/i18n/locales/en/menu.json')
  addMenuKey(filePaths.menuAr, pluralSnake, pascalName, 'src/i18n/locales/ar/menu.json')

  // ─── Done ──────────────────────────────────────────────────────
  console.warn(`\n✨ Module ${DRY_RUN ? 'preview' : 'scaffolded'} successfully!\n`)
  console.warn('  📝 Next steps:')
  console.warn(`     1. Define fields in src/modules/${camelName}/schema.ts`)
  console.warn(`     2. Add columns in src/views/admin/${camelName}/IndexView.vue`)
  if (hasCreate || hasEdit)
    console.warn(`     3. Add form fields in CreateView.vue / EditView.vue`)
  if (hasShow)
    console.warn(`     4. Add detail fields in ShowView.vue`)
  console.warn(`     5. Update the entity type in src/types/entities/${resourceName}.ts`)
  console.warn(`     6. Add more i18n keys in src/i18n/locales/{en,ar}/${pluralSnake}.json`)
  console.warn(`     7. Update Arabic menu label in src/i18n/locales/ar/menu.json`)
  if (hasMock)
    console.warn(`     8. Add mock fields in src/services/mock/${camelName}Mock.ts`)
  console.warn('')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
