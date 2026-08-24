<script setup lang="ts">
import { CollapsibleRoot as Collapsible, CollapsibleContent, CollapsibleTrigger } from 'reka-ui'
import { ref } from 'vue'
import Logo from '@/components/layout/Logo.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
} from '@/components/uic/sidebar'

const openMenus = ref<Record<string, boolean>>({ content: true })
</script>

<template>
  <Story title="AppSidebar" group="layout" icon="lucide:panel-left">
    <Variant title="Expanded">
      <div class="p-4">
        <div class="dark h-[600px] w-full rounded-xl overflow-hidden border border-border flex">
          <SidebarProvider>
            <Sidebar collapsible="icon">
              <SidebarHeader
                class="flex h-[70px] items-center justify-center border-b border-sidebar-border"
              >
                <Logo :animated="false" />
              </SidebarHeader>
              <SidebarContent class="custom-scrollbar">
                <SidebarGroup>
                  <SidebarGroupLabel class="text-xs uppercase tracking-wider">
                    Navigation
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Dashboard" is-active>
                          <span>🏠</span>
                          <span>Dashboard</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Users">
                          <span>👥</span>
                          <span>Users</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <Collapsible v-model:open="openMenus.content" as-child>
                        <SidebarMenuItem>
                          <CollapsibleTrigger as-child>
                            <SidebarMenuButton tooltip="Content">
                              <span>📄</span>
                              <span>Content</span>
                              <span
                                class="ms-auto transition-transform duration-200 text-xs"
                                :class="{ 'rotate-180': openMenus.content }"
                              >▾</span>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton>
                                  <span>Pages</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton>
                                  <span>Categories</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton>
                                  <span>Media</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Settings">
                          <span>⚙️</span>
                          <span>Settings</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Logout"
                      class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
              <SidebarRail />
            </Sidebar>
            <div class="flex-1 bg-background p-8 flex items-center justify-center">
              <div class="text-center">
                <h2 class="text-2xl font-bold text-foreground">
                  Main Content
                </h2>
                <p class="text-muted-foreground mt-2">
                  Click the rail to collapse the sidebar.
                </p>
              </div>
            </div>
          </SidebarProvider>
        </div>
      </div>
    </Variant>
  </Story>
</template>
