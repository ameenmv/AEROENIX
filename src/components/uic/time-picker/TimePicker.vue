<script setup lang="ts">
/**
 * TimePicker — scroll-wheel time picker with AM/PM.
 * Composes shadcn Popover + Button for the trigger/dropdown pattern.
 * Expects and emits HH:mm (24h format) as v-model.
 */
import type { HTMLAttributes } from 'vue'
import type { TimePickerVariants } from './variants'
import { Clock } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/uic/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/uic/popover'
import { Separator } from '@/components/uic/separator'
import { cn } from '@/utils/cn'
import { timePickerVariants } from './variants'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    disabled?: boolean
    placeholder?: string
    size?: TimePickerVariants['size']
    class?: HTMLAttributes['class']
  }>(),
  {
    modelValue: '12:00',
    disabled: false,
    placeholder: 'Pick time',
    size: 'default',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

const currentHour = ref(12)
const currentMinute = ref(0)
const currentPeriod = ref<'AM' | 'PM'>('AM')

const pad = (n: number) => n.toString().padStart(2, '0')

function initFromValue(val: string) {
  if (!val)
    return
  const [hStr, mStr] = val.split(':')
  const h24 = Number.parseInt(hStr!, 10)
  const m = Number.parseInt(mStr!, 10)
  if (Number.isNaN(h24) || Number.isNaN(m))
    return

  currentMinute.value = m
  if (h24 >= 12) {
    currentPeriod.value = 'PM'
    currentHour.value = h24 === 12 ? 12 : h24 - 12
  }
  else {
    currentPeriod.value = 'AM'
    currentHour.value = h24 === 0 ? 12 : h24
  }
}

watch(() => props.modelValue, v => initFromValue(v), { immediate: true })

const displayTime = computed(
  () => `${pad(currentHour.value)}:${pad(currentMinute.value)} ${currentPeriod.value}`,
)

const prevHour = computed(() => (currentHour.value === 1 ? 12 : currentHour.value - 1))
const nextHour = computed(() => (currentHour.value === 12 ? 1 : currentHour.value + 1))
const prevMin = computed(() => (currentMinute.value === 0 ? 59 : currentMinute.value - 1))
const nextMin = computed(() => (currentMinute.value === 59 ? 0 : currentMinute.value + 1))

function changeHour(dir: number) {
  currentHour.value = dir > 0 ? nextHour.value : prevHour.value
}

function changeMinute(dir: number) {
  currentMinute.value = dir > 0 ? nextMin.value : prevMin.value
}

function togglePeriod() {
  currentPeriod.value = currentPeriod.value === 'AM' ? 'PM' : 'AM'
}

let wheelAcc = 0
function handleWheel(e: WheelEvent, type: 'hour' | 'minute' | 'period') {
  wheelAcc += e.deltaY
  if (Math.abs(wheelAcc) > 50) {
    const dir = wheelAcc > 0 ? 1 : -1
    wheelAcc = 0
    if (type === 'hour')
      changeHour(dir)
    else if (type === 'minute')
      changeMinute(dir)
    else togglePeriod()
  }
}

function applyTime() {
  let h24 = currentHour.value
  if (currentPeriod.value === 'PM' && h24 !== 12)
    h24 += 12
  else if (currentPeriod.value === 'AM' && h24 === 12)
    h24 = 0
  emit('update:modelValue', `${pad(h24)}:${pad(currentMinute.value)}`)
  isOpen.value = false
}

function onOpenChange(open: boolean) {
  isOpen.value = open
  if (open)
    initFromValue(props.modelValue)
}
</script>

<template>
  <Popover :open="isOpen" @update:open="onOpenChange">
    <PopoverTrigger as-child>
      <Button
        data-slot="time-picker"
        variant="outline"
        :disabled="disabled"
        :class="cn(
          timePickerVariants({ size }),
          'justify-start text-left font-normal gap-2',
          !modelValue && 'text-muted-foreground',
          props.class,
        )"
      >
        <Clock :size="14" class="text-muted-foreground" />
        {{ displayTime }}
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-[200px] p-0" align="start">
      <!-- Columns -->
      <div class="flex justify-center gap-4 px-3 py-4">
        <!-- Hours -->
        <div class="flex flex-col items-center gap-2.5 w-9" @wheel.prevent="handleWheel($event, 'hour')">
          <button
            type="button"
            class="text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer"
            @click="changeHour(-1)"
          >
            {{ pad(prevHour) }}
          </button>
          <span class="text-foreground font-semibold text-base leading-none py-2">{{ pad(currentHour) }}</span>
          <button
            type="button"
            class="text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer"
            @click="changeHour(1)"
          >
            {{ pad(nextHour) }}
          </button>
        </div>

        <span class="text-foreground font-bold self-center">:</span>

        <!-- Minutes -->
        <div class="flex flex-col items-center gap-2.5 w-9" @wheel.prevent="handleWheel($event, 'minute')">
          <button
            type="button"
            class="text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer"
            @click="changeMinute(-1)"
          >
            {{ pad(prevMin) }}
          </button>
          <span class="text-foreground font-semibold text-base leading-none py-2">{{ pad(currentMinute) }}</span>
          <button
            type="button"
            class="text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer"
            @click="changeMinute(1)"
          >
            {{ pad(nextMin) }}
          </button>
        </div>

        <!-- AM/PM -->
        <div class="flex flex-col items-center gap-2.5 w-11" @wheel.prevent="handleWheel($event, 'period')">
          <button
            type="button"
            :class="cn(
              'text-sm transition-colors cursor-pointer',
              currentPeriod === 'AM' ? 'text-muted-foreground/40' : 'text-muted-foreground hover:text-foreground',
            )"
            @click="currentPeriod !== 'AM' && togglePeriod()"
          >
            {{ $t('common.am', 'AM') }}
          </button>
          <span class="text-foreground font-semibold text-base leading-none py-2">{{ currentPeriod }}</span>
          <button
            type="button"
            :class="cn(
              'text-sm transition-colors cursor-pointer',
              currentPeriod === 'PM' ? 'text-muted-foreground/40' : 'text-muted-foreground hover:text-foreground',
            )"
            @click="currentPeriod !== 'PM' && togglePeriod()"
          >
            {{ $t('common.pm', 'PM') }}
          </button>
        </div>
      </div>

      <Separator />

      <!-- Set button -->
      <div class="flex justify-center p-2">
        <Button size="sm" class="w-full" @click="applyTime">
          {{ $t('common.set_time', 'Set time') }}
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
