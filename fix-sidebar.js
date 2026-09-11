const fs = require('fs')
const path = 'src/components/layout/AppSidebar.vue'
let content = fs.readFileSync(path, 'utf8')

// Replace v-for
content = content.replace('v-for="item in navigationConfig"', 'v-for="(item, index) in navigationConfig"')

// Sidebar container
content = content.replace(
  '<Sidebar collapsible="icon" :side="sidebarSide">',
  '<Sidebar collapsible="icon" :side="sidebarSide" class="sidebar-container group/sidebar border-none z-20">'
)

// Header
content = content.replace(
  '<SidebarHeader class="flex h-[70px] items-center justify-center">',
  '<SidebarHeader class="flex items-center justify-center pt-8 pb-0 border-none bg-transparent">'
)

// Logo
content = content.replace(
  '<Logo :icon-only="isCollapsed" :animated="false" />',
  '<Logo :icon-only="isCollapsed" :animated="false" variant="white" />'
)

// Content
content = content.replace(
  '<SidebarContent class="custom-scrollbar">',
  '<SidebarContent class="custom-scrollbar pt-12">'
)

// Menu
content = content.replace(
  '<SidebarMenu>',
  '<SidebarMenu class="gap-4 px-4 items-center flex-col">'
)

// MenuItem static
content = content.replace(
  '<SidebarMenuItem v-if="!hasNavChildren(item) && isItemVisible(item)">',
  '<SidebarMenuItem v-if="!hasNavChildren(item) && isItemVisible(item)" class="w-full sidebar-item-cascade" :style="{ \'--stagger-i\': index }">'
)

// MenuButton static
content = content.replace(
  '<SidebarMenuButton\n                  as-child\n                  :tooltip="t(item.label)"\n                  :is-active="isActive(item.to)"\n                  @contextmenu="openSidebarCtx($event, item)"\n                >',
  '<SidebarMenuButton as-child :tooltip="t(item.label)" :is-active="isActive(item.to)" @contextmenu="openSidebarCtx($event, item)" class="sidebar-custom-btn relative before:absolute before:inset-y-[20%] before:start-[-12px] before:w-[3px] before:rounded-r-md before:bg-white before:opacity-0 before:transition-all data-[active=true]:before:opacity-100 data-[active=true]:before:bg-[#002c6d] active:scale-[0.97] transition-all duration-200">'
)

// Icon static
content = content.replace(
  '<HugeiconsIcon v-if="item.icon" :icon="item.icon" :size="20" />',
  '<HugeiconsIcon v-if="item.icon" :icon="item.icon" :size="20" class="btn-icon" />'
)

// Span static
content = content.replace(
  '<span>{{ t(item.label) }}</span>',
  '<span class="ml-3 font-medium group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all duration-100">{{ t(item.label) }}</span>'
)

// MenuItem collapsible
content = content.replace(
  '<SidebarMenuItem>',
  '<SidebarMenuItem class="w-full sidebar-item-cascade" :style="{ \'--stagger-i\': index }">'
)

// MenuButton collapsible
content = content.replace(
  '<SidebarMenuButton :tooltip="t(item.label)">',
  '<SidebarMenuButton :tooltip="t(item.label)" class="sidebar-custom-btn relative before:absolute before:inset-y-[20%] before:start-[-12px] before:w-[3px] before:rounded-r-md before:bg-white before:opacity-0 before:transition-all data-[active=true]:before:opacity-100 data-[active=true]:before:bg-[#002c6d] active:scale-[0.97] transition-all duration-200 w-full justify-start" :is-active="item.children && item.children.some(child => isActive(child.to))">'
)

// Icon collapsible
content = content.replace(
  '<HugeiconsIcon v-if="item.icon" :icon="item.icon" :size="20" />\n                      <span>{{ t(item.label) }}</span>\n                      <HugeiconsIcon\n                        :icon="ArrowDown01Icon"\n                        :size="18"\n                        class="ms-auto transition-transform duration-200"\n                        :class="{ \'rotate-180\': openMenus[item.name] }"\n                      />',
  '<HugeiconsIcon v-if="item.icon" :icon="item.icon" :size="20" class="btn-icon" />\n                      <span class="ml-3 font-medium group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all duration-100">{{ t(item.label) }}</span>\n                      <HugeiconsIcon\n                        :icon="ArrowDown01Icon"\n                        :size="16"\n                        class="ms-auto transition-transform duration-100 group-data-[collapsible=icon]:hidden"\n                        :class="{ \'rotate-180\': openMenus[item.name] }"\n                      />'
)

// SubItem dynamic loading
content = content.replace(
  '<SidebarMenuSubItem v-if="item.dynamicChildren && dynamicLoading[item.name]">',
  '<SidebarMenuSubItem v-if="item.dynamicChildren && dynamicLoading[item.name]" class="sidebar-subitem-cascade">'
)

// SubItem children
content = content.replace(
  '<SidebarMenuSubItem v-for="child in getNavChildren(item)" :key="child.name">',
  '<SidebarMenuSubItem v-for="(child, childIndex) in getNavChildren(item)" :key="child.name" class="sidebar-subitem-cascade" :style="{ \'--stagger-i\': childIndex }">'
)

// SubButton children
content = content.replace(
  '<SidebarMenuSubButton\n                          v-if="isVisible(child.permission)"\n                          as-child\n                          :is-active="isActive(child.to)"\n                        >',
  '<SidebarMenuSubButton v-if="isVisible(child.permission)" as-child :is-active="isActive(child.to)" class="relative before:absolute before:inset-y-[20%] before:start-[-12px] before:w-[3px] before:rounded-r-md before:bg-white before:opacity-0 before:transition-all data-[active=true]:before:opacity-100 data-[active=true]:before:bg-[#002c6d] active:scale-[0.97] transition-all">'
)

// Footer Button
content = content.replace(
  '<SidebarMenuButton\n            :tooltip="t(\'menu.logout\')"\n            class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"\n            @click="handleLogout"\n          >',
  '<SidebarMenuButton :tooltip="t(\'menu.logout\')" class="sidebar-custom-btn active:scale-[0.97] transition-all hover:bg-destructive shadow-none bg-transparent hover:text-white w-full justify-start" @click="handleLogout">'
)
content = content.replace(
  '<HugeiconsIcon :icon="Logout02Icon" :size="20" />\n            <span>{{ t(\'menu.logout\') }}</span>',
  '<HugeiconsIcon :icon="Logout02Icon" :size="20" class="btn-icon text-white" />\n            <span class="ml-3 font-medium group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all duration-100">{{ t(\'menu.logout\') }}</span>'
)

content = content.replace(
  '<SidebarFooter>',
  '<SidebarFooter class="pb-8">'
)

content = content.replace(
  '<SidebarMenu>\n        <SidebarMenuItem>\n          <SidebarMenuButton',
  '<SidebarMenu class="px-4">\n        <SidebarMenuItem class="w-full flex justify-center">\n          <SidebarMenuButton'
)

// Now append the styles from SEEN
const seenPath = '/home/ameen/ameen/projects/seen-client-dashboard-front/src/components/layout/AppSidebar.vue'
const seenContent = fs.readFileSync(seenPath, 'utf8')
const styleMatch = seenContent.match(/<style>[\s\S]*<\/style>/)

if (styleMatch) {
  content = content + '\n\n' + styleMatch[0]
}

fs.writeFileSync(path, content)
