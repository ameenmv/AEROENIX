# AI Prompts (prompts.md)

You can construct a complete module in seconds by feeding your favorite AI assistant (like ChatGPT, Claude, or Antigravity) the context of your data schema and asking it to generate the code using the modular setup.

## The Full Module Generator Prompt

Copy the text block below, replace the `[VARIABLE]` placeholders with your actual data, and send it to your AI:

```text
Please create a new dashboard module using the Neop modular composables architecture.

Here are the details for the new resource:
1. Resource Name: [e.g., "products"]
2. Entity Interface / Properties: 
   [e.g., id (number), name (string), price (number), is_active (boolean), created_at (string)]
3. Validation Rules:
   [e.g., name is required, price must be > 0]

Follow these exact architectural rules:
1. Generate configurations inside `src/modules/[module_name]/`:
   - `schema.ts`: Zod schema for validation (`[module_name]Schema`)
   - `columns.ts`: Export `[module_name]Columns` array for table display using type `TableColumn[]`
   - `fields.ts`: Export `[module_name]Fields` array for FormContainer using type `FormField[]`
   - `endpoints.ts`: API endpoint constants with LIST, GET, CREATE, UPDATE, DELETE
2. Generate `src/services/[module_name]Service.ts`:
   - An API service object with `list`, `get`, `create`, `update`, `delete` methods.
3. Generate the following views inside `src/views/admin/[module_name]/` following the Multi-Page pattern:
   - `IndexView.vue`: Use `useTable` with `deleteFn` option. Wrap content in `<ModularView>`. Use `router.push()` for navigation (create/edit/show). Use `v-can` directive for permissions.
   - `CreateView.vue`: Use `useForm` (create mode). Render `<FormContainer>`.
   - `EditView.vue`: Use `useForm` (edit mode) with `autoLoadId: true`. Render `<FormContainer>` with `:is-edit="true"`.
   - `ShowView.vue`: Use `useDetails` with `autoLoadId: true`. Render a readonly grid.
4. Register the module routes:
   - Generate `src/modules/[module_name]/index.ts`: Use `registerModule()` from `@/router/modules` to define routes for index (with children for create, edit, show) with `openMode` meta.
   - Add `import '../modules/[module_name]'` to `src/router/index.ts`.
5. Add to sidebar navigation:
   - Add a new entry to `navigationConfig` in `src/lib/navigation.ts`.
   - Add i18n keys to `src/i18n/locales/en/menu.json` and `src/i18n/locales/ar/menu.json`.
```
