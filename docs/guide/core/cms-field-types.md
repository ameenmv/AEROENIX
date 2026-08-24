# CMS Field Types Reference

> **Complete reference for all 15 field types supported by the Abajora CMS.**

Each field type has a dedicated Vue component in `src/components/ui/cms/fields/` and is rendered dynamically by the `CmsFieldRenderer`.

---

## Field Type Summary

| Type               | Content Value         | Component                  | Category       |
|--------------------|-----------------------|----------------------------|----------------|
| `text`             | `string`              | `CmsTextField`             | Text           |
| `textarea`         | `string`              | `CmsTextareaField`         | Text           |
| `text_editor`      | `string` (HTML)       | `CmsTextEditorField`       | Text           |
| `number`           | `number`              | `CmsNumberField`           | Data           |
| `boolean`          | `boolean`             | `CmsBooleanField`          | Data           |
| `date`             | `string` (ISO 8601)   | `CmsDateField`             | Data           |
| `email`            | `string`              | `CmsEmailField`            | Data           |
| `password`         | `string`              | `CmsPasswordField`         | Data           |
| `color`            | `string`              | `CmsColorField`            | Data           |
| `enumeration`      | `string`              | `CmsEnumerationField`      | Data           |
| `media`            | `string` (UUID/URL)   | `CmsMediaField`            | Media          |
| `relation`         | `number` / `number[]` | `CmsRelationField`         | Relational     |
| `component`        | `object` / `object[]` | `CmsComponentField`        | Advanced       |
| `json`             | `any`                 | `CmsJsonField`             | Advanced       |
| `rich_text_blocks`  | `object[]`            | `CmsRichTextBlocksField`   | Advanced       |

---

## Field Definition Schema

Every field shares these **universal properties**:

```typescript
interface CmsFieldDefinition {
  // Required
  key: string                    // snake_case, unique within section
  label: { en: string, ar: string }  // Bilingual display label
  type: CmsFieldType             // One of the 15 types

  // Optional universal
  required?: boolean             // Validation: field must have a value
  translatable?: boolean         // Content varies per locale (EN/AR)
  default?: any                  // Default value
  private?: boolean              // Hidden from public API
  regex_pattern?: string         // Custom regex validation
  condition?: CmsCondition       // Conditional visibility
}
```

---

## Text Fields

### `text`

Short single-line text input.

| Config Property | Type     | Description                |
|-----------------|----------|----------------------------|
| `min_length`    | `number` | Minimum character count    |
| `max_length`    | `number` | Maximum character count    |

**Usage**: Titles, headings, labels, short descriptions.

```json
{
  "key": "heading",
  "label": { "en": "Heading", "ar": "العنوان" },
  "type": "text",
  "translatable": true,
  "required": true,
  "max_length": 120
}
```

---

### `textarea`

Multi-line text input with character count.

| Config Property | Type     | Description                |
|-----------------|----------|----------------------------|
| `min_length`    | `number` | Minimum character count    |
| `max_length`    | `number` | Maximum character count    |

**Usage**: Paragraphs, descriptions, bios.

```json
{
  "key": "description",
  "label": { "en": "Description", "ar": "الوصف" },
  "type": "textarea",
  "translatable": true,
  "max_length": 500
}
```

---

### `text_editor`

Rich text editor with HTML output.

| Config Property | Type     | Description                |
|-----------------|----------|----------------------------|
| `max_length`    | `number` | Maximum character count    |

**Usage**: Article content, rich descriptions, formatted text.

**Content value**: HTML string (rendered with `v-html` on the frontend).

```json
{
  "key": "body",
  "label": { "en": "Body Content", "ar": "المحتوى" },
  "type": "text_editor",
  "translatable": true
}
```

---

## Data Fields

### `number`

Numeric input with type and range constraints.

| Config Property | Type                                    | Description          |
|-----------------|-----------------------------------------|----------------------|
| `number_type`   | `'integer'` \| `'float'` \| `'decimal'` | Number subtype       |
| `min`           | `number`                                | Minimum value        |
| `max`           | `number`                                | Maximum value        |

```json
{
  "key": "price",
  "label": { "en": "Price", "ar": "السعر" },
  "type": "number",
  "number_type": "decimal",
  "min": 0,
  "max": 99999
}
```

---

### `boolean`

Toggle switch (true/false).

| Config Property | Type  | Description        |
|-----------------|-------|--------------------|
| `default`       | `any` | Default value      |

**Usage**: Feature flags, show/hide toggles, enabled/disabled states.

```json
{
  "key": "show_cta",
  "label": { "en": "Show CTA", "ar": "إظهار زر الدعوة" },
  "type": "boolean",
  "default": true
}
```

---

### `date`

Date/time picker with configurable precision.

| Config Property | Type                                        | Description         |
|-----------------|---------------------------------------------|---------------------|
| `date_type`     | `'date'` \| `'datetime'` \| `'time'`        | Picker type         |
| `format`        | `string`                                    | Display format      |

