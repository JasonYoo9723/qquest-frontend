// src\main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'
import './assets/style.css'

// 1. 앱 및 Pinia 생성
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPersistedstate)

// 2. Pinia, Router 등록
app.use(pinia)
app.use(router)

// 3. ✅ Pinia 등록 이후에 store 사용 (중요)
import { useUserStore } from './stores/user'

const init = async () => {
  const userStore = useUserStore()
  await userStore.loadFromStorage()

  app.mount('#app')
}

// 5. ✅ Google GSI 로그인 스크립트 삽입 및 초기화
const script = document.createElement('script')
script.src = 'https://accounts.google.com/gsi/client'
script.async = true
script.defer = true

script.onload = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    console.error('❌ GOOGLE_CLIENT_ID 환경변수가 설정되지 않았습니다.')
    return
  }

  if (!window.google?.accounts?.id) {
    console.error("❌ Google 로그인 초기화 실패: google.accounts.id 없음")
    return
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: async (response: any) => {
      const idToken = response.credential
      localStorage.setItem('access_token', idToken)

      const userStore = useUserStore()
      userStore.setToken(idToken)

      try {
        await userStore.loadFromStorage()
        console.log('✅ 사용자 정보 로드 완료')
      } catch (err) {
        console.error('❌ 사용자 정보 로드 실패', err)
      }
    },

    // ✅ 모바일 대응: 자동 선택/취소 방지
    auto_select: false,
    cancel_on_tap_outside: false,
  })

  console.log('✅ Google 로그인 초기화 완료')
}

document.head.appendChild(script)
init()