<script setup lang="ts">
import type { CmsSection } from '@/types/cms'
import { Delete01Icon, DragDropIcon, Edit02Icon, Layers01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { Badge } from '@/components/uic/badge'
import { Card, CardContent, CardHeader } from '@/components/uic/card'

const _props = defineProps<{
  section: CmsSection
  index: number
  total: number
  toggling?: boolean
  deleting?: boolean
  togglingRepeatable?: boolean
}>()

const emit = defineEmits<{
  edit: [section: CmsSection]
  delete: [section: CmsSection]
  toggle: [section: CmsSection]
  toggleRepeatable: [section: CmsSection]
}>()

const { locale } = useI18n()

function localized(val: any): string {
  if (typeof val === 'string')
    return val
  if (!val)
    return '-'
  return val[locale.value] || val.en || val.ar || '-'
}

const isExpanded = ref(false)

// Field type display helpers
const fieldTypeColors: Record<string, string> = {
  text: 'bg-blue-500/15 text-blue-500',
  textarea: 'bg-blue-500/15 text-blue-400',
  text_editor: 'bg-violet-500/15 text-violet-500',
  number: 'bg-emerald-500/15 text-emerald-500',
  boolean: 'bg-amber-500/15 text-amber-500',
  date: 'bg-cyan-500/15 text-cyan-500',
  email: 'bg-pink-500/15 text-pink-500',
  password: 'bg-red-500/15 text-red-500',
  color: 'bg-fuchsia-500/15 text-fuchsia-500',
  enumeration: 'bg-orange-500/15 text-orange-500',
  media: 'bg-teal-500/15 text-teal-500',
  relation: 'bg-indigo-500/15 text-indigo-500',
  component: 'bg-purple-500/15 text-purple-500',
  json: 'bg-gray-500/15 text-gray-400',
  rich_text_blocks: 'bg-rose-500/15 text-rose-500',
}
</script>

<template>
  <Card
    class="overflow-hidden transition-all duration-200"
    :class="[
      section.is_hidden ? 'opacity-60 border-border/50' : 'border-border',
      toggling || deleting ? 'pointer-events-none' : '',
    ]"
  >
    <!-- Header -->
    <CardHeader
      class="cursor-pointer hover:bg-muted/30 transition-colors py-3 px-4"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center justify-between gap-3">
        <!-- Left: Index + Label -->
        <div class="flex items-center gap-3 min-w-0">
          <!-- Drag Handle -->
          <span
            class="drag-handle w-7 h-7 flex items-center justify-center rounded-lg cursor-grab active:cursor-grabbing shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            :title="$t('cms.drag_to_reorder', 'Drag to reorder')"
            @click.stop
          >
            <HugeiconsIcon :icon="DragDropIcon" :size="14" />
          </span>
          <span
            class="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold shrink-0"
            :class="
              section.is_hidden ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
            "
          >
            {{ index + 1 }}
          </span>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-foreground truncate">
                {{ localized(section.label) }}
              </span>
              <Badge v-if="section.is_hidden" variant="secondary" class="text-[10px] shrink-0">
                {{ $t('cms.hidden', 'Hidden') }}
              </Badge>
              <Badge
                v-if="section.is_reusable"
                variant="outline"
                class="text-[10px] shrink-0 border-purple-500/30 text-purple-500"
              >
                {{ $t('cms.reusable', 'Reusable') }}
              </Badge>
              <Badge
                v-if="section.is_repeatable"
                variant="outline"
                class="text-[10px] shrink-0 border-cyan-500/30 text-cyan-500"
              >
                {{ $t('cms.repeatable', 'Repeatable') }}
              </Badge>
            </div>
            <code class="text-[10px] text-muted-foreground font-mono">{{ section.key }}</code>
          </div>
        </div>

        <!-- Right: Actions + Fields count + Arrow -->
        <div class="flex items-center gap-1 shrink-0" @click.stop>
          <!-- Fields count -->
          <Badge variant="secondary" class="text-[10px] mr-1">
            {{ (section.fields || []).length }} {{ $t('cms.fields', 'fields') }}
          </Badge>

          <!-- Toggle Repeatable -->
          <button
            class="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            :class="[
              section.is_repeatable
                ? 'text-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              togglingRepeatable ? 'opacity-50 animate-pulse' : '',
            ]"
            :title="
              section.is_repeatable
                ? $t('cms.disable_repeatable', 'Disable Repeatable')
                : $t('cms.enable_repeatable', 'Enable Repeatable')
            "
            :disabled="togglingRepeatable"
            @click="emit('toggleRepeatable', section)"
          >
            <HugeiconsIcon :icon="Layers01Icon" :size="14" />
          </button>

          <!-- Toggle Visibility -->
          <button
            class="flex items-center justify-center cursor-pointer group/toggle mx-1"
            :title="
              section.is_hidden
                ? $t('cms.show_section', 'Show Section')
                : $t('cms.hide_section', 'Hide Section')
            "
            :disabled="toggling"
            @click="emit('toggle', section)"
          >
            <span
              class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-colors"
              :class="[
                !section.is_hidden ? 'bg-primary' : 'bg-input dark:bg-input/80',
                toggling ? 'opacity-50 animate-pulse' : 'group-hover/toggle:opacity-80',
              ]"
            >
              <span
                class="pointer-events-none block size-4 rounded-full bg-background shadow-xs transition-transform"
                :class="[
                  !section.is_hidden
                    ? locale === 'ar'
                      ? '-translate-x-[calc(100%-2px)]'
                      : 'translate-x-[calc(100%-2px)]'
                    : 'translate-x-0',
                ]"
              />
            </span>
          </button>

          <!-- Edit -->
          <button
            :title="$t('actions.edit', 'Edit')"
            class="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            @click="emit('edit', section)"
          >
            <HugeiconsIcon :icon="Edit02Icon" :size="14" />
          </button>

          <!-- Delete -->
          <button
            :title="$t('actions.delete', 'Delete')"
            class="w-7 h-7 flex items-center justify-center rounded-full text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
            :class="deleting ? 'opacity-50 animate-pulse' : ''"
            @click="emit('delete', section)"
          >
            <HugeiconsIcon :icon="Delete01Icon" :size="14" />
          </button>

          <!-- Expand Arrow -->
          <span
            class="text-muted-foreground transition-transform text-sm ml-1 cursor-pointer"
            :class="isExpanded ? 'rotate-180' : ''"
            @click.stop="isExpanded = !isExpanded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </span>
        </div>
      </div>
    </CardHeader>

    <!-- Expandable field schema preview -->
    <Transition name="slide">
      <CardContent v-if="isExpanded" class="pt-0 px-4 pb-4">
        <div class="border-t border-border/50 pt-3 space-y-2">
          <p v-if="!section.fields?.length" class="text-xs text-muted-foreground italic">
            {{ $t('cms.no_fields', 'No fields defined yet') }}
          </p>
          <div
            v-for="field in section.fields"
            :key="field.key"
            class="flex items-center gap-2 text-xs py-1 px-2 rounded-md bg-muted/30"
          >
            <Badge
              :class="fieldTypeColors[field.type] || 'bg-gray-500/15 text-gray-400'"
              class="text-[10px] font-mono px-1.5 py-0.5"
            >
              {{ field.type }}
            </Badge>
            <span class="font-medium text-foreground">{{ localized(field.label) }}</span>
            <code class="text-muted-foreground font-mono">{{ field.key }}</code>
            <span v-if="field.required" class="text-destructive text-[10px] font-bold">*</span>
            <Badge
              v-if="field.translatable"
              variant="outline"
              class="text-[9px] ml-auto border-sky-500/30 text-sky-500"
            >
              {{ $t('cms.translatable', 'i18n') }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Transition>
  </Card>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
