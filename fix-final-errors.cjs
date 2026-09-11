const fs = require('fs')

// Fix Bookings
const bookingsPath = 'src/views/admin/bookings/IndexView.vue'
let bContent = fs.readFileSync(bookingsPath, 'utf8')
bContent = bContent.replace(/import\s*\{\s*Table,\s*TableBody,\s*TableCell,\s*TableHead,\s*TableHeader,\s*TableRow,\s*\}\s*from\s*'@\/components\/uic\/table'/, '')
fs.writeFileSync(bookingsPath, bContent)

// Fix Roles
const rolesPath = 'src/views/admin/roles/IndexView.vue'
let rContent = fs.readFileSync(rolesPath, 'utf8')
rContent = rContent.replace("import { Skeleton } from '@/components/uic/skeleton'", "")
rContent = rContent.replace('<template #name="{ row, value }">', '<template #name="{ value }">')
rContent = rContent.replace('<template #scope="{ row, value }">', '<template #scope="{ value }">')
rContent = rContent.replace('<template #permissions="{ row, value }">', '<template #permissions="{ value }">')
fs.writeFileSync(rolesPath, rContent)
