import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import App from './App.vue'
import { initializeDarkMode } from './composables/useDarkMode'
import { vCan } from './directives/vCan'
import i18n from './i18n'
import router from './router'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'nprogress/nprogress.css'
import './style.css'

const app = createApp(App)
initializeDarkMode()
app.directive('can', vCan)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(VueApexCharts)
app.use(VueQueryPlugin)
app.mount('#app')
