<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="q-wrapper">
      <span class="q" :key="animationKey">Q</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useLoadingStore } from '@/stores/loading'
import { storeToRefs } from 'pinia'

const { isLoading } = storeToRefs(useLoadingStore())
const animationKey = ref(0)

let interval
onMounted(() => {
  interval = setInterval(() => {
    animationKey.value++
  }, 800) // 반복 주기
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

.loading-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.q-wrapper {
  position: relative;
}

.q {
  font-size: 6rem;
  font-family: 'Pretendard', sans-serif;
  font-weight: 800;
  color: red;
  animation: dropAndFade 0.8s ease-in-out forwards;
  display: inline-block;
}

@keyframes dropAndFade {
  0% {
    transform: translateY(-80px);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    transform: translateY(80px);
    opacity: 0;
  }
}
</style>
