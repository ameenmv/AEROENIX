<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { Button } from '@/components/uic/button'
import { PageHeader } from '@/components/uic/page-header'
</script>

<template>
  <Story title="PageHeader" group="navigation" icon="lucide:heading">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <PageHeader
            title="Users"
            description="Manage platform users"
            :breadcrumbs="[{ label: 'Home', href: '#' }, { label: 'Users' }]"
          >
            <template #actions>
              <Button variant="add" size="sm">
                <Plus :size="14" class="mr-1" />
                Add User
              </Button>
            </template>
          </PageHeader>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <PageHeader title="Settings" description="Configure your application" />
        </div>
      </div>
    </Variant>
  </Story>
</template>
