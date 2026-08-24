<script setup lang="ts">
import { BookOpen01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/uic/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uic/card'
</script>

<template>
  <div class="p-6 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background">
    <div class="max-w-[1400px] mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('common.Dashboard') }}
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{{ $t('common.Welcome to Neop Base') }}</CardTitle>
          <CardDescription>
            {{ $t('common.Start building your new dashboard design here.') }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-sm text-muted-foreground">
            {{
              $t(
                'common.The old dashboard content has been removed to give you a clean slate. You can use our comprehensive set of shadcn/ui Vue components to build your new interface.',
              )
            }}
          </p>
          <Alert>
            <HugeiconsIcon :icon="BookOpen01Icon" class="h-4 w-4" />
            <AlertTitle>{{ $t('common.Component Documentation Available') }}</AlertTitle>
            <AlertDescription>
              {{
                $t(
                  'common.To see all available components, their variants, and how to use them, please run',
                )
              }}
              <code
                class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-primary mx-1"
              >{{ $t('common.bun run docs:dev') }}</code>{{ $t('common.(or') }}
              <code
                class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-primary mx-1"
              >{{ $t('common.npm run docs:dev') }}</code>{{ $t('common.) in your terminal and visit the documentation site.') }}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
