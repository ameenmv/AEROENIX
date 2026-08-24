# CMS API Reference

> **Complete API endpoint documentation for the Abajora Headless CMS.**  
> Base URL: `{VITE_API_BASE_URL}/api/admin/v1`

---

## Authentication

All endpoints require:

| Header              | Value                                |
|---------------------|--------------------------------------|
| `Authorization`     | `Bearer {token}`                     |
| `Accept-Language`   | `en` or `ar`                         |
| `Content-Type`      | `application/json`                   |

---

## Pages (`/cms/pages`)

| # | Method   | Endpoint                          | Description                        |
|---|----------|-----------------------------------|------------------------------------|
| 1 | `GET`    | `/cms/pages`                      | List all pages (`?translated=true`)|
| 2 | `POST`   | `/cms/pages`                      | Create a new page (with optional SEO) |
| 3 | `GET`    | `/cms/pages/{id}`                 | Get single page (`?include=seoMetas,sections&translated=true`) |
| 4 | `PUT`    | `/cms/pages/{id}`                 | Update page metadata               |
| 5 | `DELETE` | `/cms/pages/{id}`                 | Delete a page                      |
| 6 | `POST`   | `/cms/pages/{id}/publish`         | Publish page                       |
| 7 | `POST`   | `/cms/pages/{id}/unpublish`       | Unpublish page                     |
| 8 | `POST`   | `/cms/pages/{id}/duplicate`       | Deep-copy page (UUID-suffixed slug, status=draft) |
| 9 | `POST`   | `/cms/pages/{id}/content/batch`   | Save ALL sections atomically       |

### Query Parameters

| Parameter     | Values            | Description                                    |
|---------------|-------------------|------------------------------------------------|
| `translated`  | `true`            | Returns bilingual objects for slug/title/label  |
| `include`     | `seoMetas,sections` | Eager-load related data                       |

### Create Page Payload

```json
{
  "slug": { "en": "about-us", "ar": "عن-نحن" },
  "title": { "en": "About Us", "ar": "من نحن" },
  "seo": {
    "en": {
      "is_default": true,
      "title": "About Us — Neop",
      "description": "Learn about our team.",
      "robots": "index,follow"
    },
    "ar": {
      "title": "من نحن — نيوب",
      "description": "تعرف على فريقنا."
    }
  }
}
```

### Update Page Payload

```json
{
  "title": { "en": "Updated Title", "ar": "العنوان المحدث" }
}
```

> **Note:** Slug is immutable after creation.

### Page Batch Content Payload

```json
{
  "default": "en",
  "sections": {
    "12": {
      "en": { "heading": "Welcome", "hero_image": "uuid", "show_cta": true },
      "ar": { "heading": "أهلاً", "hero_image": "uuid", "show_cta": true }
    },
    "13": {
      "en": { "title": "Features", "items": [] }
    }
  }
}
```

> ⚠️ Validation errors are keyed as `sections.{id}.{locale}.{field}`

---

## Sections (`/cms/pages/{pageId}/sections`)

| # | Method   | Endpoint                                        | Description                  |
|---|----------|-------------------------------------------------|------------------------------|
| 1 | `GET`    | `/cms/pages/{pageId}/sections`                  | List all sections for a page |
| 2 | `POST`   | `/cms/pages/{pageId}/sections`                  | Create section (inline OR reusable ref) |
| 3 | `PUT`    | `/cms/pages/{pageId}/sections/{sectionId}`      | Update section               |
| 4 | `DELETE` | `/cms/pages/{pageId}/sections/{sectionId}`      | Delete section               |
| 5 | `POST`   | `/cms/sections/reorder`                         | Reorder sections (global, no page prefix) |
| 6 | `POST`   | `/cms/sections/{sectionId}/toggle`              | Toggle `is_hidden` on/off    |

### Inline Section Create Payload

> **G4**: Provide `fields` OR `reusable_section_id`, never both.

