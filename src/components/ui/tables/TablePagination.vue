<script setup lang="ts">
/**
 * TablePagination — Reusable pagination footer for tables & lists.
 *
 * Used internally by DataTable and can also be used standalone
 * in views that don't use DataTable (Knowledge Base, Activity Logs, Staff QnA).
 *
 * @example
 * <TablePagination
 *   :page="currentPage"
 *   :per-page="perPage"
 *   :total-items="totalItems"
 *   @update:page="goToPage"
 *   @update:per-page="setPerPage"
 * />
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    /** Current page (1-indexed) */
    page: number
    /** Items per page */
    perPage: number
    /** Total number of items across all pages */
    totalItems: number
    /** Per-page options to show in the select dropdown */
    perPageOptions?: { value: number; label: string }[]
    /** Whether to show the "Showing X to Y of Z" info text */
    showInfo?: boolean
    /** Whether to show the per-page selector */
    showPerPage?: boolean
    /** Additional class for the container */
    class?: string
  }>(),
  {
    perPageOptions: () => [
      { value: 5, label: '5' },
      { value: 10, label: '10' },
      { value: 25, label: '25' },
      { value: 50, label: '50' },
    ],
    showInfo: true,
    showPerPage: true,
  },
)

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:per-page', perPage: number): void
}>()

const { t } = useI18n()

const totalPages = computed(() => Math.ceil(props.totalItems / props.perPage))
const showingStart = computed(() => (props.page - 1) * props.perPage + 1)
const showingEnd = computed(() => Math.min(props.page * props.perPage, props.totalItems))

function handlePageChange(p: number) {
  if (p >= 1 && p <= totalPages.value) {
    emit('update:page', p)
  }
}

function handlePerPageChange(val: number) {
  emit('update:per-page', val)
  emit('update:page', 1)
}
</script>

<template>
  <div
    v-if="totalItems > 0"
    class="flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6 py-[16px]"
  >
    <!-- "Showing X to Y of Z" -->
    <span
      v-if="showInfo"
      class="text-[11.6px] font-bold text-muted-foreground tracking-[1.16px] text-center md:text-start w-full md:w-auto"
    >
      {{
        t('common.showing_info', {
          start: showingStart,
          end: showingEnd,
          total: totalItems,
        })
      }}
    </span>

    <div
      class="flex flex-col sm:flex-row items-center justify-center md:justify-end gap-4 sm:gap-6 w-full md:w-auto"
    >
      <!-- Per-page selector -->
      <div v-if="showPerPage" class="flex items-center gap-2">
        <SelectField
          :model-value="perPage"
          :options="perPageOptions"
          variant="default"
          size="sm"
          class="w-[60px]"
          @update:model-value="handlePerPageChange(Number($event))"
        />
        <span class="text-[12px] text-muted-foreground whitespace-nowrap font-medium">{{
          t('common.entries_per_page')
        }}</span>
      </div>

      <!-- Page navigation -->
      <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="none"
          size="none"
          class="flex items-center justify-center px-[12.6px] py-[6.3px] border border-border rounded-[8.4px] text-foreground/70 transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-[14.7px] font-bold gap-1"
          :disabled="page === 1"
          @click="handlePageChange(page - 1)"
        >
          {{ t('common.previous', 'Previous') }}
        </Button>

        <div class="flex items-center gap-1 mx-0 sm:mx-2 flex-wrap justify-center">
          <template v-for="p in totalPages" :key="p">
            <Button
              v-if="p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)"
              variant="none"
              size="none"
              class="w-8 h-8 flex items-center justify-center rounded-md text-[14px] transition-colors"
              :class="
                page === p
                  ? 'bg-seen-blue-3050 text-white font-bold shadow-sm'
                  : 'text-muted-foreground hover:bg-muted font-semibold'
              "
              @click="handlePageChange(p)"
            >
              {{ p }}
            </Button>
            <span
              v-else-if="p === page - 2 || p === page + 2"
              class="text-muted-foreground leading-none"
            >...</span>
          </template>
        </div>

        <Button
          variant="none"
          size="none"
          class="flex items-center justify-center px-[12.6px] py-[6.3px] border border-border rounded-[8.4px] text-foreground/70 transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-[14.7px] font-bold gap-1"
          :disabled="page === totalPages"
          @click="handlePageChange(page + 1)"
        >
          {{ t('common.next', 'Next') }}
        </Button>
      </div>
    </div>
  </div>
</template>
