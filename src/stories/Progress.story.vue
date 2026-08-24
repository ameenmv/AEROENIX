<script setup lang="ts">
import { Progress } from '@/components/uic/progress'
</script>

<template>
  <Story title="Progress" group="display" icon="lucide:loader">
    <Variant title="Values">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <div class="space-y-4 max-w-md">
            <div>
              <p class="text-xs text-muted-foreground mb-1">
                0%
              </p>
              <Progress :model-value="0" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">
                25%
              </p>
              <Progress :model-value="25" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">
                50%
              </p>
              <Progress :model-value="50" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">
                75%
              </p>
              <Progress :model-value="75" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">
                100%
              </p>
              <Progress :model-value="100" />
            </div>
          </div>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <div class="space-y-4 max-w-md">
            <div>
              <p class="text-xs text-muted-foreground mb-1">
                0%
              </p>
              <Progress :model-value="0" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">
                25%
              </p>
              <Progress :model-value="25" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">
                50%
              </p>
              <Progress :model-value="50" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">
                75%
              </p>
              <Progress :model-value="75" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">
                100%
              </p>
              <Progress :model-value="100" />
            </div>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
