<template>
    <div>로그인 처리 중...</div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import axios from 'axios'
  import { useUserStore } from '@/stores/user'
  import { useRouter } from 'vue-router'
  
  const userStore = useUserStore()
  const router = useRouter()
  
  onMounted(async () => {
    userStore.loadFromStorage()
  
    if (!userStore.token) {
      router.replace('/')
      return
    }
  
    try {
      const res = await axios.get('/api/users/me', {
        headers: {
          Authorization: `Bearer ${userStore.token}`
        }
      })
  
      userStore.setUser(res.data)
      router.replace('/')
    } catch (err) {
      console.error('사용자 정보 불러오기 실패:', err)
      userStore.logout()
      router.replace('/')
    }
  })
  </script>
  