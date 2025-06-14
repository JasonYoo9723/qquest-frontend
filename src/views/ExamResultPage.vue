<template>
  <div class="w-full max-w-screen-xl mx-auto px-1 sm:px-6 py-4" v-if="result">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xl xl:text-2xl font-semibold">📊 시험 결과</h2>
    </div>
    <hr class="border-t border-gray-600 my-3" />

    <!-- 요약 카드 -->
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-2">
      <div class="bg-white text-black p-3 rounded-xl shadow">
        <p class="text-sm text-gray-500">자격증</p>
        <p class="font-semibold">{{ result.exam_name || result.exam_code }}</p>
      </div>
      <div class="bg-white text-black p-3 rounded-xl shadow">
        <p class="text-sm text-gray-500">과목</p>
        <p class="font-semibold">{{ result.subject_name || result.subject }}</p>
      </div>
      <div class="bg-white text-black p-3 rounded-xl shadow">
        <p class="text-sm text-gray-500">연도</p>
        <p class="font-semibold">{{ result.year }}</p>
      </div>
      <div class="bg-white text-black p-3 rounded-xl shadow">
        <p class="text-sm text-gray-500">회차</p>
        <p class="font-semibold">{{ result.round }}</p>
      </div>
      <div class="bg-white text-black p-3 rounded-xl shadow">
        <p class="text-sm text-gray-500">교시</p>
        <p class="font-semibold">{{ result.session }}</p>
      </div>
      <div class="bg-white text-black p-3 rounded-xl shadow">
        <p class="text-sm text-gray-500">총 문제 수</p>
        <p class="font-semibold">{{ result.total_count }}</p>
      </div>
      <div class="bg-white text-black p-3 rounded-xl shadow">
        <p class="text-sm text-gray-500">정답 수</p>
        <p class="font-semibold text-green-700">{{ result.correct_count }}</p>
      </div>
      <div class="bg-white text-black p-3 rounded-xl shadow">
        <p class="text-sm text-gray-500">오답 수</p>
        <p class="font-semibold text-red-700">{{ result.wrong_count }}</p>
      </div>
      <div class="bg-white text-black p-3 rounded-xl shadow">
        <p class="text-sm text-gray-500">소요 시간</p>
        <p class="font-semibold">{{ formatTime(result.duration_seconds) }}</p>
      </div>
    </div>

    <!-- 시험일시 -->
    <div class="text-white text-sm text-right mb-3">
      시험일시: {{ new Date(result.taken_at + 'Z').toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) }}
    </div>

    <!-- 🔵 시험 목록으로 이동 버튼 -->
    <div class="text-left mb-6">
      <button
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        @click="goToHistory"
      >
        목록
      </button>
    </div>

    <!-- 오답 카드 -->
    <div v-if="result.wrong_questions.length">
      <h2 class="text-lg font-semibold mb-4">❌ 오답 문제</h2>

      <div
        v-for="(q, idx) in result.wrong_questions"
        :key="idx"
        class="mb-4 p-4 bg-white text-black border rounded-2xl shadow"
      >
        <p class="text-sm text-gray-600 mb-1">
          {{ result.exam_name || result.exam_code }} | {{ result.year }}년도 {{ result.round }}회<br />
          {{ result.subject_name || result.subject }}
        </p>

        <p class="text-lg font-semibold mb-2 whitespace-pre-line">
          {{ q.question_no }}. {{ q.question_text }}
        </p>

        <ul class="pl-4 space-y-1 text-sm">
          <li
            v-for="(choice, i) in q.choices"
            :key="i"
            class="px-2 py-1 rounded"
            :class="{
              'bg-red-100 border border-red-400': i + 1 === q.chosen_choice && i + 1 !== q.correct_choice,
              'bg-green-100 border border-green-400': i + 1 === q.correct_choice,
              'text-gray-700': i + 1 !== q.chosen_choice && i + 1 !== q.correct_choice
            }"
          >
            {{ i + 1 }}. {{ choice }}
            <span v-if="i + 1 === q.chosen_choice"> ← 선택</span>
            <span v-if="i + 1 === q.correct_choice"> ✅</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-10 text-gray-500">
    시험 결과를 불러오는 중입니다...
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLoadingStore } from '@/stores/loading'

const result = ref(null)
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const store = useLoadingStore()

onMounted(async () => {
  try {
    store.start()
    const id = route.params.id
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/exam/result/${id}`, {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    if (!res.ok) throw new Error('결과 불러오기 실패')
    result.value = await res.json()
  } catch (err) {
    console.error(err)
  } finally {
    store.stop()
    api.post('/visit', { exam_code: '', path: window.location.pathname}).catch(err => {
      console.warn('방문 로그 실패:', err)
    })
  }
})

function goToHistory() {
  router.push('/exam/history')
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
</script>
