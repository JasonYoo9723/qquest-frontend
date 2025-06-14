<!-- src/views/WrongNotePage.vue -->
<template>
  <div class="learn-page p-6 relative">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xl md:text-2xl font-semibold">📕 오답노트</h2>
    </div>

    <div v-if="question" class="question-card bg-white text-black p-6 rounded-xl shadow-md">
      <p class="text-sm text-gray-500 mb-2">
        {{ question.exam_name }} | {{ question.year }}년도 {{ question.round }}회 <br />
        {{ question.subject_name }}
      </p>
      <p class="text-lg font-semibold mb-4 whitespace-pre-line">
        {{ question.question_no }}. {{ question.question_text }}
      </p>

      <ul class="space-y-2">
        <li
          v-for="(c, index) in question.choices"
          :key="index"
          class="border rounded-lg p-3 cursor-pointer hover:bg-gray-100"
          :class="{
            'bg-green-100 border-green-400': c.number === parseInt(question.answer),
            'bg-red-100 border-red-400': selectedChoice === c.number && c.number !== parseInt(question.answer)
          }"
          @click="handleChoice(c.number)"
        >
          {{ index + 1 }}. {{ c.content }}
        </li>
      </ul>

      <div v-if="!isNaN(parseInt(question.answer))" class="mt-4 text-green-600 font-bold">
        ✅ 정답: {{ parseInt(question.answer) }}. {{ getAnswerText() }}
      </div>
      <div v-else class="mt-4 text-red-600 font-bold">
        ⚠️ 정답 정보가 없습니다
      </div>

      <button
        class="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        @click="nextQuestion"
      >
        다음 오답
      </button>
    </div>

    <div v-else class="text-gray-400">오답노트에 문제가 없습니다.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/lib/api'
import { useLoadingStore } from '@/stores/loading'

const question = ref(null)
const selectedChoice = ref(null)

const fetchNextWrong = async () => {
  const store = useLoadingStore()
  store.start()
  try {
    const res = await api.get('/wrong-note/next-question')
    question.value = res.data
    selectedChoice.value = null
  } catch (err) {
    console.error(err)
    question.value = null
  } finally {
    store.stop()
  }
}

const handleChoice = (number) => {
  if (!selectedChoice.value) {
    selectedChoice.value = number
  }
}

const getAnswerText = () => {
  const answerNum = parseInt(question.value.answer)
  if (isNaN(answerNum)) return ''
  return question.value.choices.find(c => c.number === answerNum)?.content || ''
}

const nextQuestion = () => {
  fetchNextWrong()
}

onMounted(() => {
  fetchNextWrong()
  
  api.post('/visit', { exam_code: '', path: window.location.pathname}).catch(err => {
    console.warn('방문 로그 실패:', err)
  })
})
</script>

<style scoped>
.learn-page {
  max-width: 720px;
  margin: auto;
}
</style>
