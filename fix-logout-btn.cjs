const fs = require('fs')

const path = 'src/components/layout/AppSidebar.vue'
let content = fs.readFileSync(path, 'utf8')

// Fix logout button
content = content.replace(
  `:tooltip="t('menu.logout')"\n            class="relative transition-all duration-200 hover:bg-muted/50 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold w-full justify-start rounded-md h-10 px-3"\n            @click="handleLogout"`,
  `:tooltip="t('menu.logout')"\n            class="relative transition-all duration-200 hover:bg-destructive hover:text-white text-destructive w-full justify-start rounded-md h-10 px-3"\n            @click="handleLogout"`
)

fs.writeFileSync(path, content)