```json
{
  "key": "event_date",
  "label": { "en": "Event Date", "ar": "تاريخ الحدث" },
  "type": "date",
  "date_type": "datetime"
}
```

**Content value**: ISO 8601 string (e.g. `"2026-06-15T14:30:00Z"`).

---

### `email`

Email input with built-in validation (`/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/`).

```json
{
  "key": "contact_email",
  "label": { "en": "Contact Email", "ar": "البريد الإلكتروني" },
  "type": "email",
  "required": true
}
```

---

### `password`

Password input (masked, generally not used in public pages).

```json
{
  "key": "api_secret",
  "label": { "en": "API Secret", "ar": "المفتاح السري" },
  "type": "password",
  "private": true
}
```

---

### `color`

Color picker with configurable format output.

| Config Property | Type                               | Description         |
|-----------------|------------------------------------|---------------------|
| `color_format`  | `'hex'` \| `'rgb'` \| `'hsl'`     | Output format       |

```json
{
  "key": "brand_color",
  "label": { "en": "Brand Color", "ar": "لون العلامة" },
  "type": "color",
  "color_format": "hex"
}
```

**Content value**: `"#FF5733"`, `"rgb(255,87,51)"`, or `"hsl(9,100%,60%)"`.

---

### `enumeration`

Dropdown selection from predefined options.

| Config Property | Type       | Description             |
|-----------------|------------|-------------------------|
| `options`       | `string[]` | Allowed values          |

```json
{
  "key": "layout",
  "label": { "en": "Layout", "ar": "التخطيط" },
  "type": "enumeration",
  "options": ["grid", "list", "carousel", "masonry"]
}
```

**Content value**: One of the `options[]` strings.

---

## Media Fields

### `media`

File upload via temporary upload service (sends UUID token).

| Config Property  | Type                                          | Description              |
|------------------|-----------------------------------------------|--------------------------|
| `multiple`       | `boolean`                                     | Allow multiple files     |
| `allowed_types`  | `('images' \| 'videos' \| 'documents' \| 'audio' \| 'all')[]` | File type filter |
| `min_items`      | `number`                                      | Min files (when multiple)|
| `max_items`      | `number`                                      | Max files (when multiple)|

```json
{
  "key": "hero_image",
  "label": { "en": "Hero Image", "ar": "صورة البطل" },
  "type": "media",
  "multiple": false,
  "allowed_types": ["images"]
}
```

**Content value**: UUID string from temp-uploads service. When fetched with `?scope=media.full`, expands to:

```json
{
  "hero_image": {
    "id": 42,
    "url": "https://example.com/storage/media/42/hero.jpg",
    "name": "hero.jpg",
    "mime_type": "image/jpeg",
    "size": 245800
  }
}
```

---

## Relational Fields

### `relation`

Searchable select linking to another resource.

| Config Property  | Type                                   | Description               |
|------------------|----------------------------------------|---------------------------|
| `relation_type`  | `'one_to_one'` \| `'one_to_many'`      | Cardinality               |
| `model_table`    | `string`                               | Backend model table name  |

```json
{
  "key": "admins",
  "label": { "en": "Admins", "ar": "المشرفون" },
  "type": "relation",
  "relation_type": "one_to_many",
  "model_table": "admins"
}
```

**Content value**: 
- `one_to_one`: `number` (single ID)
- `one_to_many`: `number[]` (array of IDs)

---

## Advanced Fields

### `component`

Nested structured data (recursive section form).

| Config Property  | Type      | Description                                     |
|------------------|-----------|-------------------------------------------------|
| `component_ref`  | `string`  | Key of a reusable section used as component schema |
| `repeatable`     | `boolean` | Allow multiple instances                         |

```json
{
  "key": "faq_items",
  "label": { "en": "FAQ Items", "ar": "أسئلة شائعة" },
  "type": "component",
  "component_ref": "faq_item",
  "repeatable": true
}
```

**Content value**: 
- Non-repeatable: `object` (single entry with nested field values)
- Repeatable: `object[]` (array of entries)

---

### `json`

Raw JSON editor with validation.

```json
{
  "key": "metadata",
  "label": { "en": "Metadata", "ar": "البيانات الوصفية" },
  "type": "json"
}
```

**Content value**: Any valid JSON (object, array, string, number, boolean, null).

---

### `rich_text_blocks`

Block-based editor content (like EditorJS).

```json
{
  "key": "article_content",
  "label": { "en": "Article Content", "ar": "محتوى المقال" },
  "type": "rich_text_blocks",
  "translatable": true
}
```

**Content value**: `object[]` — Array of block objects, each with `type` and `data`.

---

## Field Type Picker

The `FieldTypePicker` component (`src/components/ui/cms/FieldTypePicker.vue`) is a dialog that:

