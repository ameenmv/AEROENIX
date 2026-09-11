const fs = require('fs')
const path = 'src/components/ui/tables/DataTable.vue'
let content = fs.readFileSync(path, 'utf8')

// Add imports
content = content.replace(
  '<script setup lang="ts">',
  '<script setup lang="ts">\nimport type { ContextMenuAction } from \'@/composables/useContextMenu\'\nimport { useContextMenu } from \'@/composables/useContextMenu\''
)

// Add props
content = content.replace(
  'emptyActionLabel?: string\n}>()',
  'emptyActionLabel?: string\n  contextMenuActions?: ContextMenuAction[]\n}>()'
)

// Add context menu logic before </script>
const contextMenuLogic = `
// ── Context menu ────────────────────────────────────────────────────────────
const { openContextMenu } = useContextMenu()

function handleTableContextMenu(event: MouseEvent) {
  if (!props.contextMenuActions?.length)
    return
  // Walk up from the click target to find the <tr>
  let el = event.target as HTMLElement | null
  while (el && el.tagName !== 'TR') el = el.parentElement
  if (!el)
    return
  // Map <tr> index → paginatedData row
  const siblings = Array.from(el.parentElement?.children ?? [])
  const idx = siblings.indexOf(el)
  const row = paginatedData.value[idx]
  if (!row)
    return
  openContextMenu(
    event,
    props.contextMenuActions.map(a => ({
      ...a,
      onClick: () => a.onClick?.(row as Record<string, unknown>),
    })),
  )
}
</script>
`
content = content.replace('</script>', contextMenuLogic)

// Add @contextmenu to TableBody
content = content.replace(
  '<TableBody class="bg-transparent border-none">',
  '<TableBody class="bg-transparent border-none" @contextmenu="handleTableContextMenu">'
)

fs.writeFileSync(path, content)
