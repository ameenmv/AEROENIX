import { HstVue } from '@histoire/plugin-vue'
import { defineConfig } from 'histoire'

export default defineConfig({
  plugins: [HstVue()],
  storyMatch: ['src/**/*.story.vue'],
  setupFile: '/src/histoire-setup.ts',
  vite: {
    // Histoire inherits from vite.config.ts automatically for resolve.alias, plugins, etc.
    // We just need to ensure Tailwind and the project CSS are loaded.
  },
  theme: {
    title: 'Neop UI Components',
    defaultColorScheme: 'dark',
  },
  tree: {
    groups: [
      {
        id: 'inputs',
        title: 'Inputs & Forms',
      },
      {
        id: 'display',
        title: 'Data Display',
      },
      {
        id: 'feedback',
        title: 'Feedback',
      },
      {
        id: 'overlays',
        title: 'Overlays',
      },
      {
        id: 'navigation',
        title: 'Navigation',
      },
      {
        id: 'layout',
        title: 'Layout',
      },
    ],
  },
})
