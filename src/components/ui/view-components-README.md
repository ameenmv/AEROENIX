# Custom View Components

Reusable styled components for custom detail views in the admin section.

## Usage Example

```vue
<script setup lang="ts">
import { SomeIcon } from '@hugeicons/core-free-icons'
import { yourService } from '@/services/yourService'

// All view components (CustomViewContainer, InfoCard, InfoRow, etc.)
// are auto-imported from src/components/ui/

const config = yourConfig()
</script>

<template>
  <ResourcePage resource="your-resource" :service="yourService" :config="config" :schema="YourSchema">
    <template #default="{ item, loading, modal }">
      <CustomViewContainer :loading="loading">
        <!-- Header with stats -->
        <StatsHeader
          :title="item.name"
          :stats="[
            { label: 'Total', value: '100' },
            { label: 'Active', value: '75', hasBorder: true, accent: true },
          ]"
        />

        <!-- Success banner (optional) -->
        <SuccessBanner
          :title="$t('common.Success Message')"
          message="Optional description"
        >
          <template #icon>
            <YourIcon :size="20" />
          </template>
        </SuccessBanner>

        <!-- Info card with rows -->
        <InfoCard :title="$t('common.Information')" :icon="SomeIcon">
          <div class="grid grid-cols-2 gap-y-4">
            <InfoRow label="Field 1" :value="item.field1" />
            <InfoRow label="Field 2" :value="item.field2" />
          </div>
        </InfoCard>

        <!-- Scrollable list card -->
        <InfoCard :title="$t('common.Items')" :icon="SomeIcon" scrollable>
          <ScrollableList
            :items="[
              { id: 1, label: 'Item 1', badge: 'ACTIVE' },
              { id: 2, label: 'Item 2', badge: 'PENDING' },
            ]"
          />
        </InfoCard>

        <!-- Close button -->
        <CloseButton @click="modal.closeView()" />
      </CustomViewContainer>
    </template>
  </ResourcePage>
</template>
```

## Components

### CustomViewContainer
Main container with dark background and loading state.

**Props:**
- `loading?: boolean` - Show loading spinner

### StatsHeader
Header with title and optional stats.

**Props:**
- `title: string` - Main title
- `stats?: Stat[]` - Array of stats to display
  - `label: string` - Stat label
  - `value: string | number` - Stat value
  - `hasBorder?: boolean` - Add left border
  - `accent?: boolean` - Use primary color

### SuccessBanner
Green success banner with icon.

**Props:**
- `title: string` - Main message
- `message?: string` - Optional description
- `icon?: any` - Icon component

**Slots:**
- `icon` - Custom icon slot

### InfoCard
Dark card container with title and icon.

**Props:**
- `title: string` - Card title
- `icon?: any` - Icon component
- `scrollable?: boolean` - Enable scrollable content
- `maxHeight?: string` - Max height for scrollable

### InfoRow
Single row for displaying label-value pairs.

**Props:**
- `label: string` - Field label
- `value?: string | number` - Field value
- `columns?: 1 | 2 | 3 | 4` - Grid column span (default: 2)

**Slots:**
- `default` - Custom content slot (overrides value prop)

### ScrollableList
List of items with hover effects and badges.

**Props:**
- `items?: ListItem[]` - Array of items
  - `id: string | number` - Item ID
  - `label: string` - Item label
  - `badge?: string` - Optional badge text
  - `badgeColor?: string` - Badge color class
- `showBadge?: boolean` - Show badges (default: true)

**Slots:**
- `default` - Scoped slot with `{ items }`

### CloseButton
Stylized close button.

**Props:**
- `label?: string` - Button text (default: "Close")

**Events:**
- `click` - Emitted on click
