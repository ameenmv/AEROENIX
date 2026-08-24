import DefaultTheme from 'vitepress/theme'
import './custom.css'
import './presentation.css'
import ComponentPreview from './ComponentPreview.vue'
import PresentationLayout from './PresentationLayout.vue'
import type { Theme } from 'vitepress'

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('ComponentPreview', ComponentPreview)
        app.component('PresentationLayout', PresentationLayout)
    }
} satisfies Theme
