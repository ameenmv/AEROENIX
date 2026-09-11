const fs = require('fs')
const path = 'src/components/layout/AppSidebar.vue'
let content = fs.readFileSync(path, 'utf8')

// Replace whatever data-[active=true]:bg-... with bg-sidebar-foreground text-sidebar
content = content.replace(/data-\[active=true\]:bg-primary\s+data-\[active=true\]:text-primary-foreground/g, 'data-[active=true]:bg-sidebar-foreground data-[active=true]:text-sidebar shadow-sm')

fs.writeFileSync(path, content)
