import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

/* ───── PrimeVue (keep it for the rest of your UI) ──── */
import PrimeVue from 'primevue/config'

/* ───── Vue Quill ──── */
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css' // theme CSS

/* ───── Font Awesome ──── */
import '@fortawesome/fontawesome-free/css/all.css'

/* ───── Vue Motion ──── */
import { MotionPlugin } from '@vueuse/motion'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, { ripple: true, inputStyle: 'outlined' })
app.use(MotionPlugin)

/* Register Quill globally (so SFCs can just drop <QuillEditor/>) */
app.component('QuillEditor', QuillEditor)

app.mount('#app')
