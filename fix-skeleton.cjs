const fs = require('fs')
const path = 'src/components/ui/tables/DataTable.vue'
let content = fs.readFileSync(path, 'utf8')

// Add Skeleton import if not present
if (!content.includes('import { Skeleton } from \'@/components/uic/skeleton\'')) {
  content = content.replace(
    'import { useI18n } from \'vue-i18n\'',
    'import { useI18n } from \'vue-i18n\'\nimport { Skeleton } from \'@/components/uic/skeleton\''
  )
}

// Replace skeleton drag and drop
content = content.replace(
  /<div\n\s*class="h-5 w-5 bg-muted\/70 dark:bg-slate-700\/60 rounded-\[4px\] skeleton-shimmer mx-auto"\n\s*\/>/g,
  '<Skeleton class="h-5 w-5 rounded-md mx-auto" />'
)

// Replace skeleton selection checkbox
content = content.replace(
  /<div\n\s*class="h-4 w-4 bg-muted\/70 dark:bg-slate-700\/60 rounded-\[4px\] skeleton-shimmer mx-auto"\n\s*\/>/g,
  '<Skeleton class="h-4 w-4 rounded-md mx-auto" />'
)

// Replace skeleton columns
content = content.replace(
  /<div\n\s*class="h-3.5 bg-muted\/70 dark:bg-slate-700\/60 rounded-full mx-auto skeleton-shimmer"\n\s*:class="\[\n\s*colIdx === 0\n\s*\? 'w-1\/2'\n\s*: colIdx === actualColumns\.length - 1\n\s*\? 'w-8 h-8 rounded-full'\n\s*: 'w-3\/4',\n\s*\]"\n\s*\/>/g,
  `<Skeleton
                          class="h-4 mx-auto rounded-full"
                          :class="[
                            colIdx === 0
                              ? 'w-1/2'
                              : colIdx === actualColumns.length - 1
                                ? 'w-8 h-8 rounded-full'
                                : 'w-3/4',
                          ]"
                        />`
)

// Replace empty columns fallback
content = content.replace(
  /<div\n\s*class="h-3.5 bg-muted\/70 dark:bg-slate-700\/60 rounded-full w-3\/4 mx-auto skeleton-shimmer"\n\s*\/>/g,
  '<Skeleton class="h-4 w-3/4 rounded-full mx-auto" />'
)

// Replace actions
content = content.replace(
  /<div\n\s*class="h-8 w-8 bg-muted\/70 dark:bg-slate-700\/60 rounded-full mx-auto skeleton-shimmer"\n\s*\/>/g,
  '<Skeleton class="h-8 w-8 rounded-full mx-auto" />'
)

fs.writeFileSync(path, content)
