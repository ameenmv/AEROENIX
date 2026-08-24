<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    /** Full Histoire URL or story path. If empty, shows the root Histoire page */
    story: { type: String, default: '' },
    /** Display title */
    title: { type: String, default: 'UI Components' },
    /** Description text */
    description: { type: String, default: '' },
    /** Inline iframe height */
    height: { type: String, default: '600px' },
    /** Histoire server port */
    port: { type: Number, default: 6006 },
})

const loaded = ref(false)
const modalOpen = ref(false)

const storyUrl = computed(() => {
    if (!props.story) {
        return `http://localhost:${props.port}/`
    }
    const storyId = `src-${props.story.toLowerCase().replace(/\//g, '-')}-story-vue`
    return `http://localhost:${props.port}/story/${storyId}`
})

function onLoad() {
    loaded.value = true
}

function openModal() {
    modalOpen.value = true
    document.body.style.overflow = 'hidden'
}

function closeModal() {
    modalOpen.value = false
    document.body.style.overflow = ''
}

function onKeydown(e) {
    if (e.key === 'Escape' && modalOpen.value) {
        closeModal()
    }
}

onMounted(() => {
    document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
})
</script>

<template>
    <!-- Inline Preview -->
    <div class="cp-card">
        <div class="cp-header">
            <div class="cp-title-row">
                <span class="cp-bolt">⚡</span>
                <span class="cp-title">{{ title }}</span>
                <span class="cp-badge">Interactive</span>
            </div>
            <div class="cp-actions">
                <button class="cp-btn" @click="openModal" title="Open fullscreen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                    <span class="cp-btn-label">Full View</span>
                </button>
                <a class="cp-btn" :href="storyUrl" target="_blank" title="Open in new tab">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                </a>
            </div>
        </div>

        <div v-if="description" class="cp-desc">{{ description }}</div>

        <!-- URL bar -->
        <div class="cp-url-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <a :href="storyUrl" target="_blank" class="cp-url-text">{{ storyUrl }}</a>
        </div>

        <!-- Loading spinner -->
        <div v-if="!loaded" class="cp-loading">
            <div class="cp-spinner"></div>
            <span>Loading playground…</span>
        </div>

        <!-- Inline iframe -->
        <div class="cp-frame-wrap" :style="{ height }">
            <iframe :src="storyUrl" class="cp-frame" @load="onLoad" frameborder="0" allow="clipboard-write" />
        </div>
    </div>

    <!-- Fullscreen Modal -->
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="modalOpen" class="cp-modal-backdrop" @click.self="closeModal">
                <div class="cp-modal">
                    <div class="cp-modal-header">
                        <div class="cp-title-row">
                            <span class="cp-bolt">⚡</span>
                            <span class="cp-title">{{ title }}</span>
                            <span class="cp-badge">Interactive</span>
                        </div>
                        <div class="cp-actions">
                            <a class="cp-btn" :href="storyUrl" target="_blank" title="Open in new tab">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                            </a>
                            <button class="cp-btn cp-close" @click="closeModal" title="Close (Esc)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <!-- Modal URL bar -->
                    <div class="cp-url-bar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path
                                d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <a :href="storyUrl" target="_blank" class="cp-url-text">{{ storyUrl }}</a>
                    </div>
                    <iframe :src="storyUrl" class="cp-modal-frame" frameborder="0" allow="clipboard-write" />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
/* ─── Card ──────────────────────────── */
.cp-card {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--vp-c-divider);
    margin: 1.5rem 0;
    background: var(--vp-c-bg-soft);
}

.cp-header,
.cp-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--vp-c-bg-alt);
    border-bottom: 1px solid var(--vp-c-divider);
}

.cp-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.cp-bolt {
    font-size: 14px;
}

.cp-title {
    font-weight: 600;
    font-size: 14px;
    color: var(--vp-c-text-1);
}

.cp-badge {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--vp-c-brand-soft);
    color: var(--vp-c-brand-1);
}

.cp-desc {
    padding: 8px 16px;
    margin: 0;
    font-size: 13px;
    color: var(--vp-c-text-2);
    border-bottom: 1px solid var(--vp-c-divider);
}

/* ─── URL Bar ───────────────────────── */
.cp-url-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    background: var(--vp-c-bg);
    border-bottom: 1px solid var(--vp-c-divider);
    color: var(--vp-c-text-3);
}

.cp-url-text {
    font-size: 12px;
    font-family: var(--vp-font-family-mono);
    color: var(--vp-c-text-2);
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.cp-url-text:hover {
    color: var(--vp-c-brand-1);
    text-decoration: underline;
}

/* ─── Actions ───────────────────────── */
.cp-actions {
    display: flex;
    align-items: center;
    gap: 6px;
}

.cp-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg);
    color: var(--vp-c-text-2);
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
    line-height: 1;
}

.cp-btn:hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
    background: var(--vp-c-brand-soft);
}

.cp-btn-label {
    font-size: 12px;
}

/* ─── Loading ───────────────────────── */
.cp-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 30px;
    color: var(--vp-c-text-3);
    font-size: 13px;
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
}

.cp-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--vp-c-divider);
    border-top-color: var(--vp-c-brand-1);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* ─── Inline Frame ──────────────────── */
.cp-frame-wrap {
    position: relative;
    overflow: hidden;
}

.cp-frame {
    width: 100%;
    height: 100%;
    border: none;
}

/* ─── Fullscreen Modal ──────────────── */
.cp-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

.cp-modal {
    width: 100%;
    max-width: 1400px;
    height: 92vh;
    background: var(--vp-c-bg);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--vp-c-divider);
}

.cp-modal-header {
    flex-shrink: 0;
}

.cp-modal-frame {
    flex: 1;
    width: 100%;
    border: none;
}

.cp-close {
    border-color: transparent;
    background: transparent;
}

.cp-close:hover {
    background: rgba(255, 80, 80, 0.1);
    color: #ff5050;
    border-color: transparent;
}

/* ─── Transition ────────────────────── */
.modal-enter-active {
    transition: all 0.25s ease-out;
}

.modal-leave-active {
    transition: all 0.2s ease-in;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .cp-modal {
    transform: scale(0.95) translateY(10px);
}

.modal-leave-to .cp-modal {
    transform: scale(0.97);
}

.modal-enter-active .cp-modal {
    transition: transform 0.25s ease-out;
}

.modal-leave-active .cp-modal {
    transition: transform 0.2s ease-in;
}
</style>
