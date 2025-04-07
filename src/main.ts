// src\main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'

import './assets/style.css'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPersistedstate)
app.use(pinia)
app.use(router)
app.use(pinia)
app.mount('#app')
