<!-- src\views\SolvePage.vue -->
<template>
  <div class="solve-page">
    <h2 class="page-title">📝 문제풀기</h2>
    <div class="question-card">
      <p class="question">다음 중 Vue의 반응형 시스템에서 사용하는 핵심 객체는?</p>
      <ul class="options">
        <li @click="selectAnswer(1)">A. watcher</li>
        <li @click="selectAnswer(2)">B. ref</li>
        <li @click="selectAnswer(3)">C. eventBus</li>
      </ul>
      <p v-if="showResult" class="answer">정답: B. ref</p>
      <button class="next-button">다음 문제</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const showResult = ref(false)
const selectAnswer = () => {
  showResult.value = true
}
</script>
