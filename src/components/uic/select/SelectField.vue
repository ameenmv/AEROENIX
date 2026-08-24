<script setup lang="ts">
import { Check, ChevronDown, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { Badge } from '@/components/uic/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/uic/command'
// Shadcn primitives
import { Label } from '@/components/uic/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/uic/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '@/components/uic/select'
import { cn } from '@/utils/cn'

interface Option {
  value: string | number
  label: string
}
interface Props {
  modelValue?: string | number | (string | number)[]
  options: Option[]
  label?: string
  id?: string
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  multiple?: boolean
  variant?: 'default' | 'search' | 'filter'
  size?: 'sm' | 'md' | 'lg'
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  id: '',
  error: '',
  placeholder: '',
  required: false,
  disabled: false,
  multiple: false,
  variant: 'default',
  size: 'md',
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | (string | number)[]): void
}>()
// --- Multi-select Logic ---
const open = ref(false)
const multiSelectedValues = computed({
  get: () => (Array.isArray(props.modelValue) ? props.modelValue : []),
  set: val => emit('update:modelValue', val),
})
const multiSelectedOptions = computed(() => {
  return props.options.filter(opt => multiSelectedValues.value.includes(opt.value))
})
function toggleMultiSelect(val: string | number) {
  const current = [...multiSelectedValues.value]
  const idx = current.indexOf(val)
  if (idx > -1) {
    current.splice(idx, 1)
  }
  else {
    current.push(val)
  }
  multiSelectedValues.value = current
}
function removeMultiSelect(val: string | number) {
  const current = [...multiSelectedValues.value]
  const idx = current.indexOf(val)
  if (idx > -1) {
    current.splice(idx, 1)
    multiSelectedValues.value = current
  }
}
// --- Single-select Logic ---
const singleSelectedValue = computed({
  get: () => (!Array.isArray(props.modelValue) ? String(props.modelValue) : ''),
  set: (val) => {
    // try to map back to number if original option value was number
    const option = props.options.find(o => String(o.value) === val)
    if (option) {
      emit('update:modelValue', option.value)
    }
    else {
      emit('update:modelValue', val)
    }
  },
})
// --- Styles ---
const triggerClasses = computed(() => {
  return cn(
    'w-full font-sans transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed justify-between',
    {
      'h-8 px-3 text-xs': props.size === 'sm',
      'h-10 px-4 py-2': props.size === 'md',
      'h-12 px-5 text-lg': props.size === 'lg',
    },
    props.variant === 'search'
      ? 'bg-card border-none ring-1 ring-border shadow-none h-9 text-xs'
      : 'bg-accent border-border',
    props.variant === 'filter' ? 'bg-card border-border h-7 text-xs px-3 hover:bg-muted' : '',
    props.error
      ? 'border-destructive focus:ring-destructive focus:ring-[3px] focus:ring-destructive/20 ring-destructive'
      : '',
  )
})
</script>

<template>
  <div class="space-y-1.5 w-full">
    <Label
      v-if="label"
      :for="id"
      :class="cn('text-sm font-semibold tracking-tight', error ? 'text-destructive' : '')"
    >
      {{ label }}
      <span v-if="required" class="text-destructive ml-0.5">*</span>
    </Label>
    <template v-if="!multiple">
      <Select v-model="singleSelectedValue" :disabled="disabled">
        <SelectTrigger :id="id" :class="triggerClasses">
          <SelectValue :placeholder="placeholder || 'Select an option'" />
        </SelectTrigger>
        <SelectContent class="z-100">
          <SelectItem v-for="option in options" :key="option.value" :value="String(option.value)">
            <SelectItemText>{{ option.label }}</SelectItemText>
          </SelectItem>
        </SelectContent>
      </Select>
    </template>
    <template v-else>
      <Popover v-model:open="open">
        <PopoverTrigger as-child>
          <button
            :id="id"
            role="combobox"
            :aria-expanded="open"
            :disabled="disabled"
            :class="
              cn(
                'flex items-center border rounded-md shadow-sm',
                triggerClasses,
                open ? 'ring-1 ring-ring' : '',
              )
            "
          >
            <span
              class="truncate"
              :class="multiSelectedValues.length === 0 ? 'text-muted-foreground' : ''"
            >
              {{
                multiSelectedValues.length > 0
                  ? `${multiSelectedValues.length} selected`
                  : placeholder || 'Select options'
              }}
            </span>
            <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent class="w-full p-0 z-100" align="start">
          <Command>
            <CommandInput :placeholder="placeholder || 'Search...'" />
            <CommandEmpty>{{ $t('common.No results found.') }}</CommandEmpty>
            <CommandList class="max-h-[250px] overflow-y-auto">
              <CommandGroup>
                <CommandItem
                  v-for="option in options"
                  :key="option.value"
                  :value="String(option.value)"
                  @select="toggleMultiSelect(option.value)"
                >
                  {{ option.label }}
                  <Check
                    :class="
                      cn(
                        'ml-auto h-4 w-4',
                        multiSelectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0',
                      )
                    "
                  />
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div v-if="multiSelectedOptions.length > 0" class="flex flex-wrap gap-2 mt-2">
        <Badge
          v-for="option in multiSelectedOptions"
          :key="option.value"
          variant="secondary"
          class="font-normal"
        >
          {{ option.label }}
          <button
            class="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary-foreground/20"
            @keydown.enter.prevent="removeMultiSelect(option.value)"
            @mousedown.prevent.stop
            @click.stop="removeMultiSelect(option.value)"
          >
            <X class="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </button>
        </Badge>
      </div>
    </template>
    <p v-if="error" class="text-[0.8rem] text-destructive font-medium">
      {{ error }}
    </p>
  </div>
</template>
