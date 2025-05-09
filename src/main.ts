import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css' // If you have a global CSS file

/* ───── PrimeVue (keep it for the rest of your UI) ──── */
import PrimeVue from 'primevue/config'

/* ───── Vue Quill ──── */
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css' // theme CSS

/* ───── Font Awesome ──── */
import '@fortawesome/fontawesome-free/css/all.css'

/* ───── Vue Motion ──── */
import { MotionPlugin } from '@vueuse/motion'

import { vObserve } from './utils/domObserver'

// ── suppress DOMNodeInserted deprecation warning ──
;(function () {
  const orig = Document.prototype.addEventListener
  Document.prototype.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (type === 'DOMNodeInserted') {
      // swallow legacy mutation events
      return
    }
    return orig.call(this, type, listener, options)
  }
})()

// Create app instance
const app = createApp(App)

// Setup Pinia for state management
const pinia = createPinia()
app.use(pinia)

// Add the router
app.use(router)
app.use(PrimeVue, { ripple: true, inputStyle: 'outlined' })
app.use(MotionPlugin)

/* Register components globally */
app.component('QuillEditor', QuillEditor)

// Register custom directive for DOM observation
app.directive('observe', vObserve)

// Mount the app
app.mount('#app')
