const fs = require('fs')

// Fix DataTable.vue
const dtPath = 'src/components/ui/tables/DataTable.vue'
let dtContent = fs.readFileSync(dtPath, 'utf8')
dtContent = dtContent.replace(
  '<TableBody\n                  class="bg-transparent border-none"',
  '<TableBody\n                  class="bg-transparent border-none"\n                  @contextmenu="handleTableContextMenu"'
)
dtContent = dtContent.replace(
  '<TableBody\n                class="bg-transparent border-none"',
  '<TableBody\n                class="bg-transparent border-none"\n                @contextmenu="handleTableContextMenu"'
)
fs.writeFileSync(dtPath, dtContent)

// Fix IndexView.vue
const idxPath = 'src/views/admin/users/IndexView.vue'
let idxContent = fs.readFileSync(idxPath, 'utf8')
// Remove unused import
idxContent = idxContent.replace(
  "import { TableCell, TableHead, TableRow } from '@/components/uic/table'",
  ""
)
// Remove unused `row` in slots
idxContent = idxContent.replace('<template #name="{ row, value }">', '<template #name="{ value }">')
idxContent = idxContent.replace('<template #email="{ row, value }">', '<template #email="{ value }">')
idxContent = idxContent.replace('<template #hotel_name="{ row, value }">', '<template #hotel_name="{ value }">')
idxContent = idxContent.replace('<template #status="{ row, value }">', '<template #status="{ value }">')

fs.writeFileSync(idxPath, idxContent)
