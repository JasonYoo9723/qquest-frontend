// qquest-frontend/src/main.ts
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
app.mount('#app')

// ✅ Google GSI 로그인 스크립트 동적 삽입 및 초기화
const script = document.createElement('script')
script.src = 'https://accounts.google.com/gsi/client'
script.async = true
script.defer = true

script.onload = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  console.log("clientId", clientId)

  if (!window.google?.accounts?.id) {
    console.error("❌ Google 로그인 초기화 실패: google.accounts.id 없음")
    return
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: any) => {
      localStorage.setItem("last_credential", response.credential)
      console.log("✅ Google Credential 저장 완료")
    }
  })

  console.log("✅ Google 로그인 초기화 완료")
}

document.head.appendChild(script)
