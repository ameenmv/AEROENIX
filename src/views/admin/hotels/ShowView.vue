<script setup lang="ts">
import { computed } from 'vue'
import type { Hotel } from '@/types/hotel'
import {
  ArrowLeft01Icon,
  Building04Icon,
  Clock01Icon,
  Edit02Icon,
  Globe02Icon,
  Location01Icon,
  Mail01Icon,
  NoteIcon,
  SmartPhone01Icon,
  UserGroupIcon,
  BedIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useDetails } from '@/composables/shared/useDetails'
import { hotelsService } from '@/services/hotelsService'
import { Button } from '@/components/uic/button'
import { Skeleton } from '@/components/uic/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/uic/tabs'
import RoomList from './components/RoomList.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const { item, loading } = useDetails<Hotel>({
  resourceName: 'hotels',
  getFn: (id: string | number) => hotelsService.get(id),
  autoLoadId: true,
})

const defaultTab = computed(() => (route.query.tab as string) || 'overview')
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Header & Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
      <div class="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          class="h-9 w-9 rounded-xl border-border/60 hover:bg-muted/80 transition-colors"
          @click="router.push({ name: 'admin-hotels' })"
        >
          <HugeiconsIcon :icon="ArrowLeft01Icon" :size="16" class="rtl:rotate-180" />
        </Button>
        <div>
          <div class="flex items-center gap-2.5">
            <template v-if="loading">
              <Skeleton class="h-7 w-48 rounded-lg" />
              <Skeleton class="h-5 w-16 rounded-full" />
            </template>
            <template v-else>
              <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {{ item?.name || t('hotels.title', 'Hotel Details') }}
              </h1>
              <span
                v-if="item"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider border select-none"
                :class="item.status === 'active'
                  ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                  : 'border-amber-500/25 bg-amber-500/10 text-amber-400'"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full me-1.5 shrink-0"
                  :class="item.status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]' : 'bg-amber-400'"
                />
                {{ item.status }}
              </span>
            </template>
          </div>
          <div v-if="loading" class="mt-1.5">
            <Skeleton class="h-3.5 w-56 rounded-md" />
          </div>
          <p v-else-if="item?.address" class="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <HugeiconsIcon :icon="Location01Icon" :size="13" class="shrink-0 text-muted-foreground" />
            <span>{{ item.address }}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Skeleton v-if="loading" class="h-8 w-24 rounded-xl" />
        <Button
          v-else-if="item"
          variant="outline"
          size="sm"
          class="gap-1.5 rounded-xl border-border/60 hover:bg-muted/80 text-xs"
          @click="router.push({ name: 'admin-hotels-edit', params: { id: item.id } })"
        >
          <HugeiconsIcon :icon="Edit02Icon" :size="15" />
          {{ t('actions.edit', 'Edit Hotel') }}
        </Button>
      </div>
    </div>

    <!-- Loading Skeleton View -->
    <div v-if="loading" class="space-y-6 animate-in fade-in duration-300">
      <!-- 4 Quick Glance KPI Ribbon Skeletons -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div
          v-for="i in 4"
          :key="i"
          class="rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl space-y-2.5"
        >
          <Skeleton class="h-4 w-20 rounded-md" />
          <Skeleton class="h-7 w-16 rounded-lg" />
          <Skeleton class="h-3 w-28 rounded-md" />
        </div>
      </div>

      <!-- Tabs and Main Content Skeletons -->
      <div class="space-y-4">
        <Skeleton class="h-10 w-72 rounded-xl" />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
              <Skeleton class="h-5 w-36 rounded-md" />
              <Skeleton class="h-4 w-full rounded-md" />
              <Skeleton class="h-4 w-4/5 rounded-md" />
              <Skeleton class="h-4 w-2/3 rounded-md" />
            </div>
            <div class="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
              <Skeleton class="h-5 w-40 rounded-md" />
              <div class="grid grid-cols-2 gap-4">
                <Skeleton class="h-12 w-full rounded-xl" />
                <Skeleton class="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
          <div class="lg:col-span-1 space-y-6">
            <div class="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
              <Skeleton class="h-5 w-32 rounded-md" />
              <Skeleton class="h-10 w-full rounded-xl" />
              <Skeleton class="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-else-if="item">
      <!-- 4 Quick Glance KPI Ribbon -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <!-- Rooms Count -->
        <div class="rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl">
          <div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon :icon="BedIcon" :size="14" class="text-primary" />
            {{ t('hotels.rooms_tab', 'Rooms') }}
          </div>
          <div class="mt-2 font-bold text-xl text-foreground">
            {{ item.rooms_count ?? 0 }}
          </div>
          <div class="mt-0.5 text-[11px] text-muted-foreground">
            Available accommodation
          </div>
        </div>

        <!-- Staff -->
        <div class="rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl">
          <div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon :icon="UserGroupIcon" :size="14" class="text-primary" />
            {{ t('hotels.fields.staff_count', 'Staff Members') }}
          </div>
          <div class="mt-2 font-bold text-xl text-foreground">
            {{ item.staff_count ?? 0 }}
          </div>
          <div class="mt-0.5 text-[11px] text-muted-foreground">
            Assigned hotel personnel
          </div>
        </div>

        <!-- Check In / Check Out -->
        <div class="rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl">
          <div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon :icon="Clock01Icon" :size="14" class="text-primary" />
            Schedule
          </div>
          <div class="mt-2 font-bold text-sm text-foreground">
            In: {{ item.check_in_time || '15:00' }} / Out: {{ item.check_out_time || '12:00' }}
          </div>
          <div class="mt-0.5 text-[11px] text-muted-foreground">
            Check-in & Check-out hours
          </div>
        </div>

        <!-- Currency & Region -->
        <div class="rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl">
          <div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon :icon="Globe02Icon" :size="14" class="text-primary" />
            Currency & Timezone
          </div>
          <div class="mt-2 font-bold text-base text-foreground font-mono">
            {{ item.currency || 'EGP' }} <span class="text-xs font-normal text-muted-foreground">({{ item.country || 'Global' }})</span>
          </div>
          <div class="mt-0.5 text-[11px] text-muted-foreground truncate">
            {{ item.timezone ? item.timezone.replace(/_/g, ' ') : 'UTC' }}
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <Tabs :default-value="defaultTab" class="w-full">
        <TabsList class="p-1 rounded-xl bg-muted/40 border border-border/50 w-fit backdrop-blur-md">
          <TabsTrigger value="overview" class="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <HugeiconsIcon :icon="Building04Icon" :size="15" />
            {{ t('hotels.overview', 'Overview') }}
          </TabsTrigger>
          <TabsTrigger value="rooms" class="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <HugeiconsIcon :icon="BedIcon" :size="15" />
            {{ t('hotels.rooms_tab', 'Rooms & Rates') }}
          </TabsTrigger>
        </TabsList>

        <!-- Overview Tab -->
        <TabsContent value="overview" class="mt-4 focus-visible:outline-none focus-visible:ring-0 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Property Details Card -->
            <div class="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 space-y-5">
              <div class="flex items-center gap-3 pb-3 border-b border-border/40">
                <div class="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <HugeiconsIcon :icon="Building04Icon" :size="20" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-foreground">{{ t('hotels.hotel_info', 'Property Overview') }}</h3>
                  <p class="text-xs text-muted-foreground">General identification and location</p>
                </div>
              </div>

              <div class="space-y-4 text-sm">
                <div class="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{{ t('hotels.fields.name', 'Hotel Name') }}</span>
                  <span class="font-semibold text-foreground">{{ item.name }}</span>
                </div>

                <div class="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{{ t('hotels.fields.country', 'Country') }}</span>
                  <span class="font-medium text-foreground">{{ item.country || '—' }}</span>
                </div>

                <div class="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{{ t('hotels.fields.currency', 'Currency') }}</span>
                  <span class="font-mono font-bold text-primary">{{ item.currency || '—' }}</span>
                </div>

                <div class="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{{ t('hotels.fields.created_at', 'Created At') }}</span>
                  <span class="text-xs font-mono text-muted-foreground">{{ item.created_at ? new Date(item.created_at).toLocaleDateString() : '—' }}</span>
                </div>

                <div class="py-1.5">
                  <span class="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">{{ t('hotels.fields.address', 'Address') }}</span>
                  <p class="text-foreground text-xs leading-relaxed p-3 rounded-xl bg-muted/30 border border-border/40">
                    {{ item.address || '—' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Operations & Contact Card -->
            <div class="space-y-6">
              <!-- Contact Info -->
              <div class="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 space-y-4">
                <div class="flex items-center gap-3 pb-3 border-b border-border/40">
                  <div class="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <HugeiconsIcon :icon="SmartPhone01Icon" :size="20" />
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-foreground">{{ t('hotels.location_contact', 'Contact Information') }}</h3>
                    <p class="text-xs text-muted-foreground">Phone, email, and staff access</p>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 text-xs">
                    <span class="text-muted-foreground flex items-center gap-2">
                      <HugeiconsIcon :icon="SmartPhone01Icon" :size="14" />
                      {{ t('hotels.fields.phone', 'Phone') }}
                    </span>
                    <a v-if="item.phone" :href="`tel:${item.phone}`" dir="ltr" class="font-mono font-medium text-foreground hover:text-primary">
                      {{ item.phone }}
                    </a>
                    <span v-else class="text-muted-foreground">—</span>
                  </div>

                  <div class="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 text-xs">
                    <span class="text-muted-foreground flex items-center gap-2">
                      <HugeiconsIcon :icon="Mail01Icon" :size="14" />
                      {{ t('hotels.fields.email', 'Email') }}
                    </span>
                    <a v-if="item.email" :href="`mailto:${item.email}`" class="font-medium text-foreground hover:text-primary truncate max-w-[200px]">
                      {{ item.email }}
                    </a>
                    <span v-else class="text-muted-foreground">—</span>
                  </div>
                </div>
              </div>

              <!-- Operational Schedule -->
              <div class="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 space-y-4">
                <div class="flex items-center gap-3 pb-3 border-b border-border/40">
                  <div class="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <HugeiconsIcon :icon="Clock01Icon" :size="20" />
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-foreground">{{ t('hotels.operations', 'Operational Hours') }}</h3>
                    <p class="text-xs text-muted-foreground">Guest arrival, departure, and time zone</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div class="p-3 rounded-xl bg-muted/30 border border-border/40">
                    <span class="text-muted-foreground block text-[11px] mb-1 uppercase tracking-wider font-semibold">{{ t('hotels.fields.check_in_time', 'Check-in Time') }}</span>
                    <span class="font-mono font-bold text-base text-foreground">{{ item.check_in_time || '15:00' }}</span>
                  </div>
                  <div class="p-3 rounded-xl bg-muted/30 border border-border/40">
                    <span class="text-muted-foreground block text-[11px] mb-1 uppercase tracking-wider font-semibold">{{ t('hotels.fields.check_out_time', 'Check-out Time') }}</span>
                    <span class="font-mono font-bold text-base text-foreground">{{ item.check_out_time || '12:00' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Description Box -->
          <div v-if="item.description" class="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6">
            <h3 class="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2 flex items-center gap-2">
              <HugeiconsIcon :icon="NoteIcon" :size="14" class="text-primary" />
              {{ t('hotels.fields.description', 'Description') }}
            </h3>
            <p class="text-sm leading-relaxed text-foreground/90 italic p-4 rounded-xl bg-muted/30 border border-border/40 border-s-4 border-s-primary">
              "{{ item.description }}"
            </p>
          </div>
        </TabsContent>

        <!-- Rooms Tab -->
        <TabsContent value="rooms" class="mt-4 focus-visible:outline-none focus-visible:ring-0">
          <RoomList :hotel-id="item.id" />
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>
