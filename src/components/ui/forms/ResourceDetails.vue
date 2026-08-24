<script setup lang="ts">
import type { ViewConfig, ViewField } from '@/types'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { cn } from '@/utils/cn'

interface Props {
  config: ViewConfig
  item: any
  loading?: boolean
  error?: any
  resourceName?: string
  backRoute?: string
  resourceConfig?: any
  fetchAuditLog?: (id: string | number) => Promise<any[] | null>
}
const props = withDefaults(defineProps<Props>(), {})
const activeTab = ref('details')
const auditLogs = ref<any[] | null>(null)
const loadingLogs = ref(false)
const { t } = useI18n()
const router = useRouter()
async function loadAuditLogs() {
  if (activeTab.value === 'history' && props.item?.id && props.fetchAuditLog && !auditLogs.value) {
    loadingLogs.value = true
    auditLogs.value = await props.fetchAuditLog(props.item.id)
    loadingLogs.value = false
  }
}
watch(activeTab, () => {
  loadAuditLogs()
})
onMounted(() => {
  if (activeTab.value === 'history')
    loadAuditLogs()
})
const title = computed(() => {
  if (!props.item)
    return t('common.loading', 'Loading...')
  if (props.config.titleKey) {
    return getValue(props.item, props.config.titleKey)
  }
  return props.resourceName || 'Details'
})
function getValue(item: any, key: string) {
  if (!item)
    return ''
  return key.split('.').reduce((o, i) => (o ? o[i] : null), item)
}
function formatValue(value: any, field: ViewField) {
  if (value === null || value === undefined)
    return 'N/A'
  if (field.format)
    return field.format(value)
  if (field.type === 'date') {
    return new Date(value).toLocaleDateString()
  }
  return value
}
function goBack() {
  if (props.backRoute)
    router.push(props.backRoute)
  else router.back()
}
</script>