```json
{
  "page_id": 1,
  "key": "hero_main",
  "label": { "en": "Hero Banner", "ar": "البانر الرئيسي" },
  "order": 0,
  "is_repeatable": false,
  "fields": [
    {
      "key": "heading",
      "label": { "en": "Heading", "ar": "العنوان" },
      "type": "text",
      "translatable": true,
      "required": true,
      "max_length": 120
    },
    {
      "key": "hero_image",
      "label": { "en": "Hero Image", "ar": "صورة البطل" },
      "type": "media",
      "multiple": false,
      "allowed_types": ["images"]
    },
    {
      "key": "show_cta",
      "label": { "en": "Show CTA", "ar": "إظهار الدعوة" },
      "type": "boolean",
      "default": true
    },
    {
      "key": "cta_label",
      "label": { "en": "CTA Label", "ar": "نص زر الدعوة" },
      "type": "text",
      "translatable": true,
      "condition": { "field": "show_cta", "operator": "eq", "value": true }
    }
  ]
}
```

### Reusable Section Reference Payload

```json
{
  "page_id": 2,
  "key": "footer",
  "label": { "en": "Home Footer", "ar": "الفوتر" },
  "order": 3,
  "is_repeatable": true,
  "is_hidden": false,
  "reusable_section_id": 1
}
```

### Update Section Payload

```json
{
  "label": { "en": "Updated Label", "ar": "العنوان المحدث" },
  "order": 2,
  "fields": [ /* field definitions */ ],
  "is_repeatable": true
}
```

### Reorder Payload

```json
{
  "items": [
    { "id": 1, "order": 0 },
    { "id": 2, "order": 1 },
    { "id": 3, "order": 2 }
  ]
}
```

---

## Section Content (`/cms/sections/{sectionId}/content`)

| # | Method   | Endpoint                                           | Description                        |
|---|----------|----------------------------------------------------|------------------------------------|
| 1 | `GET`    | `/cms/sections/{sectionId}/content`                | All locales (`?scope=media.full`)  |
| 2 | `GET`    | `/cms/sections/{sectionId}/content/{locale}`       | Single locale                      |
| 3 | `POST`   | `/cms/sections/{sectionId}/content`                | Save draft for one locale          |
| 4 | `POST`   | `/cms/sections/{sectionId}/content/batch`          | Save draft for all locales         |
| 5 | `POST`   | `/cms/sections/{sectionId}/content/publish`        | Promote draft → published          |
| 6 | `GET`    | `/cms/sections/{sectionId}/content/preview`        | Resolved draft preview (`?locale=en`) |
| 7 | `DELETE` | `/cms/sections/{sectionId}/content/{locale}`       | Remove published content           |

### Query Parameters

| Parameter | Values        | Description                                |
|-----------|---------------|--------------------------------------------|
| `scope`   | `media.full`  | Expands UUID media tokens into full objects |
| `locale`  | `en` / `ar`   | Specific locale for preview endpoint       |

### Single Locale Save Payload

```json
{
  "locale": "en",
  "is_default": true,
  "content": {
    "heading": "Welcome to our Platform",
    "hero_image": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "show_cta": true,
    "cta_label": "Get Started"
  }
}
```

### Batch Save Payload

```json
{
  "default": "en",
  "locales": {
    "en": {
      "heading": "Welcome to our Platform",
      "hero_image": "uuid",
      "show_cta": true
    },
    "ar": {
      "heading": "مرحباً بك في منصتنا",
      "hero_image": "uuid",
      "show_cta": true
    }
  }
}
```

### Publish Payload

```json
{
  "locales": ["en", "ar"]
}
```

> Omit `locales` to publish all available drafts.

### Content Response Shape

```json
{
  "data": {
    "en": {
      "locale": "en",
      "is_default": true,
      "status": 1,
      "content": {
        "heading": "Welcome to our Platform",
        "description": "We build amazing products."
      }
    },
    "ar": {
      "locale": "ar",
      "is_default": false,
      "status": 0,
      "content": {
        "heading": "مرحبا بكم في منصتنا",
        "description": "نحن نبني منتجات رائعة."
      }
    }
  }
}
```

---

## Reusable Library (`/cms/reusable`)

