import path from 'node:path'
import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enablePWA = env.VITE_PWA_ENABLED === 'true'

  return {
    plugins: [
      vue(),
      tailwindcss(),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          'pinia',
          'vue-i18n',
          {
            '@vueuse/core': [
              // named imports
              'useMouse', // import { useMouse } from '@vueuse/core'
              // alias
              ['useFetch', 'useMyFetch'], // import { useFetch as useMyFetch } from '@vueuse/core'
            ],
          },
        ],
        dts: 'src/auto-imports.d.ts',
        dirs: [
          'src/composables/shared',
          'src/composables/admins',
          'src/composables/roles',
          'src/composables/notifications',
          'src/stores/shared',
        ],
        ignore: [
          '**/index.ts'
        ],
      }),
      Components({
        dirs: ['src/components'],
        extensions: ['vue'],
        deep: true,
        dts: 'src/components.d.ts',
      }),

      // ─── PWA (toggle via VITE_PWA_ENABLED in .env) ────────────────────
      ...(enablePWA
        ? [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
              'favicon.png',
              'apple-touch-icon-180x180.png',
              'pwa-192x192.png',
              'pwa-512x512.png',
            ],
            manifest: {
              name: 'Seen Admin',
              short_name: 'Seen Admin',
              description: 'Seen Admin — Dashboard Management',
              theme_color: '#0f172a',
              background_color: '#0f172a',
              display: 'standalone',
              scope: '/',
              start_url: '/',
              icons: [
                {
                  src: 'pwa-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
                {
                  src: 'pwa-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                },
                {
                  src: 'pwa-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'any maskable',
                },
              ],
            },
            workbox: {
              maximumFileSizeToCacheInBytes: 3000000,
              globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
              runtimeCaching: [
                {
                  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'google-fonts-cache',
                    expiration: {
                      maxEntries: 10,
                      maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                    },
                    cacheableResponse: { statuses: [0, 200] },
                  },
                },
                {
                  urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'gstatic-fonts-cache',
                    expiration: {
                      maxEntries: 10,
                      maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                    },
                    cacheableResponse: { statuses: [0, 200] },
                  },
                },
              ],
            },
            devOptions: {
              enabled: true,
            },
          }),
        ]
        : []),
    ] as any[],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['dashboard-seen.neop.co'],
    },
  }
})
