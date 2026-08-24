<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useData } from 'vitepress'

const { isDark } = useData()

const activeSlide = ref(0)
const showToc = ref(false)
const progress = ref(0)

const slides = [
  { id: 'hero', title: 'Neop Dashboard Framework', icon: '🚀', category: 'intro' },
  { id: 'agenda', title: 'Agenda', icon: '📋', category: 'intro' },
  { id: 'getting-started', title: 'Getting Started', icon: '⚡', category: 'core' },
  { id: 'project-structure', title: 'Project Structure', icon: '📁', category: 'core' },
  { id: 'tech-stack', title: 'Technology Stack', icon: '🔧', category: 'core' },
  { id: 'auto-import', title: 'Auto-Import System', icon: '🔄', category: 'core' },
  { id: 'api-layer', title: 'API Layer & Services', icon: '🌐', category: 'core' },
  { id: 'modules-routing', title: 'Modules & Routing', icon: '🗺️', category: 'core' },
  { id: 'modular-overview', title: 'Modular Architecture', icon: '🏗️', category: 'modular' },
  { id: 'building-module', title: 'Building a Module', icon: '🔨', category: 'modular' },
  { id: 'use-table', title: 'useTable Composable', icon: '📊', category: 'modular' },
  { id: 'use-form', title: 'useForm & Forms', icon: '📝', category: 'modular' },
  { id: 'use-details', title: 'useDetails Composable', icon: '🔍', category: 'modular' },
  { id: 'components', title: 'DataTable & FormContainer', icon: '🧩', category: 'modular' },
  { id: 'config', title: 'Columns & Fields Config', icon: '⚙️', category: 'modular' },
  { id: 'scaffold', title: 'Scaffold Command', icon: '🏭', category: 'tools' },
  { id: 'permissions', title: 'Permissions & RBAC', icon: '🔐', category: 'tools' },
  { id: 'i18n', title: 'Internationalization', icon: '🌍', category: 'tools' },
  { id: 'dark-mode', title: 'Dark Mode & Theming', icon: '🎨', category: 'tools' },
  { id: 'navigation', title: 'Navigation & Menus', icon: '🧭', category: 'tools' },
  { id: 'services', title: 'Services & API Patterns', icon: '📡', category: 'tools' },
  { id: 'mock-data', title: 'Mock Data System', icon: '🎭', category: 'tools' },
  { id: 'pusher', title: 'Real-Time: usePusher', icon: '⚡', category: 'tools' },
  { id: 'sidebar', title: 'Sidebar State', icon: '📱', category: 'tools' },
  { id: 'ui-playground', title: 'UI Playground', icon: '🎪', category: 'components' },
  { id: 'stories', title: 'Writing Stories', icon: '📖', category: 'components' },
  { id: 'naming', title: 'Naming Conventions', icon: '📏', category: 'quality' },
  { id: 'git', title: 'Git Workflow', icon: '🔀', category: 'quality' },
  { id: 'releases', title: 'Releases & Changelog', icon: '🏷️', category: 'quality' },
  { id: 'scripts', title: 'Scripts Reference', icon: '💻', category: 'quality' },
  { id: 'prompts', title: 'AI Prompt Templates', icon: '🤖', category: 'quality' },
  { id: 'summary', title: 'Summary', icon: '🎯', category: 'intro' },
]

const categories = {
  intro: { label: 'Introduction', color: '#ED1F4A' },
  core: { label: 'Core Architecture', color: '#3b82f6' },
  modular: { label: 'Modular System', color: '#10b981' },
  tools: { label: 'Tools & Utilities', color: '#f59e0b' },
  components: { label: 'UI Components', color: '#8b5cf6' },
  quality: { label: 'Quality & DevOps', color: '#ef4444' },
}

const currentSlide = computed(() => slides[activeSlide.value])

