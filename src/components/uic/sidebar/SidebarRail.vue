<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ref } from 'vue'
import { cn } from '@/utils/cn'
import { useSidebar } from './utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
const { toggleSidebar, state, setSidebarWidth } = useSidebar()

const isDragging = ref(false)
let startX = 0
let startWidth = 0
let hasDragged = false

function handleMouseDown(e: MouseEvent) {
  if (state.value === 'collapsed') return
  isDragging.value = true
  hasDragged = false
  startX = e.clientX
  const sidebarEl = document.querySelector('[data-sidebar="sidebar"]') as HTMLElement
  if (sidebarEl) {
    startWidth = sidebarEl.getBoundingClientRect().width
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const sidebarEl = document.querySelector('[data-sidebar="sidebar"]') as HTMLElement
  if (!sidebarEl) return
  
  const side = sidebarEl.getAttribute('data-side') || (document.dir === 'rtl' ? 'right' : 'left')
  const delta = e.clientX - startX
  
  if (Math.abs(delta) > 3) {
    hasDragged = true
  }
  
  let newWidth = side === 'left' ? startWidth + delta : startWidth - delta
  
  // Apply min/max limits (200px to 600px)
  newWidth = Math.max(200, Math.min(newWidth, 600))
  
  setSidebarWidth(`${newWidth}px`)
}

function handleMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

function handleClick(e: MouseEvent) {
  if (hasDragged) {
    e.preventDefault()
    e.stopPropagation()
    return
  }
  toggleSidebar()
}
</script>

<template>
  <button
    data-sidebar="rail"
    data-slot="sidebar-rail"
    :aria-label="$t('common.Toggle Sidebar')"
    :tabindex="-1"
    :title="$t('common.Toggle Sidebar')"
    :class="
      cn(
        'hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex cursor-col-resize',
        'hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
        '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        isDragging && 'after:bg-sidebar-border after:w-[4px]',
        props.class,
      )
    "
    @mousedown="handleMouseDown"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
