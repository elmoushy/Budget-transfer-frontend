import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { setupAxiosInterceptors } from './utils/axiosInterceptor'

// Setup axios interceptors
setupAxiosInterceptors()

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