1. Shows all 15 field types in a categorized grid
2. Allows selecting a type
3. Presents type-specific configuration panel:
   - **Text/Textarea/Text Editor**: min/max length
   - **Number**: number_type, min/max value
   - **Date**: date_type (date/datetime/time)
   - **Media**: multiple toggle, allowed_types checkboxes, min/max items
   - **Enumeration**: options editor (add/remove values)
   - **Relation**: relation_type, model_table dropdown
   - **Color**: color_format dropdown
   - **Component**: component_ref, repeatable toggle
4. Shows advanced settings:
   - Required toggle
   - Translatable toggle
   - Private toggle
   - Regex pattern input
   - Condition builder (field key, operator dropdown, value)
5. Emits the complete field definition

### Field Type Color Map

Each field type has a distinct color for visual identification:

```typescript
const fieldTypeColors: Record<string, string> = {
  text:             'bg-blue-500/15 text-blue-500',
  textarea:         'bg-violet-500/15 text-violet-400',
  text_editor:      'bg-purple-500/15 text-purple-500',
  number:           'bg-rose-500/15 text-rose-500',
  boolean:          'bg-emerald-500/15 text-emerald-500',
  date:             'bg-amber-500/15 text-amber-500',
  email:            'bg-orange-500/15 text-orange-500',
  password:         'bg-red-500/15 text-red-500',
  color:            'bg-pink-500/15 text-pink-500',
  enumeration:      'bg-teal-500/15 text-teal-500',
  media:            'bg-pink-500/15 text-pink-500',
  relation:         'bg-indigo-500/15 text-indigo-500',
  component:        'bg-cyan-500/15 text-cyan-500',
  json:             'bg-slate-500/15 text-slate-400',
  rich_text_blocks: 'bg-fuchsia-500/15 text-fuchsia-500',
}
```

---

## CmsFieldRenderer

The `CmsFieldRenderer` (`src/components/ui/cms/CmsFieldRenderer.vue`) is the central dynamic field router:

### Props

| Prop            | Type                   | Description                              |
|-----------------|------------------------|------------------------------------------|
| `field`         | `CmsFieldDefinition`   | Field schema definition                  |
| `modelValue`    | `any`                  | Current field value                      |
| `siblingValues` | `Record<string, any>`  | All sibling field values (for conditions)|
| `locale`        | `string`               | Current locale (`'en'` or `'ar'`)        |
| `error`         | `string?`              | Validation error message                 |

### Behavior

1. **Condition evaluation**: Checks `field.condition` against `siblingValues` — hides field with fade transition if not met
2. **Label resolution**: Uses `locale` to pick the correct bilingual label
3. **Component routing**: Maps `field.type` to the correct component
4. **Extra props**: Passes type-specific config (min/max, options, allowedTypes, etc.)
5. **RTL support**: Sets `dir="rtl"` when `locale === 'ar'`
6. **Error display**: Shows inline error with red icon below the field

### Extra Props Mapping

The renderer extracts type-specific properties and passes them as camelCase props:

| Field Property    | Passed As     | Relevant Types                    |
|-------------------|---------------|-----------------------------------|
| `min_length`      | `minLength`   | text, textarea, text_editor       |
| `max_length`      | `maxLength`   | text, textarea, text_editor       |
| `number_type`     | `numberType`  | number                            |
| `min`             | `min`         | number                            |
| `max`             | `max`         | number                            |
| `date_type`       | `dateType`    | date                              |
| `format`          | `format`      | date                              |
| `color_format`    | `colorFormat` | color                             |
| `options`         | `options`     | enumeration                       |
| `multiple`        | `multiple`    | media                             |
| `allowed_types`   | `allowedTypes`| media                             |
| `relation_type`   | `relationType`| relation                          |
| `model_table`     | `modelTable`  | relation                          |
| `component_ref`   | `componentRef`| component                         |
| `repeatable`      | `repeatable`  | component                         |

---

## Conditional Visibility

Fields can be shown/hidden based on sibling field values:

```typescript
interface CmsCondition {
  field: string                    // Sibling field key
  operator: CmsConditionOperator   // Comparison operator
  value: any                       // Value to compare against
}
```

### Operators

| Operator       | Description          | Example                              |
|----------------|----------------------|--------------------------------------|
| `eq`           | Equals               | `show_cta == true`                   |
| `neq` / `ne`   | Not equals           | `layout != "minimal"`               |
| `in`           | Value in array       | `theme in ["dark", "blue"]`          |
| `not_in`       | Value not in array   | `type not_in ["hidden"]`             |
| `gt`           | Greater than         | `count > 5`                          |
| `lt`           | Less than            | `priority < 3`                       |
| `gte`          | Greater or equal     | `rating >= 4`                        |
| `lte`          | Less or equal        | `age <= 18`                          |
| `contains`     | String contains      | `tags contains "featured"`           |
| `not_contains` | String doesn't contain| `title not_contains "draft"`        |

### Example

```json
{
  "key": "cta_label",
  "type": "text",
  "translatable": true,
  "condition": {
    "field": "show_cta",
    "operator": "eq",
    "value": true
  }
}
```

When `show_cta` is `false`, `cta_label` smoothly fades out. When `show_cta` becomes `true`, it fades back in.
