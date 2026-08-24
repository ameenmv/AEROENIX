# CMS Components Reference

> **Documentation for all CMS UI components and views.**

---

## Views

### BuilderIndexView

**File**: `src/views/admin/cms/BuilderIndexView.vue`  
**Route**: `/admin/cms` (`admin-cms`)

The main pages list view showing a DataTable of all CMS pages.

**Features**:
- DataTable with search, pagination, and server-side data
- Status filter (All / Published / Draft) + date range filters
- Context menu with: Edit Content, Edit Structure, Publish/Unpublish, Duplicate, Delete
- Inline publish/unpublish toggle with optimistic updates
- Links to Reusable Library

**Key imports**: `useTable`, `cmsPageService`, `DataTable`, `ConfirmModal`

---

### BuilderFormView

**File**: `src/views/admin/cms/BuilderFormView.vue`  
**Route**: `/admin/cms/create` or `/admin/cms/:id/edit`

Create or edit page metadata (title, slug) and SEO settings.

**Features**:
- Bilingual title/slug inputs with auto-slug generation
- Slug validation (snake_case only)
- Collapsible SEO panel (`PageSeoPanel`)
- Skeleton loading state for edit mode
- Backend error handling (422 validation)

**Mode detection**: Uses `route.params.id` to determine create vs edit mode.

**Create flow**: `cmsPageService.create({ slug, title, seo })`  
**Edit flow**: `cmsPageService.update(id, { title })` + `cmsSeoService.saveBatch(pageId, payload)`

---

### PageSectionsView

**File**: `src/views/admin/cms/PageSectionsView.vue`  
**Route**: `/admin/cms/:id/sections`

The structure editor for a page's sections.

**Features**:
- Drag-and-drop reordering with `vuedraggable`
- Inline create form with `FieldTypePicker`
- Inline edit form (appears below the edited section card)
- Import from Reusable Library dialog
- Toggle visibility, toggle repeatable, delete with confirmation
- Field type → `CmsFieldDefinition` mapping functions

**Key functions**:
- `mapPickerFieldToDefinition()` — Converts FieldTypePicker output to backend format
- `mapDefinitionToPickerField()` — Converts backend format to FieldTypePicker format (for editing)
- `autoGenerateKey()` — Creates snake_case key from English label

---

### PageEditorView

**File**: `src/views/admin/cms/PageEditorView.vue`  
**Route**: `/admin/cms/:id/content`

The main content editing experience.

**Layout**:
```
┌──────────────────────────────────────────────────┐
│ ← Back    Page Title [Content]    [EN|AR] Save All│
├──────────────┬───────────────────────────────────┤
│ Sections     │ Section Header  [Status] [Actions]│
│ ● Hero       │                                   │
│ ○ Features   │ English Content                   │
│ ○ Footer     │ ┌─ Field 1 ──────────────────┐    │
│              │ │  value                      │    │
│              │ └────────────────────────────┘    │
│              │ ┌─ Field 2 ──────────────────┐    │
│              │ │  value                      │    │
│              │ └────────────────────────────┘    │
│              │                                   │
│              │ 3 fields · EN  [Save Both] [Save] │
└──────────────┴───────────────────────────────────┘
```

**Section Navigator Sidebar**:
- Clickable section list
- Status dots per locale: 🟢 published, 🟡 draft, ⚪ empty
- Hidden sections shown with opacity

**Content Panel**:
- Section header with label, key, badges (Hidden, Reusable)
- Shared content notice for `content_mode: 'shared'` sections
- Dynamic field rendering via `CmsFieldRenderer`
- No fields / No sections empty states

**Save Options**:
- Save current locale (`handleSaveSection`)
- Save both locales (`handleSaveSectionBatch`)
- Save all sections (`handleSaveAll`)
- Publish current locale (`handlePublishSection`)

---

### ReusableLibraryView

**File**: `src/views/admin/cms/ReusableLibraryView.vue`  
**Route**: `/admin/cms/reusable`

Library of reusable section templates.

**Features**:
- Card-based layout with field type pills
- Create, edit (inline), delete, toggle visibility
- Navigate to content editor
- G3 guard: Shows user-friendly error when trying to delete a section in use
- Deep-link edit via `?edit={id}` query parameter

---

### ReusableContentView

**File**: `src/views/admin/cms/ReusableContentView.vue`  
**Route**: `/admin/cms/reusable/:id/content`

Content editor for a single reusable section.

**Features**:
- Locale tabs (EN/AR) with status badge
- Client-side validation: required, min/max length, email, number range, regex
- Validation error switching: auto-switches to locale with errors if current has none
- Save batch (`cmsReusableService.saveBatchContent`)
- Publish per locale (`cmsReusableService.publishContent`)

---

## CMS UI Components

### CmsFieldRenderer

**File**: `src/components/ui/cms/CmsFieldRenderer.vue`

Dynamic field component router. See [CMS Field Types](./cms-field-types.md) for detailed documentation.

**Props**: `field`, `modelValue`, `siblingValues`, `locale`, `error`  
**Emits**: `update:modelValue`

---

### FieldTypePicker

**File**: `src/components/ui/cms/FieldTypePicker.vue`

Dialog for selecting and configuring field types when creating/editing sections.

**Features**:
- Categorized grid of all 15 field types
- Type-specific configuration panel
- Advanced settings (required, translatable, private, regex, condition)
- Edit mode: pre-fills with existing field definition
- Emits complete field definition object

**Props**: `open`, `existingField` (for edit mode)  
**Emits**: `add:field`, `update:field`, `close`

---

### PageSeoPanel

**File**: `src/components/ui/cms/PageSeoPanel.vue`

Collapsible SEO editing panel with locale tabs.

