import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
  }),
  actions: {
    setUser(user) {
      this.user = user
    },
    setToken(token) {
      this.token = token
      localStorage.setItem('access_token', token)
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('access_token')
    },
    loadFromStorage() {
      const token = localStorage.getItem('access_token')
      if (token) {
        this.token = token
        // 사용자 정보는 /users/me 로 fetch 필요
      }
    }
  }
})
