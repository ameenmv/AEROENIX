const fs = require('fs')

const path = 'src/components/layout/AppSidebar.vue'
let content = fs.readFileSync(path, 'utf8')

// We will remove the entire <style> block and replace class strings in the template.
const styleStart = content.indexOf('<style>')
if (styleStart !== -1) {
  content = content.slice(0, styleStart)
}

// 1. Remove sidebar-container, and custom CSS classes from <Sidebar>
content = content.replace('class="sidebar-container group/sidebar border-none z-20"', 'class="group/sidebar border-r z-20"')

// 2. Remove pt-12 from SidebarContent (keep normal spacing)
content = content.replace('<SidebarContent class="custom-scrollbar pt-12">', '<SidebarContent class="custom-scrollbar pt-4">')

// 3. For SidebarMenuButton, remove sidebar-custom-btn and all those complex string concatenations, replace with Tailwind.
const buttonRegex1 = /class="sidebar-custom-btn[^"]+"/g
content = content.replace(buttonRegex1, 'class="relative transition-all duration-200 hover:bg-muted/50 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold w-full justify-start rounded-md h-10 px-3"')

// 4. Same for Logout button
const logoutRegex = /class="sidebar-custom-btn active:scale-\[0\.97\] transition-all hover:bg-destructive shadow-none bg-transparent hover:text-white w-full justify-start"/g
content = content.replace(logoutRegex, 'class="transition-all hover:bg-destructive hover:text-white w-full justify-start rounded-md h-10 px-3"')

// 5. Remove manual coloring from icon
content = content.replace('class="btn-icon text-white"', 'class="btn-icon"')
content = content.replace('class="btn-icon text-muted-foreground"', 'class="btn-icon"')

// 6. Fix submenu buttons
content = content.replace(/class="relative before:absolute[^"]+"/g, 'class="transition-all duration-200 hover:bg-muted/50 data-[active=true]:bg-primary/10 data-[active=true]:text-primary rounded-md"')

// 7. Remove sidebar-item-cascade and sidebar-subitem-cascade
content = content.replace(/sidebar-item-cascade/g, '')
content = content.replace(/sidebar-subitem-cascade/g, '')

// 8. Fix icon classes
content = content.replace(/class="btn-icon"/g, 'class="size-5 shrink-0"')

// Write back
fs.writeFileSync(path, content)

