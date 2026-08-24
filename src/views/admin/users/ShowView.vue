<script setup lang="ts">
import type { User } from '@/types/entities/users'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDetails } from '@/composables/useDetails'
import { usersService } from '@/services/usersService'

const { t } = useI18n()
const router = useRouter()

const { item, loading } = useDetails<User>({
  resourceName: 'users',
  getFn: (id: string | number) => usersService.get(id),
  autoLoadId: true,
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        {{ t('users.title', 'User') }} {{ t('common.details', 'Details') }}
      </h1>
      <Button variant="ghost" @click="router.push({ name: 'admin-users' })">
        {{ t('actions.back', 'Back') }}
      </Button>
    </div>

    <div class="rounded-xl border border-border bg-card">
      <div v-if="loading" class="py-12 text-center text-muted-foreground">
        {{ t('common.loading', 'Loading...') }}
      </div>
      <div v-else-if="item" class="p-6 space-y-8">
        <!-- User Header -->
        <div>
          <h2 class="text-xl font-semibold">
            {{ item.name }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ item.email }}
          </p>
          <div class="mt-2 flex items-center gap-2">
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              :class="item.email_verified_at ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'"
            >
              {{ item.email_verified_at ? `✓ ${t('users.verified', 'Verified')}` : t('users.unverified', 'Unverified') }}
            </span>
          </div>
        </div>

        <!-- Detail Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span class="text-sm text-muted-foreground">{{ t('users.fields.email', 'Email') }}</span>
            <p class="font-medium mt-1">
              {{ item.email }}
            </p>
          </div>
          <div>
            <span class="text-sm text-muted-foreground">{{ t('users.fields.created_at', 'Created At') }}</span>
            <p class="font-medium mt-1">
              {{ new Date(item.created_at).toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