function scrollToSlide(index) {
  activeSlide.value = index
  showToc.value = false
  const el = document.getElementById(slides[index].id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function handleScroll() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  progress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

  // Determine active slide
  for (let i = slides.length - 1; i >= 0; i--) {
    const el = document.getElementById(slides[i].id)
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.top <= 120) {
        activeSlide.value = i
        break
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="presentation-layout">
    <!-- Progress Bar -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <!-- Floating Nav -->
    <nav class="floating-nav">
      <div class="nav-inner">
        <div class="nav-logo">
          <img :src="isDark ? '/logo-dark.svg' : '/logo-light.svg'" alt="Neop" class="nav-logo-img" />
        </div>
        <div class="nav-slide-info">
          <span class="nav-slide-num">{{ activeSlide + 1 }}/{{ slides.length }}</span>
          <span class="nav-slide-title">{{ currentSlide?.title }}</span>
        </div>
        <button class="toc-btn" @click="showToc = !showToc">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
      </div>
    </nav>

    <!-- TOC Overlay -->
    <Transition name="toc">
      <div v-if="showToc" class="toc-overlay" @click.self="showToc = false">
        <div class="toc-panel">
          <div class="toc-header">
            <h3>📋 Table of Contents</h3>
            <button @click="showToc = false" class="toc-close">✕</button>
          </div>
          <div class="toc-list">
            <template v-for="(cat, key) in categories" :key="key">
              <div class="toc-category" :style="{ '--cat-color': cat.color }">
                <span class="toc-cat-label">{{ cat.label }}</span>
              </div>
              <button
                v-for="(slide, idx) in slides.filter(s => s.category === key)"
                :key="slide.id"
                class="toc-item"
                :class="{ active: slides.indexOf(slide) === activeSlide }"
                @click="scrollToSlide(slides.indexOf(slide))"
              >
                <span class="toc-icon">{{ slide.icon }}</span>
                <span class="toc-title">{{ slide.title }}</span>
                <span class="toc-num">{{ slides.indexOf(slide) + 1 }}</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Content -->
    <div class="presentation-content">
      <slot />
    </div>

    <!-- Footer -->
    <footer class="presentation-footer">
      <div class="footer-inner">
        <img :src="isDark ? '/logo-dark.svg' : '/logo-light.svg'" alt="Neop" class="footer-logo" />
        <span>Neop Dashboard Framework — Technical Documentation</span>
        <span class="footer-year">© {{ new Date().getFullYear() }}</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.presentation-layout {
  --neop-brand: #ED1F4A;
  --neop-brand-soft: rgba(237, 31, 74, 0.12);
  --neop-brand-glow: rgba(237, 31, 74, 0.3);
  --neop-dark: #161616;
  --neop-card: #242424;
  --neop-border: rgba(238, 238, 238, 0.08);
  min-height: 100vh;
}

/* Progress Bar */
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--neop-border);
  z-index: 200;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ED1F4A, #ff6b8a);
  transition: width 0.15s ease-out;
  border-radius: 0 2px 2px 0;
}

/* Floating Nav */
.floating-nav {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 150;
  width: min(720px, calc(100% - 32px));
}

.nav-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 20px;
  background: rgba(30, 32, 37, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(237, 31, 74, 0.08);
}

:root:not(.dark) .nav-inner {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.nav-logo-img {
  height: 22px;
  width: auto;
}

.nav-slide-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.nav-slide-num {
  font-size: 11px;
  font-weight: 700;
  color: #ED1F4A;
  background: rgba(237, 31, 74, 0.12);
  padding: 2px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

.nav-slide-title {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(237, 31, 74, 0.1);
  color: #ED1F4A;
  cursor: pointer;
  transition: all 0.2s;
}

.toc-btn:hover {
  background: rgba(237, 31, 74, 0.2);
  transform: scale(1.05);
}

/* TOC Overlay */
.toc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 300;
  display: flex;
  justify-content: flex-end;
}

.toc-panel {
  width: min(400px, 90vw);
  height: 100vh;
  background: var(--vp-c-bg, #1e2025);
  border-left: 1px solid rgba(237, 31, 74, 0.15);
  overflow-y: auto;
  padding: 0;
}

:root:not(.dark) .toc-panel {
  background: #fff;
}

.toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(237, 31, 74, 0.1);
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 1;
}

.toc-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.toc-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(237, 31, 74, 0.1);
  color: #ED1F4A;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toc-list {
  padding: 16px;
}

.toc-category {
  padding: 12px 12px 6px;
  margin-top: 8px;
}

.toc-cat-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--cat-color);
}

.toc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  color: inherit;
  text-align: left;
  transition: all 0.15s;
  font-size: 13px;
}

.toc-item:hover {
  background: rgba(237, 31, 74, 0.08);
}

.toc-item.active {
  background: rgba(237, 31, 74, 0.12);
  color: #ED1F4A;
}

.toc-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.toc-title {
  flex: 1;
  font-weight: 500;
}

.toc-num {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.4;
  min-width: 20px;
  text-align: right;
}

/* Transitions */
.toc-enter-active, .toc-leave-active {
  transition: opacity 0.25s;
}
.toc-enter-active .toc-panel, .toc-leave-active .toc-panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toc-enter-from, .toc-leave-to {
  opacity: 0;
}
.toc-enter-from .toc-panel {
  transform: translateX(100%);
}
.toc-leave-to .toc-panel {
  transform: translateX(100%);
}

/* Content */
.presentation-content {
  padding-top: 80px;
  max-width: 960px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

/* Footer */
.presentation-footer {
  margin-top: 80px;
  padding: 32px 0;
  border-top: 1px solid rgba(237, 31, 74, 0.1);
}

.footer-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  opacity: 0.5;
}

.footer-logo {
  height: 18px;
  width: auto;
}

.footer-year {
  margin-left: auto;
}

@media (max-width: 768px) {
  .floating-nav {
    top: 8px;
  }
  .nav-inner {
    padding: 8px 14px;
  }
  .nav-slide-title {
    display: none;
  }
  .presentation-content {
    padding-top: 64px;
  }
}
</style>
