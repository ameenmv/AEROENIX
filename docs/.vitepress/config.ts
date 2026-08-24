import { defineConfig } from 'vitepress'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    title: 'Neop Base',
    description: 'Documentation for the Neop Base Dashboard Framework',
    head: [
        ['link', { rel: 'icon', href: '/image.png' }]
    ],
    themeConfig: {
        logo: {
            light: '/logo-light.svg',
            dark: '/logo-dark.svg',
        },
        siteTitle: false,
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide/core/getting-started' },
            { text: 'Presentation', link: '/presentation' },
        ],
        sidebar: [
            {
                text: 'Core',
                collapsed: false,
                items: [
                    { text: 'Getting Started', link: '/guide/core/getting-started' },
                    { text: 'Project Structure', link: '/guide/core/project-structure' },
                    { text: 'Naming Conventions', link: '/guide/core/naming-conventions' },
                    { text: 'Scripts & Commands', link: '/guide/core/scripts-commands' },
                    { text: 'Git Workflow & Husky', link: '/guide/core/git-workflow' },
                    { text: 'Releases & Changelog', link: '/guide/core/releases' },
                    { text: 'Modules & Routing', link: '/guide/core/modules' },
                    { text: 'Auto-Import System', link: '/guide/core/auto-import' },
                    { text: 'Navigation & Menus', link: '/guide/core/menus' },
                    { text: 'Scaffold Command', link: '/guide/core/scaffold-command' },
                    { text: 'Internationalization (i18n)', link: '/guide/core/i18n' },
                    { text: 'Dark Mode & Theming', link: '/guide/core/dark-mode' },
                    { text: 'Authentication', link: '/guide/core/auth' },
                ],
            },
            {
                text: 'Modular System',
                collapsed: false,
                items: [
                    { text: 'Overview', link: '/guide/modular/overview' },
                    { text: 'Building a Module', link: '/guide/modular/building-a-module' },
                    { text: 'useTable', link: '/guide/modular/use-table' },
                    { text: 'useForm', link: '/guide/modular/use-form' },
                    { text: 'useDetails', link: '/guide/modular/use-details' },
                    { text: 'Columns & Fields Config', link: '/guide/modular/config-columns-fields' },
                    { text: 'DataTable & FormContainer', link: '/guide/modular/components' },
                    { text: 'AI Prompts', link: '/guide/modular/prompts' },
                ],
            },
            {
                text: 'UI Components',
                collapsed: false,
                items: [
                    { text: 'Interactive Playground', link: '/guide/components/ui-components' },
                    { text: 'Writing Stories', link: '/guide/components/writing-stories' },
                ],
            },
            {
                text: 'Utilities',
                collapsed: false,
                items: [
                    { text: 'Services & API Layer', link: '/guide/generic/services' },
                    { text: 'Mock Data', link: '/guide/generic/mock-data' },
                    { text: 'Permissions & RBAC', link: '/guide/generic/permissions' },
                    { text: 'SvgImage', link: '/guide/generic/svg-image' },
                    { text: 'WebSocket (usePusher)', link: '/guide/generic/use-pusher' },
                    { text: 'Sidebar (useSidebar)', link: '/guide/generic/use-sidebar' },
                ],
            },
        ],
        socialLinks: [
            { icon: 'github', link: '#' },
        ],
        search: {
            provider: 'local',
        },
        footer: {
            message: 'Neop Base — Dashboard Framework Documentation',
        },
    },
    vite: {
        resolve: {
            alias: {
                '@': resolve(__dirname, '../../src')
            }
        },
        server: {
            port: 5174,
        },
    },
})
