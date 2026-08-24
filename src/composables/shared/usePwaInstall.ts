import { ref } from 'vue'

/**
 * PWA install prompt composable.
 *
 * Listens for the `beforeinstallprompt` event and exposes
 * a reactive boolean + install/dismiss actions.
 */
export function usePwaInstall() {
  const showInstallPrompt = ref(false)
  let deferredPrompt: any = null

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      deferredPrompt = e
      showInstallPrompt.value = true
    })
  }

  async function installPwa() {
    if (!deferredPrompt)
      return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      showInstallPrompt.value = false
    }
    deferredPrompt = null
  }

  function dismissPrompt() {
    showInstallPrompt.value = false
    deferredPrompt = null
  }

  return {
    showInstallPrompt,
    installPwa,
    dismissPrompt,
  }
}
