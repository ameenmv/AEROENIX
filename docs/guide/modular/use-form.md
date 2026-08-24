# useForm & Declarative Forms

The Neop Dashboard Framework focuses on **Explicit, Library-Native Forms**. We rely completely on standard community tools for form logic:
- **`vee-validate`**: For form state, validation, and submission.
- **`@vee-validate/zod`**: For strict, schema-based validation.
- **`@tanstack/vue-query`**: For mutating data to the API.

To glue these together effortlessly, we provide a unified `useForm` composable alongside a `FormContainer` component that supports declarative field definitions.

## 1. Defining Forms Declaratively

Instead of using magic configuration arrays, define your forms declaratively within the components. Wrap your `<InputField>`, `<CheckboxField>`, and other form widgets inside `<FormContainer>`.

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useForm } from '@/composables'
import { userSchema } from '@/modules/users/schema'
import { usersService } from '@/services/usersService'

const { t } = useI18n()

const form = useForm({
  resourceName: 'users',
  action: 'create',
  schema: userSchema,
  mutationFn: (data) => usersService.create(data),
  onSuccess: () => {
    // navigate or show toast
  },
})
</script>

<template>
  <FormContainer :form="form">
    <InputField
      name="name"
      v-model="form.values.name"
      @update:model-value="form.setFieldValue('name', $event)"
      :label="t('users.fields.name')"
      :error="form.errors.value.name"
    />

    <InputField
      name="email"
      type="email"
      v-model="form.values.email"
      @update:model-value="form.setFieldValue('email', $event)"
      :label="t('users.fields.email')"
      :error="form.errors.value.email"
    />
  </FormContainer>
</template>
```

> [!NOTE]
> `FormContainer` manages the grid layout and standard footer (Save/Cancel buttons). By providing the default slot, everything renders inside the grid seamlessly.

## 2. API Reference: `useForm`

`useForm` is essentially a tailored wrapper around TanStack Vue Query's `useMutation`. It manages typical resource needs: auto-invalidating cache, displaying toasts, mapping error payloads to forms, and more.

### Options
- `resourceName`: (string) The key identifying your resource cache (e.g. `users`, `products`).
- `action`: `'create' | 'update' | 'delete'` Action mode determines default language and toaster messages.
- `mutationFn`: Function that actually posts/puts data to your API.
- All standard `useMutation` options (`onSuccess`, `onError`, `onSettled`).

### Returns
- `mutate`, `mutateAsync`: Trigger the mutation.
- `isPending`, `isSuccess`, `isError`: Standard Vue Query status refs.
- `mapApiErrors(error, setErrorsCallback)`: Used inside Vue Query's `onError` to pipe structured internal API violations (`{ "email": ["Taken"] }`) right into `vee-validate`.

## 3. Editing Data

For editing data, you combine `@tanstack/vue-query`'s `useQuery` for fetching original data, with `vee-validate`'s `setValues` alongside `useForm`:

```ts
import { watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'

// 1. Fetch item
const { data: item, isLoading } = useQuery({
  queryKey: ['users', id],
  queryFn: () => usersService.get(id),
})

// 2. Setup Unified Form
const form = useForm({
  resourceName: 'users',
  action: 'update',
  schema: userSchema,
  mutationFn: (data) => usersService.update(id, data),
})

// 3. Populate once loaded
watch(item, (newItem) => {
  if (newItem) form.setValues(newItem)
}, { immediate: true })

// 4. Submission is fully handled internally by form.onSubmit
// Make sure to pass :form="form" on your <FormContainer> component.
```

## Summary
By keeping forms explicit through declarative components, validation in `vee-validate`, and API handling in `useForm` via TanStack Query, the module system remains lightweight and easy to understand without sacrificing powerful capabilities.
