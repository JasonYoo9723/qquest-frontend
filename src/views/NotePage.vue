<!-- src\views\NotePage.vue -->
<template>
  <div class="note-page">
    <h2 class="page-title">📌 오답노트</h2>
    <div v-if="!isLoggedIn" class="question-card">
      <p class="text-red-600 font-semibold">로그인이 필요합니다.</p>
    </div>
    <div v-else class="question-card">
      <p class="question">저장된 오답 문제 리스트</p>
      <ul class="options">
        <li>문제 1</li>
        <li>문제 2</li>
        <li>문제 3</li>
      </ul>
      <button class="next-button">다시 풀기</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const isLoggedIn = ref(false) // 로그인 상태 가정용
</script>