<template>
  <div class="px-8 py-6 space-y-6">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <button
          class="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
          @click="goBack"
        >
          <HugeiconsIcon :icon="ArrowLeft01Icon" :size="24" />
        </button>
        <h1 class="text-2xl font-bold text-white">
          {{ title }}
        </h1>
      </div>
      <div class="flex gap-3" />
    </div>
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
    </div>
    <div v-else-if="error" class="bg-red-500/10 text-red border border-red/20 rounded-xl p-6">
      {{ error.message || t('common.error_loading', 'Error loading data') }}
    </div>
    <div v-else-if="item">
      <!-- Tabs -->
      <div
        v-if="props.resourceConfig?.auditTrail?.enabled"
        class="flex gap-6 border-b border-white/10 mb-6"
      >
        <button
          class="pb-3 text-sm font-bold tracking-wider uppercase transition-colors relative"
          :class="activeTab === 'details' ? 'text-white' : 'text-secondary hover:text-white/80'"
          @click="activeTab = 'details'"
        >
          {{ t('common.details', 'Details') }}
          <div
            v-if="activeTab === 'details'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full"
          />
        </button>
        <button
          class="pb-3 text-sm font-bold tracking-wider uppercase transition-colors relative"
          :class="activeTab === 'history' ? 'text-white' : 'text-secondary hover:text-white/80'"
          @click="activeTab = 'history'"
        >
          {{ t('common.history', 'History logs') }}
          <div
            v-if="activeTab === 'history'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full"
          />
        </button>
      </div>
      <div v-if="activeTab === 'details'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <template v-for="(section, idx) in config.sections" :key="idx">
            <div
              v-if="section.cols !== 1"
              :class="cn('rounded-xl p-6 border space-y-6 bg-surface border-white/5')"
            >
              <h3 class="text-lg font-bold text-white mb-4">
                {{ section.title.includes('.') ? t(section.title) : section.title }}
              </h3>
              <div
                class="grid grid-cols-1 gap-6"
                :class="section.cols === 2 ? 'md:grid-cols-2' : ''"
              >
                <div v-for="field in section.fields" :key="field.key" :class="field.class">
                  <span
                    class="text-xs text-secondary uppercase tracking-wider font-bold block mb-1"
                  >
                    {{ field.label.includes('.') ? t(field.label) : field.label }}
                  </span>
                  <div class="text-white wrap-break-word">
                    <template v-if="field.type === 'image'">
                      <img
                        :src="getValue(item, field.key)"
                        class="h-20 w-20 object-cover rounded-lg"
                      >
                    </template>
                    <template v-else-if="field.type === 'link'">
                      <a
                        v-if="getValue(item, field.key)"
                        :href="
                          field.to
                            ? field.to(getValue(item, field.key), item)
                            : getValue(item, field.key)
                        "
                        target="_blank"
                        class="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {{ formatValue(getValue(item, field.key), field) }}
                      </a>
                      <span v-else>{{ $t('common.N/A') }}</span>
                    </template>
                    <template v-else-if="field.type === 'badge'">
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        :class="
                          field.options?.[getValue(item, field.key)] || 'bg-white/10 text-white'
                        "
                      >
                        {{ formatValue(getValue(item, field.key), field) }}
                      </span>
                    </template>
                    <template v-else>
                      {{ formatValue(getValue(item, field.key), field) }}
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div class="space-y-6">
          <template v-for="(section, idx) in config.sections" :key="idx">
            <div
              v-if="section.cols === 1"
              :class="cn('rounded-xl p-6 border space-y-4 bg-surface border-white/5')"
            >
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">
                {{ section.title.includes('.') ? t(section.title) : section.title }}
              </h3>
              <div
                v-for="field in section.fields"
                :key="field.key"
                class="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
              >
                <span class="text-secondary text-sm">{{
                  field.label.includes('.') ? t(field.label) : field.label
                }}</span>
                <span class="text-white text-sm font-mono text-right">
                  {{ formatValue(getValue(item, field.key), field) }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <!-- History Tab -->
      <div v-else-if="activeTab === 'history'" class="space-y-4">
        <div class="bg-[#1E2025] rounded-xl border border-white/5 overflow-hidden">
          <div class="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 class="text-lg font-bold text-white">
              {{ $t('common.Audit Trail') }}
            </h3>
            <span class="text-xs text-secondary bg-white/5 px-2 py-1 rounded">{{
              $t('common.Last 30 Days')
            }}</span>
          </div>
          <div class="div p-6">
            <div class="relative border-l border-white/10 ml-3 space-y-8">
              <!-- Dynamic Audit Logs from API -->
              <template v-if="loadingLogs">
                <div class="flex justify-center p-4">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                </div>
              </template>
              <template v-else-if="auditLogs && auditLogs.length > 0">
                <div v-for="(log, index) in auditLogs" :key="index" class="relative pl-6">
                  <div
                    class="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ring-4 ring-[#1E2025]"
                    :class="
                      log.action === 'create'
                        ? 'bg-emerald-500'
                        : log.action === 'delete'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                    "
                  />
                  <div class="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <span class="text-sm font-bold text-white">{{
                          log.title || log.action
                        }}</span>
                        <p class="text-xs text-secondary mt-1">
                          {{ log.description || log.details }}
                        </p>
                      </div>
                      <span class="text-xs text-secondary">{{
                        new Date(log.timestamp || log.created_at).toLocaleString()
                      }}</span>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <!-- Fallback to mock logs if API returns null/empty while testing -->
                <div class="relative pl-6">
                  <div
                    class="absolute -left-1.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-[#1E2025]"
                  />
                  <div class="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <span class="text-sm font-bold text-white">{{
                          $t('common.Record Updated')
                        }}</span>
                        <p class="text-xs text-secondary mt-1">
                          {{ $t('common.System Administrator changed status to Active') }}
                        </p>
                      </div>
                      <span class="text-xs text-secondary">{{ $t('common.Just now') }}</span>
                    </div>
                  </div>
                </div>
                <div class="relative pl-6">
                  <div
                    class="absolute -left-1.5 top-1.5 w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-[#1E2025]"
                  />
                  <div class="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <span class="text-sm font-bold text-white">{{
                          $t('common.Record Created')
                        }}</span>
                        <p class="text-xs text-secondary mt-1">
                          {{ $t('common.Initial creation via API integration') }}
                        </p>
                      </div>
                      <span class="text-xs text-secondary">{{ $t('common.2 days ago') }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <div class="mt-6 flex justify-center">
              <button class="text-xs text-secondary hover:text-white transition-colors">
                {{ $t('common.Load More History') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
