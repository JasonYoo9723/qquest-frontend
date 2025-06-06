// src/stores/user.ts
import { defineStore } from 'pinia'

interface UserInfo {
  email: string
  name: string
  provider: string
  is_admin: boolean
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as UserInfo | null,
    token: null as string | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user && !!state.token,
  },

  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('access_token', token)
    },

    setUser(user: UserInfo) {
      this.user = user
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('access_token')
    },

    async loadFromStorage() {
      const token = localStorage.getItem('access_token')
      if (!token) return

      this.token = token
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error('유저 정보 조회 실패')

        const userData = await res.json()
        this.user = userData
      } catch (err) {
        console.error('유저 정보 불러오기 실패:', err)
        this.logout()
      }
    },
  },

  persist: true,
})
