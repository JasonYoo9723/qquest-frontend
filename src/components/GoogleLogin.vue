<!-- src/components/GoogleLogin.vue -->
<template>
    <div id="google-login-button"></div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import api from '@/lib/api'
  
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  
  onMounted(() => {
    if (window.google) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      })
      google.accounts.id.renderButton(
        document.getElementById('google-login-button'),
        { theme: 'outline', size: 'large' }
      )
    }
  })
  
  function handleCredentialResponse(response) {
    const idToken = response.credential
  
    api.post('/auth/google-login', { credential: idToken })
      .then(res => {
        console.log('✅ 로그인 성공:', res.data)
        alert(`로그인 성공: ${res.data.user.name}`)
        // 예: localStorage.setItem('token', res.data.access_token)
      })
      .catch(err => {
        console.error('❌ 로그인 실패:', err)
        alert('로그인 실패')
      })
  }
  </script>
  