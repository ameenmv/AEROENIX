const fs = require('fs')

const files = [
  'src/views/admin/hotels/IndexView.vue',
  'src/views/admin/notifications/IndexView.vue',
  'src/views/admin/cms/BuilderIndexView.vue',
  'src/views/admin/roles/IndexView.vue',
  'src/views/admin/bookings/IndexView.vue'
]

files.forEach(path => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8')
    // Remove the actions column from the columns array definition
    content = content.replace(/\s*\{\s*key:\s*'actions'[^}]+\},?\s*/, '\n')
    fs.writeFileSync(path, content)
  }
})

