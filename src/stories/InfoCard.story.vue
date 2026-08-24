<script setup lang="ts">
import { CreditCard, Shield, User } from 'lucide-vue-next'
import { InfoCard } from '@/components/uic/info-card'
import { KvItem, KvList } from '@/components/uic/kv-list'
</script>

<template>
  <Story title="InfoCard" group="display" icon="lucide:credit-card">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="grid grid-cols-1 gap-4">
            <InfoCard title="Personal Information" :icon="User">
              <KvList dividers="between">
                <KvItem label="Name" value="John Doe" />
                <KvItem label="Email" value="john@example.com" />
                <KvItem label="Phone" value="+1 234 567 890" />
              </KvList>
            </InfoCard>
            <InfoCard title="Payment Details" :icon="CreditCard">
              <KvList dividers="between">
                <KvItem label="Method" value="Visa ****4242" />
                <KvItem label="Billing" value="Monthly" />
              </KvList>
            </InfoCard>
            <InfoCard title="No Icon">
              <p class="text-sm text-muted-foreground">
                Card without an icon.
              </p>
            </InfoCard>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <InfoCard title="Security" :icon="Shield">
            <KvList dividers="between">
              <KvItem label="2FA" value="Enabled" />
              <KvItem label="Last Login" value="May 24, 2025" />
            </KvList>
          </InfoCard>
        </div>
      </div>
    </Variant>
  </Story>
</template>