| # | Method   | Endpoint                                    | Description                          |
|---|----------|---------------------------------------------|--------------------------------------|
| 1 | `GET`    | `/cms/reusable`                             | List all (`?translated=true`)        |
| 2 | `POST`   | `/cms/reusable`                             | Create entry                         |
| 3 | `GET`    | `/cms/reusable/{id}`                        | Get single entry                     |
| 4 | `PUT`    | `/cms/reusable/{id}`                        | Update entry                         |
| 5 | `DELETE` | `/cms/reusable/{id}`                        | Delete (**G3**: blocked if in use)   |
| 6 | `POST`   | `/cms/reusable/reorder`                     | Reorder entries                      |
| 7 | `POST`   | `/cms/reusable/{id}/toggle`                 | Toggle visibility                    |
| 8 | `GET`    | `/cms/reusable/{id}/content`                | Get content (all locales)            |
| 9 | `POST`   | `/cms/reusable/{id}/content/batch`          | Save draft (all locales)             |
| 10| `POST`   | `/cms/reusable/{id}/content/publish`        | Publish (**G7**: flushes ALL caches) |
| 11| `GET`    | `/cms/reusable/{id}/content/preview`        | Preview (`?locale=en`)               |

### Create Reusable Payload

```json
{
  "key": "footer",
  "label": { "en": "Site Footer", "ar": "التذييل" },
  "is_repeatable": false,
  "content_mode": "shared",
  "fields": [
    { "key": "copyright", "label": { "en": "Copyright", "ar": "حقوق النشر" }, "type": "text", "translatable": true, "required": true },
    { "key": "logo", "label": { "en": "Logo", "ar": "الشعار" }, "type": "media", "multiple": false, "allowed_types": ["images"] },
    { "key": "links", "label": { "en": "Links", "ar": "الروابط" }, "type": "json" }
  ]
}
```

---

## Page SEO (`/cms/pages/{pageId}/seo`)

| # | Method   | Endpoint                               | Description                   |
|---|----------|----------------------------------------|-------------------------------|
| 1 | `GET`    | `/cms/pages/{pageId}/seo`              | All locale SEO data           |
| 2 | `GET`    | `/cms/pages/{pageId}/seo/{locale}`     | Single locale SEO             |
| 3 | `POST`   | `/cms/pages/{pageId}/seo`              | Upsert one locale             |
| 4 | `POST`   | `/cms/pages/{pageId}/seo/batch`        | Upsert all locales (recommended) |
| 5 | `DELETE` | `/cms/pages/{pageId}/seo/{locale}`     | Delete locale SEO             |

### Batch SEO Payload

```json
{
  "default": "en",
  "locales": {
    "en": {
      "title": "About Us — Neop",
      "description": "Learn about our team.",
      "keywords": "about, company, team",
      "canonical_url": "https://example.com/about",
      "og_title": "About Us",
      "og_description": "Learn about our team.",
      "og_image": "uuid-or-media-id",
      "twitter_card": "summary_large_image",
      "robots": "index,follow"
    },
    "ar": {
      "title": "من نحن — نيوب",
      "description": "تعرف على فريقنا."
    }
  }
}
```

> `og_image`: Accepts UUID temp token **or** integer media ID.

---

## Config Endpoints

| # | Method | Endpoint              | Description                      |
|---|--------|-----------------------|----------------------------------|
| 1 | `GET`  | `/cms/relation-models`| Available relation model tables  |
| 2 | `GET`  | `/cms/builder/status` | Builder lock status              |

---

## Dashboard Service Mapping

### `cmsPageService` (`src/services/cmsService.ts`)

```typescript
cmsPageService.list(params?)          // GET /cms/pages?translated=true
cmsPageService.get(id, params?)       // GET /cms/pages/{id}?translated=true&include=seoMetas,sections
cmsPageService.create(payload)        // POST /cms/pages
cmsPageService.update(id, payload)    // PUT /cms/pages/{id}
cmsPageService.delete(id)             // DELETE /cms/pages/{id}
cmsPageService.publish(id)            // POST /cms/pages/{id}/publish
cmsPageService.unpublish(id)          // POST /cms/pages/{id}/unpublish
cmsPageService.duplicate(id)          // POST /cms/pages/{id}/duplicate
cmsPageService.batchContent(id, data) // POST /cms/pages/{id}/content/batch
```

### `cmsSectionService`

```typescript
cmsSectionService.list(pageId)                    // GET /cms/pages/{pageId}/sections
cmsSectionService.createInline(pageId, payload)   // POST /cms/pages/{pageId}/sections (with fields[])
cmsSectionService.createReusableRef(pageId, data) // POST /cms/pages/{pageId}/sections (with reusable_section_id)
cmsSectionService.update(pageId, sectionId, data) // PUT /cms/pages/{pageId}/sections/{sectionId}
cmsSectionService.delete(pageId, sectionId)       // DELETE /cms/pages/{pageId}/sections/{sectionId}
cmsSectionService.reorder(payload)                // POST /cms/sections/reorder
cmsSectionService.toggle(sectionId)               // POST /cms/sections/{sectionId}/toggle
```

