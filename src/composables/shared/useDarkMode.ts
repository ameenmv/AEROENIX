import { useDark, useLocalStorage, useToggle } from '@vueuse/core'

export function useDarkMode() {
  const isDark = useDark({
    selector: 'html',
    attribute: 'data-theme',
    valueDark: 'dark',
    valueLight: 'light',
    storageKey: 'theme-preference',
    onChanged: (isDark) => {
      document.documentElement.classList.toggle('dark', isDark)
    },
  })
  const toggleDarkMode = useToggle(isDark)
  const currentTheme = useLocalStorage('theme-preference', 'light', {
    listenToStorageChanges: true,
  })
  return {
    isDark,
    toggleDarkMode,
    currentTheme,
  }
}
export function initializeDarkMode() {
  const { isDark } = useDarkMode()
  return isDark
}
