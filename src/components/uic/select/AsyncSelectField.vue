<script setup lang="ts">
import { Check, ChevronDown, Loader2 } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
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
import { cn } from '@/utils/cn'

interface Option {
  value: string | number
  label: string
}
interface Props {
  modelValue?: string | number | (string | number)[]
  optionsLoader?: (params: { page: number, search: string }) => Promise<{
    data: Option[]
    totalPages?: number
  }>
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
// --- State ---
const open = ref(false)
const options = ref<Option[]>([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
// --- Selected Values Tracking ---
// We keep a local cache of selected options so they can still render even if they aren't on the current page of results.
const selectedOptionsCache = ref<Record<string | number, Option>>({})
const multiSelectedValues = computed({
  get: () => (Array.isArray(props.modelValue) ? props.modelValue : []),
  set: val => emit('update:modelValue', val),
})
const multiSelectedOptions = computed(() => {
  return multiSelectedValues.value
    .map(val => selectedOptionsCache.value[val])
    .filter((opt): opt is Option => Boolean(opt))
})
const singleSelectedValue = computed({
  get: () => (!Array.isArray(props.modelValue) ? String(props.modelValue) : ''),
  set: (val) => {
    // try to map back to number if original option value was number
    const option = options.value.find(o => String(o.value) === val)
    if (option) {
      selectedOptionsCache.value[option.value] = option
      emit('update:modelValue', option.value)
    }
    else {
      emit('update:modelValue', val)
    }
  },
})
const singleSelectedOption = computed(() => {
  return selectedOptionsCache.value[singleSelectedValue.value]
})
// --- Options Loading ---
let searchTimeout: ReturnType<typeof setTimeout>
async function loadOptions(isLoadMore = false) {
  if (!props.optionsLoader)
    return
  loading.value = true
  try {
    const res = await props.optionsLoader({
      page: currentPage.value,
      search: searchQuery.value,
    })
    if (isLoadMore) {
      options.value = [...options.value, ...res.data]
    }
    else {
      options.value = res.data
    }
    if (res.totalPages !== undefined) {
      totalPages.value = res.totalPages
    }
    else {
      // Very naive fallback if totalPages isn't provided: stop when empty
      totalPages.value = res.data.length > 0 ? currentPage.value + 1 : currentPage.value
    }
    // Cache the loaded options so if they get selected, they don't disappear on search change
    res.data.forEach((opt) => {
      selectedOptionsCache.value[opt.value] = opt
    })
  }
  catch (error) {
    console.error('Failed to load async options:', error)
  }
  finally {
    loading.value = false
  }
}
function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  if (loading.value || currentPage.value >= totalPages.value)
    return
  // Load more when scrolled within 20px of the bottom
  if (target.scrollHeight - target.scrollTop <= target.clientHeight + 20) {
    currentPage.value++
    loadOptions(true)
  }
}
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadOptions()
  }, 300)
})
watch(open, (isOpen) => {
  if (isOpen && options.value.length === 0) {
    loadOptions()
  }
})
onMounted(() => {
  // If there's an initial value, we might need a way to hydrate it if the label isn't known,
  // but usually users rely on the form supplying `optionsMap` or pre-caching.
  // For now, if the Popover opens, it loads data.
})
// --- UI Actions ---
function toggleMultiSelect(opt: Option) {
  const current = [...multiSelectedValues.value]
  const idx = current.indexOf(opt.value)
  if (idx > -1) {
    current.splice(idx, 1)
  }
  else {
    current.push(opt.value)
    selectedOptionsCache.value[opt.value] = opt
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
function handleSingleSelect(opt: Option) {
  singleSelectedValue.value = String(opt.value)
  open.value = false
}
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
            :class="
              (multiple && multiSelectedValues.length === 0) || (!multiple && !singleSelectedValue)
                ? 'text-muted-foreground'
                : ''
            "
          >
            <template v-if="multiple">
              {{
                multiSelectedValues.length > 0
                  ? `${multiSelectedValues.length} selected`
                  : placeholder || 'Select options'
              }}
            </template>
            <template v-else>
              {{
                singleSelectedOption
                  ? singleSelectedOption.label
                  : placeholder || 'Select an option'
              }}
            </template>
          </span>
          <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent class="w-full p-0 z-100" align="start">
        <Command :should-filter="false">
          <div class="flex items-center border-b px-3" cmdk-input-wrapper>
            <CommandInput
              v-model="searchQuery"
              :placeholder="placeholder || 'Search...'"
              class="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0 focus:border-0 p-0"
            />
          </div>
          <CommandEmpty v-if="!loading && options.length === 0">
            {{ $t('common.No results found.') }}
          </CommandEmpty>
          <CommandList class="max-h-[250px] overflow-y-auto" @scroll="handleScroll">
            <CommandGroup v-if="options.length > 0">
              <CommandItem
                v-for="option in options"
                :key="option.value"
                :value="String(option.value)"
                @select="multiple ? toggleMultiSelect(option) : handleSingleSelect(option)"
              >
                {{ option.label }}
                <Check
                  v-if="multiple"
                  :class="
                    cn(
                      'ml-auto h-4 w-4',
                      multiSelectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0',
                    )
                  "
                />
                <Check
                  v-else
                  :class="
                    cn(
                      'ml-auto h-4 w-4',
                      singleSelectedValue === String(option.value) ? 'opacity-100' : 'opacity-0',
                    )
                  "
                />
              </CommandItem>
            </CommandGroup>
            <div v-if="loading" class="p-4 flex justify-center text-muted-foreground bg-accent/20">
              <Loader2 class="h-4 w-4 animate-spin mr-2" />{{ $t('common.Loading...') }}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <!-- Multi-select badges -->
    <div v-if="multiple && multiSelectedOptions.length > 0" class="flex flex-wrap gap-2 mt-2">
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
    <p v-if="error" class="text-[0.8rem] text-destructive font-medium">
      {{ error }}
    </p>
  </div>
</template>
