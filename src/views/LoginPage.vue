<!-- 예: src/views/LoginPage.vue -->
<template>
    <div class="login-page p-10">
      <h1 class="text-xl font-bold mb-4">로그인</h1>
      <GoogleLogin />
    </div>
  </template>
  
  <script setup>
  import GoogleLogin from '@/components/GoogleLogin.vue'
  </script>
  