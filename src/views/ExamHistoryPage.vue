<template>
  <div class="learn-page w-full max-w-screen-xl mx-auto px-1 sm:px-6 py-4 relative">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xl xl:text-2xl font-semibold">📖 시험 결과</h2>
    </div>
    <hr class="border-t border-gray-600 my-3" />
    <div v-if="loading" class="text-center py-6">불러오는 중...</div>
    <div v-else-if="histories.length === 0" class="text-gray-500 text-center py-6">시험 기록이 없습니다.</div>
    <div v-else class="space-y-3">
      <div
        v-for="history in histories"
        :key="history.id"
        @click="goToResult(history.id)"
        class="cursor-pointer rounded-xl p-4 shadow border bg-white text-black hover:bg-gray-100 hover:border-green-500 transition"
      >
        <div class="font-semibold text-lg">
          {{ history.exam_name }} {{ history.year }}년 {{ history.round }}회 {{ history.session }}교시
        </div>
        <div class="text-sm text-gray-600">
          총 {{ history.total }}문제 중 {{ history.correct }}개 정답, {{ history.wrong }}개 오답<br>
          시험일시: {{ formatDate(history.created_at) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api'
import { useLoadingStore } from '@/stores/loading'

interface ExamHistory {
  id: number
  exam_name: string
  year: number
  round: number
  session: number
  total: number
  correct: number
  wrong: number
  created_at: string
}

const histories = ref<ExamHistory[]>([])
const store = useLoadingStore()
const router = useRouter()
const loading = ref(true)

onMounted(async () => {
  store.start()
  try {
    const res = await api.get('/exam/history')  // ← 자동으로 Bearer 토큰 포함됨
    histories.value = res.data
  } finally {
    store.stop()
    loading.value = false
  }
})

function goToResult(id: number) {
  router.push({ name: 'ExamResult', params: { id } })
}

function formatDate(datetime: string): string {
  const date = new Date(datetime + 'Z')  // 'Z' 붙여야 UTC로 인식
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
