# Writing Component Stories

This guide covers how to create **Histoire stories** — interactive previews for UI components that appear in the playground.

## What is a Story?

A story is a `.story.vue` file that sits **next to** the component it documents. It defines how the component is displayed in the [Interactive Playground](/guide/components/ui-components).

```
src/components/ui/buttons/
├── Btn.vue            ← the component
├── Btn.story.vue      ← the story
└── index.ts
```

## Creating a Basic Story

Create a file named `ComponentName.story.vue` next to your component:

```vue
<script setup>
import MyComponent from './MyComponent.vue'
</script>

<template>
  <Story title="Category/MyComponent" group="ui">
    <Variant title="Default">
      <div class="p-8 bg-bg-main">
        <MyComponent />
      </div>
    </Variant>
  </Story>
</template>
```

### Key Rules

| Rule | Detail |
|------|--------|
| **File name** | Must end with `.story.vue` |
| **Placement** | Same directory as the component |
| **Auto-discovery** | Histoire finds all `**/*.story.vue` files automatically |
| **`<Story>`** | Root element in template, set `title` and `group="ui"` |
| **`<Variant>`** | Each variant is a separate preview tab |

## Adding Variants

Show different states of the component in separate tabs:

```vue
<template>
  <Story title="Buttons/Btn" group="ui">
    <Variant title="All Variants">
      <div class="p-8 bg-bg-main flex flex-wrap gap-4">
        <Btn variant="primary">Primary</Btn>
        <Btn variant="danger">Danger</Btn>
        <Btn variant="ghost">Ghost</Btn>
      </div>
    </Variant>

    <Variant title="Sizes">
      <div class="p-8 bg-bg-main flex gap-4 items-center">
        <Btn size="sm">Small</Btn>
        <Btn size="md">Medium</Btn>
        <Btn size="lg">Large</Btn>
      </div>
    </Variant>

    <Variant title="Loading">
      <div class="p-8 bg-bg-main">
        <Btn :loading="true">Loading...</Btn>
      </div>
    </Variant>
  </Story>
</template>
```

## Adding Interactive Controls

Use the `#controls` slot to let users toggle props in real time:

```vue
<template>
  <Story title="Inputs/InputField" group="ui">
    <Variant title="Interactive">
      <template #default="{ state }">
        <div class="p-8 bg-bg-main max-w-md mx-auto">
          <InputField
            :label="state.label"
            :placeholder="state.placeholder"
            :error="state.error"
            :disabled="state.disabled"
          />
        </div>
      </template>

      <template #controls="{ state }">
        <HstText v-model="state.label" title="Label" />
        <HstText v-model="state.placeholder" title="Placeholder" />
        <HstText v-model="state.error" title="Error" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>
  </Story>
</template>
```

### Available Control Components

| Control | Usage |
|---------|-------|
| `<HstText>` | Text input |
| `<HstCheckbox>` | Boolean toggle |
| `<HstSelect>` | Dropdown with `:options` |
| `<HstSlider>` | Number slider |
| `<HstColorSelect>` | Color picker |

## Adding Documentation

Add a `<docs>` block at the bottom of your story for markdown documentation:

```vue
<docs lang="md">
# MyComponent

Description of the component and its usage.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'default' | Visual style |
</docs>
```

## Where to Place Stories

Stories must be placed **next to their component** in the same directory:

```
src/components/ui/
├── buttons/
│   ├── Btn.vue
│   ├── Btn.story.vue        ← ✅ here
│   └── index.ts
├── inputs/
│   ├── InputField.vue
│   ├── InputField.story.vue  ← ✅ here
│   ├── SelectField.vue
│   ├── SelectField.story.vue ← ✅ here
│   └── index.ts
├── checkboxes/
│   ├── CheckboxField.vue
│   ├── CheckboxField.story.vue ← ✅ here
│   └── index.ts
└── toggles/
    ├── ToggleSwitch.vue
    ├── ToggleSwitch.story.vue   ← ✅ here
    └── index.ts
```

## Story Title Convention

Use a **Category/ComponentName** format for the `title` prop:

```
title="Buttons/Btn"
title="Inputs/InputField"
title="Checkboxes/CheckboxField"
title="Toggles/ToggleSwitch"
```

This creates folders in the Histoire sidebar for clean organization.

## Running the Playground

```bash
# Start everything (app + docs + playground)
bun run dev

# Start Histoire only
bun run histoire:dev
```

The playground runs at `http://localhost:6006` and automatically picks up new `.story.vue` files — no restart needed.

## Generate with AI

You can use AI (like Antigravity) to automatically generate stories for your components. Use the prompt below to get a fully configured story file.

### AI Prompt Template

Copy and paste this prompt to your AI assistant:

```text
Analyze this Vue component and generate a Histoire story file for it:

[ATTACH COMPONENT FILE HERE]

Follow these project conventions:
1. File name: ComponentName.story.vue (placed in same directory)
2. Root: <Story title="Category/ComponentName" group="ui">
3. Styling: Wrap components in <div class="p-8 bg-bg-main"> for dark theme compatibility
4. Variants: Create variants for all major styles, sizes, and states
5. Interactive: Add an "Interactive" variant with a #controls slot using HstText, HstCheckbox, HstSelect, etc.
6. Docs: Include a <docs lang="md"> block with a prop table
```
