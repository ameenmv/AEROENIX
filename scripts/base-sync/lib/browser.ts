import { exec } from 'node:child_process'
import os from 'node:os'

/**
 * Open a URL in the default browser natively
 */
export function openBrowser(url: string): void {
  const platform = os.platform()
  let command = ''

  if (platform === 'win32') {
    command = `start "" "${url}"`
  }
  else if (platform === 'darwin') {
    command = `open "${url}"`
  }
  else {
    // Linux / Unix
    command = `xdg-open "${url}"`
  }

  exec(command, (err) => {
    if (err) {
      console.warn(`Could not open browser automatically. Please open ${url} manually.`)
    }
  })
}
