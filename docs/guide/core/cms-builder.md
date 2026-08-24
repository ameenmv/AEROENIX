# CMS Page Builder

> **Complete documentation for the Abajora Headless CMS dashboard module.**

The CMS Page Builder is a comprehensive, headless CMS system built into the dashboard that allows administrators to dynamically create pages, define their structure (sections & fields), manage bilingual content (EN/AR), and control publishing — all without writing code.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Concepts](#key-concepts)
3. [Module Structure](#module-structure)
4. [Developer vs Client Mode](#developer-vs-client-mode)
5. [Pages](#pages)
6. [Sections](#sections)
7. [Field Types](#field-types)
8. [Content Editing](#content-editing)
9. [Reusable Sections Library](#reusable-sections-library)
10. [SEO Management](#seo-management)
11. [Services & API Layer](#services--api-layer)
12. [Routing](#routing)
13. [i18n Keys](#i18n-keys)
14. [Conditional Fields](#conditional-fields)

---

## Architecture Overview

The CMS follows a **headless, two-phase** architecture:

```
┌─────────────────────────────────────────────────┐
│              STRUCTURE (Schema)                  │
│  Admin defines: Pages → Sections → Fields        │
│  (Views: BuilderFormView, PageSectionsView)       │
└────────────────────────┬────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────┐
│              CONTENT (Data)                      │
│  Admin fills: Field values per locale (EN / AR)  │
│  (Views: PageEditorView, ReusableContentView)    │
└────────────────────────┬────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────┐
│            WEBSITE (Frontend)                    │
│  Fetches: Published pages + section content      │
│  Renders: Based on field types & schema          │
└─────────────────────────────────────────────────┘
```

### Separation of Concerns

| Layer       | Responsibility                           | Files                                           |
|-------------|------------------------------------------|--------------------------------------------------|
| **Types**   | TypeScript interfaces & payloads         | `src/types/cms.ts`                               |
| **Services**| API calls (Axios-based, no mocks)        | `src/services/cmsService.ts`, `cmsSeoService.ts` |
| **Views**   | Page components                          | `src/views/admin/cms/*.vue`                      |
| **Components** | Reusable CMS UI elements              | `src/components/ui/cms/**/*.vue`                 |
| **Composable** | CMS developer/client mode toggle      | `src/composables/useCmsMode.ts`                  |
| **Module**  | Route registration                       | `src/modules/cms-builder.ts`                     |

---

## Key Concepts

| Concept             | Description                                                                       |
|---------------------|-----------------------------------------------------------------------------------|
| **Page**            | A CMS page identified by bilingual slugs (e.g. `home`, `about`)                   |
| **Section**         | A named block within a page (e.g. `hero_banner`, `features_grid`)                 |
| **Field**           | A data entry within a section (e.g. `heading`, `hero_image`, `show_cta`)          |
| **Content**         | The actual field values, stored **per-locale** (`en`, `ar`)                       |
| **Draft**           | Content saved but not yet published (`status: 0`)                                 |
| **Published**       | Content promoted to live (`status: 1`)                                             |
| **Reusable Section**| A library template that can be placed on multiple pages                           |
| **Content Mode**    | `shared` (same content for all pages) or `override` (per-page content)            |
| **Translatable**    | Field values vary per locale (EN/AR)                                               |
| **Condition**       | Field visibility depends on another field's value                                  |

---

## Module Structure

### File Map

```
src/
├── types/
│   └── cms.ts                          # All CMS TypeScript interfaces & payloads
├── services/
│   ├── cmsService.ts                   # 4 services: page, section, content, reusable
│   ├── cmsSeoService.ts                # SEO management service
│   ├── contentService.ts               # Static pages content service (separate)
│   └── tempUploadsService.ts           # Temporary file upload service
├── composables/
│   └── useCmsMode.ts                   # Developer/Client mode toggle
├── modules/
│   ├── cms-builder.ts                  # CMS route registration
│   └── content.ts                      # Static content route registration
├── views/admin/cms/
│   ├── BuilderIndexView.vue            # Pages list (DataTable)
│   ├── BuilderFormView.vue             # Create/Edit page metadata + SEO
│   ├── PageSectionsView.vue            # Sections structure editor (drag & drop)
│   ├── PageEditorView.vue              # Content editor (sidebar + locale tabs)
│   ├── ReusableLibraryView.vue         # Reusable sections library
│   └── ReusableContentView.vue         # Content editor for reusable sections
├── views/admin/content/
│   ├── ContentEditor.vue               # Static content section editor
│   └── ContentPageEditor.vue           # Static content page editor
├── components/ui/cms/
│   ├── CmsFieldRenderer.vue            # Dynamic field component router
│   ├── FieldTypePicker.vue             # Field type selection + config dialog
│   ├── PageSeoPanel.vue                # SEO editing panel (locale tabs)
│   ├── SectionCard.vue                 # Section card with actions
│   └── fields/                         # 15 field input components
│       ├── CmsTextField.vue
│       ├── CmsTextareaField.vue
│       ├── CmsTextEditorField.vue
│       ├── CmsNumberField.vue
│       ├── CmsBooleanField.vue
│       ├── CmsDateField.vue
│       ├── CmsEmailField.vue
│       ├── CmsPasswordField.vue
│       ├── CmsColorField.vue
│       ├── CmsEnumerationField.vue
│       ├── CmsMediaField.vue
│       ├── CmsRelationField.vue
│       ├── CmsComponentField.vue
│       ├── CmsJsonField.vue
│       └── CmsRichTextBlocksField.vue
└── i18n/locales/
    ├── en/cms.json                     # English CMS translations (240+ keys)
    └── ar/cms.json                     # Arabic CMS translations
```

---

## Developer vs Client Mode

The CMS supports two operational modes controlled by `useCmsMode()`:

| Feature                | Developer Mode         | Client Mode              |
|------------------------|------------------------|--------------------------|
| Schema editing (fields)| ✅ Full access          | ❌ Hidden                 |
| Section keys visible   | ✅ Yes                  | ❌ Hidden                 |
| Delete sections        | ✅ Yes                  | ❌ Hidden                 |
| Content editing        | ✅ Yes                  | ✅ Yes                    |
| Keyboard shortcut      | `Ctrl+Shift+D` toggle | `Ctrl+Shift+D` toggle    |

### Configuration

```env
# .env
VITE_CMS_MODE=developer   # or 'client' (default)
```

### Usage

```vue
<script setup lang="ts">
import { useCmsMode } from '@/composables/useCmsMode'

const { isDevMode, isClientMode, toggleMode, registerShortcut } = useCmsMode()

// Register Ctrl+Shift+D shortcut (call once)
registerShortcut()
</script>
```

---

## Pages

### Pages List (`BuilderIndexView.vue`)

The pages list uses `useTable` with `cmsPageService.list()`:

- **Columns**: ID, Page Name (translated), Slug, Sections Count, Status toggle, Last Updated, Actions
- **Filters**: Status (All/Published/Draft), Date range (From/To)
- **Actions**: Edit Content, Edit Structure, Publish/Unpublish toggle, Duplicate, Delete
- **Navigation**: Links to Reusable Library

### Create/Edit Page (`BuilderFormView.vue`)

Handles **page metadata only** (no sections):

- **Bilingual Title**: EN + AR inputs
- **Bilingual Slug**: Auto-generated from English title (snake_case), immutable in edit mode
- **SEO Panel**: Collapsible `PageSeoPanel` with locale tabs
- **Create**: `cmsPageService.create({ slug, title, seo })` — SEO sent atomically
- **Edit**: `cmsPageService.update(id, { title })` + `cmsSeoService.saveBatch(pageId, payload)`
- **Validation**: Title required, slug must be snake_case (`/^[a-z0-9_]+$/`)

### Page Actions

| Action    | Service Call                      | Notes                                     |
|-----------|-----------------------------------|--------------------------------------------|
| Create    | `cmsPageService.create(payload)`  | SEO can be included atomically             |
| Update    | `cmsPageService.update(id, data)` | Partial update supported                   |
| Delete    | `cmsPageService.delete(id)`       | Cascade deletes sections & content         |
| Publish   | `cmsPageService.publish(id)`      | Sets status=published, records published_at|
| Unpublish | `cmsPageService.unpublish(id)`    | Reverts to draft                           |
| Duplicate | `cmsPageService.duplicate(id)`    | Deep copy, UUID-suffixed slug, status=draft|

---

## Sections

### Sections Editor (`PageSectionsView.vue`)

The structure editor for a page's sections:

- **Drag & Drop**: Sections are reorderable via `vuedraggable` → `cmsSectionService.reorder()`
- **Inline Create Form**: Key, bilingual labels, field schema, is_repeatable
- **Inline Edit Form**: Appears below the section card being edited
- **Import from Library**: Dialog to pick a reusable section from the library
- **Toggle Visibility**: `POST /cms/sections/{id}/toggle` (optimistic update)
- **Toggle Repeatable**: `PUT /pages/{pageId}/sections/{sectionId}` with `{ is_repeatable }`

### Section Types

| Type            | Description                                               |
|-----------------|-----------------------------------------------------------|
| **Inline**      | Has `fields[]` array with field definitions                |
| **Reusable Ref**| Has `reusable_section_id`, no `fields[]` (XOR constraint) |

### XOR Guard (G4)

When creating a section, you must provide **either** `fields` (inline) **or** `reusable_section_id` (reference), **never both**.

### SectionCard Component

Each section is rendered as a `SectionCard` with:
- Drag handle, section label (localized), key (monospace), field count
- Badges: Hidden, Reusable, Repeatable
- Actions: Edit, Delete, Toggle visibility, Toggle repeatable
- Field type pills with color coding

---

## Field Types

The CMS supports **15 field types**. See [CMS Field Types Reference](./cms-field-types.md) for complete details.

| Type               | Content Value                | Component                      |
|--------------------|------------------------------|--------------------------------|
| `text`             | `string`                     | `CmsTextField`                 |
| `textarea`         | `string`                     | `CmsTextareaField`             |
| `text_editor`      | `string` (HTML)              | `CmsTextEditorField`           |
| `number`           | `number`                     | `CmsNumberField`               |
| `boolean`          | `boolean`                    | `CmsBooleanField`              |
| `date`             | `string` (ISO 8601)          | `CmsDateField`                 |
| `email`            | `string`                     | `CmsEmailField`                |
| `password`         | `string`                     | `CmsPasswordField`             |
| `color`            | `string` (#hex/rgb/hsl)      | `CmsColorField`                |
| `enumeration`      | `string`                     | `CmsEnumerationField`          |
| `media`            | `string` (UUID)              | `CmsMediaField`                |
| `relation`         | `number` or `number[]`       | `CmsRelationField`             |
| `component`        | `object` or `object[]`       | `CmsComponentField`            |
| `json`             | `any`                        | `CmsJsonField`                 |
| `rich_text_blocks`  | `object[]`                   | `CmsRichTextBlocksField`       |

---

## Content Editing

### Page Content Editor (`PageEditorView.vue`)

The main content editing experience:

**Layout**:
- **Left sidebar**: Section navigator with clickable list and status indicators (colored dots per locale)
- **Main area**: Active section's content form
- **Top bar**: Page title, locale switcher (EN/AR tabs), Save All button

**Workflow**:
1. Select a section from the sidebar
2. Switch locale tab (EN or AR)
3. Edit field values using the dynamic `CmsFieldRenderer`
4. Save draft (single locale, batch, or page-level save all)
5. Publish content per locale independently

### Content Store

Content is managed as a reactive store:

```typescript
// sectionId → locale → { fieldKey: value }
const contentStore = reactive<Record<number, Record<string, Record<string, any>>>>({})

// sectionId → locale → status (0=draft, 1=published)
const contentStatus = reactive<Record<number, Record<string, number>>>({})
```

### Save Options

| Action          | Service Call                                           | Scope                    |
|-----------------|--------------------------------------------------------|--------------------------|
| Save Locale     | `cmsSectionContentService.saveDraft(sectionId, payload)` | One section, one locale |
| Save Both       | `cmsSectionContentService.saveBatch(sectionId, payload)` | One section, all locales|
| Save All        | `cmsPageService.batchContent(pageId, payload)`           | All sections, all locales|
| Publish Locale  | `cmsSectionContentService.publish(sectionId, payload)`   | One section, one locale |

### Reusable Section Content Modes

- **`shared`**: Read-only in page editor; shows "Edit in Library" notice with purple background
- **`override`**: Editable per-page; each page has its own content for this section

### CmsFieldRenderer

The `CmsFieldRenderer` component is the central dynamic field router:

1. Receives: `field` (schema definition), `modelValue`, `siblingValues`, `locale`, `error`
2. Evaluates `condition` based on sibling values
3. Hides field with transition if condition not met
4. Renders the correct field component via `fieldComponentMap`
5. Passes type-specific props (min/max, options, allowedTypes, etc.)

---

## Reusable Sections Library

### Library View (`ReusableLibraryView.vue`)

Lists all reusable section templates:

- **Card-based layout**: Each item shows label, key, field count, pages using count
- **Field pills**: Color-coded field type badges (first 8 shown, rest collapsed)
- **Inline Create/Edit Forms**: Same pattern as PageSectionsView
- **Actions**: Edit Content, Edit Schema, Toggle visibility, Delete

### Content Editor (`ReusableContentView.vue`)

Same UX as `PageEditorView` but for a single reusable section:

- Locale tabs (EN/AR)
- Status badge (Empty/Draft/Published)
- **Client-side validation** before save:
  - Required fields
  - Min/max length
  - Email format
  - Number range
  - Regex pattern
- Save: `cmsReusableService.saveBatchContent(id, payload)`
- Publish: `cmsReusableService.publishContent(id, { locales })` — **G7: Flushes cache for ALL referencing pages**

### Guardrails

| Code | Rule                                                                     |
|------|--------------------------------------------------------------------------|
| **G3** | Cannot delete a reusable section if any pages reference it             |
| **G4** | Section create: provide `fields` OR `reusable_section_id`, never both  |
| **G7** | Publishing reusable content flushes cache for ALL referencing pages     |

---

## SEO Management

### PageSeoPanel Component

A collapsible panel with locale tabs (EN/AR):

**Fields per locale**:
- Title, Description, Keywords
- Canonical URL
- Robots (dropdown with presets: `index,follow`, `noindex,nofollow`, etc.)
- Open Graph: Title, Description, Image (UUID temp upload)
- Twitter: Card type, Title, Description
- **Google SERP Preview**: Live preview card

**Data shape emitted**:
```typescript
{
  en: { is_default: true, title: '...', description: '...', robots: 'index,follow', ... },
  ar: { title: '...', description: '...', ... }
}
```

**Save methods**:
- **Inline on create**: Sent atomically with `POST /cms/pages` body
- **Batch update**: `cmsSeoService.saveBatch(pageId, { default: 'en', locales: {...} })`

---

## Services & API Layer

See [CMS API Reference](./cms-api-reference.md) for the complete endpoint documentation.

### Service Objects

The CMS uses **4 service objects** (no mocks):

| Service                      | Purpose                                      |
|------------------------------|----------------------------------------------|
| `cmsPageService`             | Pages CRUD + publish/unpublish/duplicate      |
| `cmsSectionService`          | Sections CRUD + reorder/toggle                |
| `cmsSectionContentService`   | Section content (draft/publish per locale)    |
| `cmsReusableService`         | Reusable Library CRUD + content + publish     |
| `cmsSeoService`              | Per-locale SEO metadata management            |
| `cmsConfigService`           | Relation models, builder status               |

### Backward Compatibility Shims

Legacy services are preserved as thin wrappers (deprecated):

- `cmsBuilderService` → delegates to `cmsPageService`
- `cmsContentService` → logs deprecation warning

---

## Routing

### Module Registration (`cms-builder.ts`)

```typescript
registerModule({
  name: 'cms-builder',
  path: 'admin/cms',
  icon: LayoutLeftIcon,
  order: 90,
  routes: [
    // Pages list (parent)
    { path: 'admin/cms', name: 'admin-cms', component: BuilderIndexView },
    
    // Children (openMode: 'full')
    { path: 'create', name: 'admin-cms-create', component: BuilderFormView },
    { path: ':id/edit', name: 'admin-cms-edit', component: BuilderFormView },
    { path: ':id/sections', name: 'admin-cms-sections', component: PageSectionsView },
    { path: ':id/content', name: 'admin-cms-content', component: PageEditorView },
    
    // Reusable Library (standalone routes)
    { path: 'admin/cms/reusable', name: 'admin-cms-reusable', component: ReusableLibraryView },
    { path: 'admin/cms/reusable/:id/content', name: 'admin-cms-reusable-content', component: ReusableContentView },
  ],
})
```

### Navigation Flow

```
BuilderIndexView (pages list)
  ├── BuilderFormView (create page)
  ├── BuilderFormView (edit page metadata/SEO)
  ├── PageSectionsView (edit structure)
  │   └── Import from Library dialog
  ├── PageEditorView (edit content)
  └── ReusableLibraryView (library)
      └── ReusableContentView (library content)
```

---

## i18n Keys

CMS translations are in namespace `cms`:

- **English**: `src/i18n/locales/en/cms.json` (240+ keys)
- **Arabic**: `src/i18n/locales/ar/cms.json`

Key categories:
- `cms.builder_*` — Builder UI labels
- `cms.type_*` — Field type names and descriptions
- `cms.seo_*` — SEO panel labels
- `cms.error_*` — Validation error messages
- `cms.placeholder_*` — Input placeholders

Run `bun i18n:report` to check for missing translations.

---

## Conditional Fields

Fields can have conditional visibility based on sibling values:

```json
{
  "key": "cta_label",
  "type": "text",
  "condition": {
    "field": "show_cta",
    "operator": "eq",
    "value": true
  }
}
```

### Supported Operators

| Operator       | Description          |
|----------------|----------------------|
| `eq`           | Equals               |
| `neq` / `ne`   | Not equals           |
| `in`           | Value in array       |
| `not_in`       | Value not in array   |
| `gt`           | Greater than         |
| `lt`           | Less than            |
| `gte`          | Greater or equal     |
| `lte`          | Less or equal        |
| `contains`     | String contains      |
| `not_contains` | String doesn't contain|

The `CmsFieldRenderer` evaluates conditions in real-time and uses a `<Transition name="fade">` to smoothly show/hide fields.
