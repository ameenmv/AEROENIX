const fs = require('fs')
const path = 'src/components/layout/AppSidebar.vue'
let content = fs.readFileSync(path, 'utf8')

// Replace the old active classes with bg-primary text-primary-foreground
content = content.replace(/data-\[active=true\]:bg-primary\/10 data-\[active=true\]:text-primary/g, 'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground')

// Also ensure hover state is visible, e.g. hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
content = content.replace(/hover:bg-muted\/50/g, 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')

fs.writeFileSync(path, content)
