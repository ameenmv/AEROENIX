<script setup lang="ts">
import { KvItem, KvList } from '@/components/uic/kv-list'
</script>

<template>
  <Story title="KvList" group="display" icon="lucide:list">
    <Variant title="Between Layout">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <KvList dividers="between" class="max-w-md">
            <KvItem label="Name" value="John Doe" />
            <KvItem label="Email" value="john@example.com" />
            <KvItem label="Phone" value="+1 234 567 890" />
            <KvItem label="Account ID" value="ACC-2024-00123" :mono="true" />
            <KvItem label="Status">
              <span class="text-green-600 font-semibold text-sm">Active</span>
            </KvItem>
          </KvList>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <KvList dividers="between" class="max-w-md">
            <KvItem label="Name" value="John Doe" />
            <KvItem label="Email" value="john@example.com" />
            <KvItem label="Phone" value="+1 234 567 890" />
            <KvItem label="Account ID" value="ACC-2024-00123" :mono="true" />
            <KvItem label="Status">
              <span class="text-green-400 font-semibold text-sm">Active</span>
            </KvItem>
          </KvList>
        </div>
      </div>
    </Variant>
    <Variant title="Stacked Layout">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light — Stacked
          </h3>
          <div class="grid grid-cols-2 gap-4 max-w-md">
            <KvItem layout="stacked" label="Full Name" value="Jane Smith" />
            <KvItem layout="stacked" label="Role" value="Administrator" />
            <KvItem layout="stacked" label="Created" value="2024-01-15" />
            <KvItem layout="stacked" label="Balance" value="$12,500.00" :mono="true" />
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark — Stacked
          </h3>
          <div class="grid grid-cols-2 gap-4 max-w-md">
            <KvItem layout="stacked" label="Full Name" value="Jane Smith" />
            <KvItem layout="stacked" label="Role" value="Administrator" />
            <KvItem layout="stacked" label="Created" value="2024-01-15" />
            <KvItem layout="stacked" label="Balance" value="$12,500.00" :mono="true" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
