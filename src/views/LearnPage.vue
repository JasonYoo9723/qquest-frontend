<template>
  <div class="learn-page p-6">
    <h2 class="text-xl md:text-2xl font-semibold mb-4">📘 학습하기</h2>

    <div v-if="question" class="question-card bg-white text-black p-6 rounded-xl shadow-md">
      <p class="text-sm text-gray-500 mb-2">
        {{ question.exam_name }} | {{ question.subject_name }} {{ question.year }}년도 {{ question.round }}차
      </p>
      <p class="text-lg font-semibold mb-4"> {{ question.question_no }}. {{ question.question_text }}</p>

      <ul class="space-y-2">
        <li
          v-for="(c, index) in question.choices"
          :key="index"
          class="border rounded-lg p-3 cursor-pointer hover:bg-gray-100"
          :class="{
            'bg-green-100 border-green-400': showAnswer && c.number === parseInt(question.answer),
            'bg-red-100 border-red-400': showAnswer && selectedChoice === c.number && c.number !== parseInt(question.answer)
          }"
          @click="handleChoice(c.number)"
        >
          {{ optionLabel(index) }} {{ c.content }}
        </li>
      </ul>

      <div v-if="showAnswer" class="mt-4 text-green-600 font-bold">
        ✅ 정답: {{ optionLabel(parseInt(question.answer) - 1) }}. {{ getAnswerText() }}
      </div>

      <button class="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" @click="nextQuestion">
        다음 문제
      </button>
    </div>

    <div v-else class="text-gray-400"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useLoadingStore } from '@/stores/loading'

const question = ref(null)
const selectedChoice = ref(null)
const showAnswer = ref(false)

const fetchQuestion = async () => {

  const store = useLoadingStore()
  store.start()
  try {
    const res = await axios.get('/api/learn/random-question')
    question.value = res.data
    selectedChoice.value = null
    showAnswer.value = false
  } catch (err) {
    alert('오류가 발생했습니다. 콘솔을 확인해 주세요.')
  } finally {
    store.stop();
  }
}

const handleChoice = (number) => {
  if (!showAnswer.value) {
    selectedChoice.value = number
    showAnswer.value = true
  }
}

const getAnswerText = () => {
  const answerNum = parseInt(question.value.answer)
  return question.value.choices.find(c => c.number === answerNum)?.content || ''
}

const optionLabel = (idx) => {
  return ['A', 'B', 'C', 'D', 'E'][idx] || String.fromCharCode(65 + idx)
}

const nextQuestion = () => {
  fetchQuestion()
}

onMounted(fetchQuestion)
</script>

<style scoped>
.learn-page {
  max-width: 720px;
  margin: auto;
}
</style>
