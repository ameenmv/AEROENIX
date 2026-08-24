<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import Navbar from '@/components/layout/Navbar.vue'
import ContextMenuPortal from '@/components/ui/ContextMenuPortal.vue'
import { AccessibilityBar } from '@/components/uic/accessibility-bar'
import { SidebarInset, SidebarProvider } from '@/components/uic/sidebar'
</script>

<template>
  <SidebarProvider>
    <!-- Single context menu panel for the entire admin app -->
    <ContextMenuPortal />
    <AppSidebar />
    <SidebarInset>
      <AccessibilityBar />
      <Navbar />
      <main class="flex-1 overflow-x-hidden overflow-y-auto px-6 pb-8 pt-6 custom-scrollbar">
        <div class="max-w-[1600px] mx-auto">
          <!-- Page Header -->
          <div v-if="$slots.title" class="mb-6">
            <h1 class="text-2xl font-bold tracking-tight">
              <slot name="title" />
            </h1>
            <p v-if="$slots.subtitle" class="mt-1 text-sm text-muted-foreground">
              <slot name="subtitle" />
            </p>
          </div>
          <!-- Page Content -->
          <slot />
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
