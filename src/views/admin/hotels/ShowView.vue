<script setup lang="ts">
import type { Hotel } from '@/types/hotel'
import {
  Building04Icon,
  Calendar03Icon,
  Clock01Icon,
  Edit02Icon,
  Globe02Icon,
  Location01Icon,
  Mail01Icon,
  MoneyBag02Icon,
  NoteIcon,
  SmartPhone01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDetails } from '@/composables/useDetails'
import { hotelsService } from '@/services/hotelsService'
import { Button } from '@/components/uic/button'

const { t } = useI18n()
const router = useRouter()

const { item, loading } = useDetails<Hotel>({
  resourceName: 'hotels',
  getFn: (id: string | number) => hotelsService.get(id),
  autoLoadId: true,
})

interface DetailField {
  label: string
  value: string | number | null | undefined
  icon: any
  dir?: string
}

function getFields(hotel: Hotel): DetailField[] {
  return [
    { label: t('hotels.fields.country', 'Country'), value: hotel.country, icon: Globe02Icon },
    { label: t('hotels.fields.currency', 'Currency'), value: hotel.currency, icon: MoneyBag02Icon },
    { label: t('hotels.fields.phone', 'Phone'), value: hotel.phone, icon: SmartPhone01Icon, dir: 'ltr' },
    { label: t('hotels.fields.email', 'Hotel Email'), value: hotel.email, icon: Mail01Icon },
    { label: t('hotels.fields.check_in_time', 'Check-in Time'), value: hotel.check_in_time, icon: Clock01Icon },
    { label: t('hotels.fields.check_out_time', 'Check-out Time'), value: hotel.check_out_time, icon: Clock01Icon },
    { label: t('hotels.fields.timezone', 'Timezone'), value: hotel.timezone?.replace(/_/g, ' '), icon: Globe02Icon },
    { label: t('hotels.fields.staff_count', 'Staff'), value: hotel.staff_count ?? 0, icon: UserGroupIcon },
    { label: t('hotels.fields.created_at', 'Created At'), value: hotel.created_at ? new Date(hotel.created_at).toLocaleDateString() : null, icon: Calendar03Icon },
  ]
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('hotels.title', 'Hotel') }} {{ t('common.details', 'Details') }}
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ t('hotels.subtitle', 'Manage hotels and their settings') }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          v-if="item"
          variant="outline"
          class="gap-2"
          @click="router.push({ name: 'admin-hotels-edit', params: { id: item.id } })"
        >
          <HugeiconsIcon :icon="Edit02Icon" :size="16" />
          {{ t('actions.edit', 'Edit') }}
        </Button>
        <Button variant="ghost" @click="router.push({ name: 'admin-hotels' })">
          {{ t('actions.back', 'Back') }}
        </Button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-20 flex flex-col items-center gap-3">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <span class="text-sm text-muted-foreground">{{ t('common.loading', 'Loading...') }}</span>
    </div>

    <template v-else-if="item">
      <!-- Hero Card -->
      <div class="rounded-xl border border-border bg-card overflow-hidden">
        <div class="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-6 border-b border-border/50">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <HugeiconsIcon :icon="Building04Icon" :size="28" />
              </div>
              <div>
                <h2 class="text-xl font-bold tracking-tight">{{ item.name }}</h2>
                <p v-if="item.address" class="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <HugeiconsIcon :icon="Location01Icon" :size="14" class="shrink-0" />
                  {{ item.address }}
                </p>
              </div>
            </div>
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize"
              :class="item.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-amber-500/10 text-amber-500'"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="item.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'"
              />
              {{ item.status }}
            </span>
          </div>
        </div>

        <!-- Fields Grid -->
        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="field in getFields(item)"
              :key="field.label"
              class="flex items-center gap-3"
            >
              <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <HugeiconsIcon :icon="field.icon" :size="18" />
              </div>
              <div class="min-w-0">
                <span class="text-[11px] uppercase tracking-widest text-muted-foreground/70 font-medium">
                  {{ field.label }}
                </span>
                <p class="font-semibold text-sm mt-0.5 truncate" :dir="field.dir">
                  {{ field.value || '—' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="item.description" class="pt-2 border-t border-border/50">
            <h3 class="text-[11px] uppercase tracking-widest text-muted-foreground/70 font-medium mb-2 flex items-center gap-2">
              <HugeiconsIcon :icon="NoteIcon" :size="14" />
              {{ t('hotels.fields.description', 'Description') }}
            </h3>
            <p class="text-sm leading-relaxed text-foreground/80">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