**Features**:
- EN / AR locale tabs
- All SEO fields: title, description, keywords, canonical, robots
- Open Graph: title, description, image
- Twitter: card type, title, description
- Google SERP preview card
- Robots dropdown with presets

**Props**: `modelValue` (SEO data object), `open`  
**Emits**: `update:modelValue`, `update:open`

---

### SectionCard

**File**: `src/components/ui/cms/SectionCard.vue`

Card component for displaying a section in the sections editor.

**Features**:
- Drag handle for reordering
- Section label (localized), key (monospace), field count
- Badges: Hidden 👁️‍🗨️, Reusable 🔗, Repeatable 🔄
- Collapsible field schema preview with colored type pills
- Action buttons: Edit, Delete, Toggle visibility, Toggle repeatable

**Props**: `section`, `index`, `total`, `toggling`, `deleting`, `togglingRepeatable`  
**Emits**: `edit`, `delete`, `toggle`, `toggle-repeatable`

---

## Field Components

All field components are in `src/components/ui/cms/fields/` and follow a consistent API:

### Common Props

| Prop         | Type      | Description                |
|--------------|-----------|----------------------------|
| `modelValue` | `any`     | Current field value        |
| `label`      | `string`  | Display label (localized)  |
| `fieldKey`   | `string`  | Field key for identification|
| `required`   | `boolean` | Whether field is required  |

### Common Emits

| Event               | Payload | Description        |
|---------------------|---------|--------------------|
| `update:modelValue` | `any`   | Value changed      |

### Type-Specific Props

| Component             | Extra Props                                              |
|-----------------------|----------------------------------------------------------|
| `CmsTextField`        | `minLength`, `maxLength`                                 |
| `CmsTextareaField`    | `minLength`, `maxLength`                                 |
| `CmsTextEditorField`  | `maxLength`                                              |
| `CmsNumberField`      | `numberType`, `min`, `max`                               |
| `CmsBooleanField`     | —                                                        |
| `CmsDateField`        | `dateType`, `format`                                     |
| `CmsEmailField`       | —                                                        |
| `CmsPasswordField`    | —                                                        |
| `CmsColorField`       | `colorFormat`                                            |
| `CmsEnumerationField` | `options`                                                |
| `CmsMediaField`       | `multiple`, `allowedTypes`                               |
| `CmsRelationField`    | `relationType`, `modelTable`                             |
| `CmsComponentField`   | `componentRef`, `repeatable`                             |
| `CmsJsonField`        | —                                                        |
| `CmsRichTextBlocksField` | —                                                     |

---

## Composables

### useCmsMode

**File**: `src/composables/useCmsMode.ts`

Controls developer vs client mode for the CMS Builder.

**API**:

```typescript
const {
  cmsMode,          // Ref<'developer' | 'client'>
  isDevMode,        // ComputedRef<boolean>
  isClientMode,     // ComputedRef<boolean>
  toggleMode,       // () => void — toggles and shows toast
  registerShortcut, // () => void — registers Ctrl+Shift+D (idempotent)
} = useCmsMode()
```

**Configuration**:
- `VITE_CMS_MODE` env variable: `'developer'` or `'client'` (default)
- `sessionStorage` override via keyboard toggle
- Toast notification on mode change

---

## TypeScript Interfaces

All CMS types are in `src/types/cms.ts`. Key interfaces:

### Core Types

```typescript
type CmsFieldType = 'text' | 'textarea' | 'text_editor' | 'number' | 'boolean'
  | 'date' | 'email' | 'password' | 'color' | 'enumeration' | 'media'
  | 'relation' | 'component' | 'json' | 'rich_text_blocks'

interface CmsPage { id, uuid?, slug, title, type?, status, meta?, published_at?, sections?, seo_metas? }
interface CmsSection { id, uuid?, key, label, fields, order, is_hidden, is_reusable?, is_repeatable?, ... }
interface CmsReusableSection { id, uuid?, key, label, fields, is_repeatable, content_mode, ... }
interface CmsFieldDefinition { key, label, type, required?, translatable?, default?, private?, condition?, ... }
interface CmsSectionTranslation { locale, status, content, is_default? }
interface CmsSeoMeta { locale?, is_default?, title?, description?, keywords?, canonical_url?, ... }
```

### Request Payloads

```typescript
interface CreatePagePayload { slug, title, seo? }
interface UpdatePagePayload { slug?, title?, meta? }
interface CreateInlineSectionPayload { page_id, key, label, order?, fields, is_repeatable?, is_hidden? }
interface CreateReusableRefPayload { page_id, key, label, order?, reusable_section_id, ... }
interface UpdateSectionPayload { label?, order?, fields?, is_repeatable?, is_hidden? }
interface SingleLocaleContentPayload { locale, is_default?, content }
interface BatchContentPayload { default, locales }
interface PageBatchContentPayload { default, sections }
interface PublishContentPayload { locales? }
interface ReorderPayload { items: { id, order }[] }
interface SingleSeoPayload extends CmsSeoMeta { locale, is_default? }
interface BatchSeoPayload { default, locales }
interface CreateReusablePayload { key, label, is_repeatable?, content_mode, fields }
interface UpdateReusablePayload { label?, fields?, is_repeatable?, content_mode? }
```

### Backward Compatibility

Deprecated aliases are maintained for gradual migration:

```typescript
type CmsSectionDefinition = CmsSection        // @deprecated
type CmsPageDefinition = CmsPage              // @deprecated
type CmsSeoLocale = CmsSeoMeta               // @deprecated
type CmsCreatePagePayload = CreatePagePayload // @deprecated

interface CmsSectionField extends CmsFieldDefinition {
  bilingual?: boolean  // Alias for 'translatable'
  sortOrder?: number   // UI-only
  config?: CmsFieldConfig // Legacy picker config
}
```
