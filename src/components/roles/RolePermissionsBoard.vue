<script setup lang="ts">
import type { PermissionModule, Role } from '@/types/entities/role'
import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarCheck,
  Check,
  Cpu,
  KeyRound,
  Layers,
  Lock,
  MessagesSquare,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Target,
  Users,
  X,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  role: Role
  modules: PermissionModule[]
  /** Currently selected permission IDs */
  modelValue: number[]
  /** Original permission IDs (used to highlight unsaved changes) */
  original?: number[]
  editable?: boolean
}>(), {
  original: () => [],
  editable: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const { t } = useI18n()

// ── Filters ──────────────────────────────────────────────────────────────────
type FilterKey = 'all' | 'granted' | 'missing'
const search = ref('')
const filter = ref<FilterKey>('all')

const selectedSet = computed(() => new Set(props.modelValue))
const originalSet = computed(() => new Set(props.original))

function isGranted(id: number) {
  return selectedSet.value.has(id)
}

function isChanged(id: number) {
  return props.editable && selectedSet.value.has(id) !== originalSet.value.has(id)
}

// ── Stats ────────────────────────────────────────────────────────────────────
const allPermissionIds = computed(() => props.modules.flatMap(m => m.permissions.map(p => p.id)))
const totalCount = computed(() => allPermissionIds.value.length)
const grantedCount = computed(() => allPermissionIds.value.filter(id => selectedSet.value.has(id)).length)
const coveragePct = computed(() => totalCount.value ? Math.round((grantedCount.value / totalCount.value) * 100) : 0)
const modulesCovered = computed(() => props.modules.filter(m => m.permissions.some(p => selectedSet.value.has(p.id))).length)

// Progress ring geometry
const RING_R = 30
const RING_C = 2 * Math.PI * RING_R
const ringOffset = computed(() => RING_C - (coveragePct.value / 100) * RING_C)

// ── Helpers ──────────────────────────────────────────────────────────────────
function prettify(action: string) {
  return action
    .split(/[._-]/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function moduleIcon(name: string) {
  const n = name.toLowerCase()
  if (n.includes('hotel')) return Building2
  if (n.includes('role') || n.includes('permission')) return ShieldCheck
  if (n.includes('user') || n.includes('staff')) return Users
  if (n.includes('booking') || n.includes('reserv')) return CalendarCheck
  if (n.includes('knowledge') || n.includes('faq')) return BookOpen
  if (n.includes('inbox') || n.includes('conversation') || n.includes('chat')) return MessagesSquare
  if (n.includes('lead')) return Target
  if (n.includes('report') || n.includes('analytic')) return BarChart3
  if (n.includes('channel')) return Share2
  if (n.includes('setting')) return Settings
  if (n.includes('core') || n.includes('system')) return Cpu
  return KeyRound
}

const visibleModules = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.modules
    .map((mod) => {
      const moduleMatches = q && mod.name.toLowerCase().includes(q)
      const perms = mod.permissions.filter((p) => {
        if (filter.value === 'granted' && !isGranted(p.id)) return false
        if (filter.value === 'missing' && isGranted(p.id)) return false
        if (!q || moduleMatches) return true
        return p.action.toLowerCase().includes(q) || prettify(p.action).toLowerCase().includes(q)
      })
      const granted = mod.permissions.filter(p => isGranted(p.id)).length
      return {
        ...mod,
        icon: moduleIcon(mod.name),
        visible: perms,
        granted,
        total: mod.permissions.length,
        pct: mod.permissions.length ? Math.round((granted / mod.permissions.length) * 100) : 0,
      }
    })
    .filter(m => m.visible.length > 0)
})

const filterOptions = computed<{ key: FilterKey, label: string, count: number }[]>(() => [
  { key: 'all', label: t('roles.board.filter_all', 'All'), count: totalCount.value },
  { key: 'granted', label: t('roles.board.filter_granted', 'Granted'), count: grantedCount.value },
  { key: 'missing', label: t('roles.board.filter_missing', 'Not granted'), count: totalCount.value - grantedCount.value },
])

// ── Mutations (edit mode) ────────────────────────────────────────────────────
function toggle(id: number) {
  if (!props.editable) return
  const next = new Set(props.modelValue)
  next.has(id) ? next.delete(id) : next.add(id)
  emit('update:modelValue', [...next])
}

function toggleModule(mod: PermissionModule) {
  if (!props.editable) return
  const allOn = mod.permissions.every(p => selectedSet.value.has(p.id))
  const next = new Set(props.modelValue)
  mod.permissions.forEach(p => (allOn ? next.delete(p.id) : next.add(p.id)))
  emit('update:modelValue', [...next])
}

function isModuleFull(mod: PermissionModule) {
  return mod.permissions.length > 0 && mod.permissions.every(p => selectedSet.value.has(p.id))
}
</script>

<template>
  <div class="space-y-6">
    <!-- ══════════════ Hero / Summary ══════════════ -->
    <section class="relative overflow-hidden rounded-2xl border border-border/50 bg-card/60">
      <div class="pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-28 -start-20 h-56 w-56 rounded-full bg-emerald-500/5 blur-3xl" />

      <div class="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
        <!-- Identity -->
        <div class="flex items-start gap-4 min-w-0">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <ShieldCheck class="h-6 w-6" />
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-xl font-bold tracking-tight text-foreground truncate">
                {{ role.name }}
              </h2>
              <span
                class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize"
                :class="role.scope === 'platform'
                  ? 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                  : 'border-violet-500/30 bg-violet-500/10 text-violet-400'"
              >
                {{ role.scope === 'platform' ? t('roles.board.scope_platform', 'Platform') : t('roles.board.scope_hotel', 'Hotel') }}
              </span>
              <span
                v-if="role.is_custom"
                class="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400"
              >
                {{ t('roles.board.custom', 'Custom') }}
              </span>
            </div>
            <p class="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {{ role.description || (editable
                ? t('roles.board.edit_hint', 'Click any permission to grant or revoke it. Changes are saved when you press Save.')
                : t('roles.board.view_hint', 'Overview of everything this role can access across the platform.')) }}
            </p>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-6">
          <div class="relative h-[76px] w-[76px] shrink-0">
            <svg viewBox="0 0 76 76" class="h-full w-full -rotate-90">
              <circle cx="38" cy="38" :r="RING_R" fill="none" stroke-width="6" class="stroke-muted/40" />
              <circle
                cx="38" cy="38" :r="RING_R" fill="none" stroke-width="6" stroke-linecap="round"
                class="stroke-emerald-400 transition-[stroke-dashoffset] duration-700 ease-out"
                :stroke-dasharray="RING_C"
                :stroke-dashoffset="ringOffset"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-base font-bold text-foreground leading-none">{{ coveragePct }}%</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-x-6 gap-y-1">
            <div>
              <p class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {{ t('roles.board.granted', 'Granted') }}
              </p>
              <p class="mt-0.5 text-lg font-bold text-foreground">
                {{ grantedCount }}<span class="text-sm font-medium text-muted-foreground"> / {{ totalCount }}</span>
              </p>
            </div>
            <div>
              <p class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {{ t('roles.board.modules', 'Modules') }}
              </p>
              <p class="mt-0.5 text-lg font-bold text-foreground">
                {{ modulesCovered }}<span class="text-sm font-medium text-muted-foreground"> / {{ modules.length }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════ Toolbar ══════════════ -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative w-full sm:max-w-xs">
        <Search class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="search"
          type="text"
          :placeholder="t('roles.board.search', 'Search permissions...')"
          class="h-10 w-full rounded-xl border border-border/50 bg-card/60 ps-9 pe-9 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        >
        <button
          v-if="search"
          type="button"
          class="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          @click="search = ''"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </div>

      <div class="inline-flex rounded-xl border border-border/50 bg-card/60 p-1">
        <button
          v-for="opt in filterOptions"
          :key="opt.key"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
          :class="filter === opt.key
            ? 'bg-foreground/10 text-foreground shadow-xs'
            : 'text-muted-foreground hover:text-foreground'"
          @click="filter = opt.key"
        >
          {{ opt.label }}
          <span
            class="rounded-md px-1.5 py-px text-[10px] tabular-nums"
            :class="filter === opt.key ? 'bg-foreground/10' : 'bg-muted/40'"
          >{{ opt.count }}</span>
        </button>
      </div>
    </div>

    <!-- ══════════════ Module Cards ══════════════ -->
    <div v-if="visibleModules.length" class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <section
        v-for="mod in visibleModules"
        :key="mod.name"
        class="group/card rounded-2xl border border-border/50 bg-card/50 p-5 transition-colors duration-300 hover:border-border"
      >
        <!-- Card header -->
        <header class="flex items-center gap-3">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors"
            :class="mod.granted > 0
              ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
              : 'border-border/50 bg-muted/30 text-muted-foreground'"
          >
            <component :is="mod.icon" class="h-[18px] w-[18px]" />
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-bold capitalize tracking-tight text-foreground">
              {{ mod.name }}
            </h3>
            <div class="mt-1.5 flex items-center gap-2">
              <div class="h-1 w-full max-w-[140px] overflow-hidden rounded-full bg-muted/40">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="mod.pct === 100 ? 'bg-emerald-400' : 'bg-emerald-400/70'"
                  :style="{ width: `${mod.pct}%` }"
                />
              </div>
              <span class="text-[11px] font-medium tabular-nums text-muted-foreground">
                {{ mod.granted }}/{{ mod.total }}
              </span>
            </div>
          </div>

          <button
            v-if="editable"
            type="button"
            class="shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition"
            :class="isModuleFull(mod)
              ? 'border-border/50 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'"
            @click="toggleModule(mod)"
          >
            {{ isModuleFull(mod) ? t('roles.board.revoke_all', 'Revoke all') : t('roles.board.grant_all', 'Grant all') }}
          </button>
        </header>

        <div class="my-4 h-px bg-border/40" />

        <!-- Permission tiles -->
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <component
            :is="editable ? 'button' : 'div'"
            v-for="perm in mod.visible"
            :key="perm.id"
            :type="editable ? 'button' : undefined"
            class="relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-all duration-200"
            :class="[
              isGranted(perm.id)
                ? 'border-emerald-500/25 bg-emerald-500/[0.07]'
                : 'border-border/40 bg-muted/10',
              editable && 'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              editable && (isGranted(perm.id) ? 'hover:bg-emerald-500/[0.12]' : 'hover:border-border hover:bg-muted/30'),
            ]"
            @click="toggle(perm.id)"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors"
              :class="isGranted(perm.id)
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-muted/40 text-muted-foreground/60'"
            >
              <Check v-if="isGranted(perm.id)" class="h-3.5 w-3.5" stroke-width="3" />
              <Lock v-else class="h-3 w-3" />
            </span>

            <span class="min-w-0 flex-1">
              <span
                class="block truncate text-[13px] font-semibold"
                :class="isGranted(perm.id) ? 'text-foreground' : 'text-muted-foreground'"
              >
                {{ prettify(perm.action) }}
              </span>
              <span class="block truncate font-mono text-[10.5px] text-muted-foreground/60">
                {{ perm.action }}
              </span>
            </span>

            <!-- Toggle indicator (edit) -->
            <span
              v-if="editable"
              class="relative h-4 w-7 shrink-0 rounded-full transition-colors"
              :class="isGranted(perm.id) ? 'bg-emerald-500/70' : 'bg-muted/60'"
            >
              <span
                class="absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all"
                :class="isGranted(perm.id) ? 'start-3.5' : 'start-0.5'"
              />
            </span>

            <!-- Unsaved change dot -->
            <span
              v-if="isChanged(perm.id)"
              class="absolute -top-1 -end-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-background"
              :title="t('roles.board.unsaved', 'Unsaved change')"
            />
          </component>
        </div>
      </section>
    </div>

    <!-- Empty search -->
    <div v-else class="rounded-2xl border border-dashed border-border/60 py-16 text-center">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted/30 text-muted-foreground">
        <Layers class="h-5 w-5" />
      </div>
      <p class="mt-3 text-sm font-semibold text-foreground">
        {{ t('roles.board.no_results', 'No permissions match your filters') }}
      </p>
      <button type="button" class="mt-2 text-xs font-medium text-primary hover:underline" @click="search = ''; filter = 'all'">
        {{ t('roles.board.clear_filters', 'Clear filters') }}
      </button>
    </div>
  </div>
</template>