### `cmsSectionContentService`

```typescript
cmsSectionContentService.getAll(sectionId, scope?)       // GET /cms/sections/{id}/content?scope=media.full
cmsSectionContentService.getLocale(sectionId, locale)    // GET /cms/sections/{id}/content/{locale}
cmsSectionContentService.saveDraft(sectionId, payload)   // POST /cms/sections/{id}/content
cmsSectionContentService.saveBatch(sectionId, payload)   // POST /cms/sections/{id}/content/batch
cmsSectionContentService.publish(sectionId, payload?)    // POST /cms/sections/{id}/content/publish
cmsSectionContentService.preview(sectionId, locale)      // GET /cms/sections/{id}/content/preview?locale=X
cmsSectionContentService.deleteLocale(sectionId, locale) // DELETE /cms/sections/{id}/content/{locale}
```

### `cmsReusableService`

```typescript
cmsReusableService.list(params?)                       // GET /cms/reusable?translated=true
cmsReusableService.get(id)                             // GET /cms/reusable/{id}
cmsReusableService.create(payload)                     // POST /cms/reusable
cmsReusableService.update(id, payload)                 // PUT /cms/reusable/{id}
cmsReusableService.delete(id)                          // DELETE /cms/reusable/{id} (G3)
cmsReusableService.reorder(payload)                    // POST /cms/reusable/reorder
cmsReusableService.toggle(id)                          // POST /cms/reusable/{id}/toggle
cmsReusableService.getContent(id)                      // GET /cms/reusable/{id}/content
cmsReusableService.saveBatchContent(id, payload)       // POST /cms/reusable/{id}/content/batch
cmsReusableService.publishContent(id, payload?)        // POST /cms/reusable/{id}/content/publish (G7)
cmsReusableService.previewContent(id, locale)          // GET /cms/reusable/{id}/content/preview?locale=X
```

### `cmsSeoService` (`src/services/cmsSeoService.ts`)

```typescript
cmsSeoService.getAll(pageId)                    // GET /cms/pages/{pageId}/seo
cmsSeoService.getLocale(pageId, locale)         // GET /cms/pages/{pageId}/seo/{locale}
cmsSeoService.save(pageId, payload)             // POST /cms/pages/{pageId}/seo
cmsSeoService.saveBatch(pageId, payload)        // POST /cms/pages/{pageId}/seo/batch
cmsSeoService.deleteLocale(pageId, locale)      // DELETE /cms/pages/{pageId}/seo/{locale}
```

---

## Error Handling

### Response Patterns

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Content saved for locale [en]."
}
```

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "content.heading": ["The heading field is required."],
    "sections.12.en.hero_image": ["The hero image must be a valid UUID."]
  }
}
```

**Business Rule Error:**
```json
{
  "success": false,
  "message": "REUSABLE_SECTION_IN_USE"
}
```

### Dashboard Error Handling

- **422 errors**: Parsed and displayed as inline field errors + toast summary
- **G3 errors**: Shown as "Cannot delete — this section is used by one or more pages"
- **Content not found**: Treated as empty (initialized with `{}` per locale)

---

## Quick Reference: Common API Calls

```bash
# List all pages
GET /api/admin/v1/cms/pages?translated=true

# Get single page with sections + SEO
GET /api/admin/v1/cms/pages/{id}?include=sections,seoMetas&translated=true

# Get section content (all locales, expanded media)
GET /api/admin/v1/cms/sections/{sectionId}/content?scope=media.full

# Save section content (one locale)
POST /api/admin/v1/cms/sections/{sectionId}/content
Body: { "locale": "en", "is_default": true, "content": { "heading": "...", ... } }

# Publish section content
POST /api/admin/v1/cms/sections/{sectionId}/content/publish
Body: { "locales": ["en", "ar"] }

# Get page SEO
GET /api/admin/v1/cms/pages/{pageId}/seo

# Batch save SEO
POST /api/admin/v1/cms/pages/{pageId}/seo/batch
Body: { "default": "en", "locales": { "en": {...}, "ar": {...} } }
```
