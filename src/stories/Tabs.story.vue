<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uic/tabs'
</script>

<template>
  <Story title="Tabs" group="navigation" icon="lucide:layout-list">
    <Variant title="Default">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">
        <div class="light p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Light
          </h3>
          <Tabs default-value="tab1">
            <TabsList>
              <TabsTrigger value="tab1">
                Account
              </TabsTrigger>
              <TabsTrigger value="tab2">
                Password
              </TabsTrigger>
              <TabsTrigger value="tab3">
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <p class="text-sm text-muted-foreground p-4">
                Account settings content goes here.
              </p>
            </TabsContent>
            <TabsContent value="tab2">
              <p class="text-sm text-muted-foreground p-4">
                Password settings content goes here.
              </p>
            </TabsContent>
            <TabsContent value="tab3">
              <p class="text-sm text-muted-foreground p-4">
                General settings content goes here.
              </p>
            </TabsContent>
          </Tabs>
        </div>
        <div class="dark p-8 rounded-xl bg-background border border-border space-y-6">
          <h3 class="text-lg font-bold text-foreground">
            Dark
          </h3>
          <Tabs default-value="tab1">
            <TabsList>
              <TabsTrigger value="tab1">
                Account
              </TabsTrigger>
              <TabsTrigger value="tab2">
                Password
              </TabsTrigger>
              <TabsTrigger value="tab3">
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <p class="text-sm text-muted-foreground p-4">
                Account settings content goes here.
              </p>
            </TabsContent>
            <TabsContent value="tab2">
              <p class="text-sm text-muted-foreground p-4">
                Password settings content goes here.
              </p>
            </TabsContent>
            <TabsContent value="tab3">
              <p class="text-sm text-muted-foreground p-4">
                General settings content goes here.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Variant>
  </Story>
</template>
