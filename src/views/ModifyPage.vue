<!-- src\views\ModifyPage.vue -->
<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">문제수정</h1>

    <!-- 시험 정보 입력 -->
    <div class="grid grid-cols-2 gap-4">
      <input v-model="form.exam_code" placeholder="시험코드 (예: realtor_1)" class="border p-2 rounded text-black" />
      <input v-model="form.year" type="number" placeholder="년도" class="border p-2 rounded text-black" />
      <input v-model="form.round" type="number" placeholder="회차" class="border p-2 rounded text-black" />
    </div>

    <button @click="loadQuestions" class="mt-2 px-4 py-2 bg-gray-800 text-white rounded">불러오기</button>

    <!-- 문제 리스트 -->
    <div v-if="questions.length">
      <h2 class="text-lg font-semibold mt-4">문제 목록</h2>
      <div v-for="(q, i) in questions" :key="q.question_id" class="border p-4 rounded-xl mt-3">
        <div class="mb-2 font-semibold">문제 {{ q.question_no }}</div>

        <label class="text-sm text-gray-500">지문</label>
        <textarea v-model="q.question_text" class="w-full border p-2 rounded text-black mb-2" rows="3"></textarea>

        <label class="text-sm text-gray-500">보기</label>
        <div class="grid grid-cols-2 gap-2 mb-2">
          <div v-for="(c, idx) in q.choices" :key="idx" class="flex items-center">
            <span class="w-6 font-bold">{{ idx + 1 }}.</span>
            <input v-model="q.choices[idx]" class="flex-1 p-2 border rounded text-black" />
          </div>
        </div>

        <label class="text-sm text-gray-500">정답 번호 (1~5)</label>
        <input v-model.number="q.answer" type="number" min="1" max="5" class="w-20 p-2 border rounded text-black" />
      </div>

      <button @click="saveQuestions" class="mt-6 px-4 py-2 bg-blue-600 text-white rounded">저장하기</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useLoadingStore } from '@/stores/loading'

const form = ref({
  exam_code: '',
  year: null,
  round: null
})

const questions = ref([])
const store = useLoadingStore()
const BASE_URL = import.meta.env.VITE_API_BASE_URL

const loadQuestions = async () => {
  try {
    store.start()
    const res = await axios.get(`${BASE_URL}/admin/get-questions`, {
      params: {
        exam_code: form.value.exam_code,
        year: form.value.year,
        round: form.value.round
      }
    })

    questions.value = res.data.questions.map(q => ({
      question_id: q.question_id,
      question_no: q.question_no,
      question_text: q.question_text,
      answer: q.answer,
      choices: q.choices // 리스트 of string
    }))
  } catch (err) {
    alert('문제 불러오기 실패')
    console.error(err)
  } finally {
    store.stop()
  }
}

const saveQuestions = async () => {
  try {
    store.start()
    const payload = {
      questions: questions.value.map(q => ({
        question_id: q.question_id,
        question_text: q.question_text,
        choices: q.choices, // 그대로 문자열 리스트로 전송
        answer: q.answer
      }))
    }
    await axios.post(`${BASE_URL}/admin/update-questions`, payload)
    alert('저장 완료')
  } catch (err) {
    alert('저장 실패')
    console.error(err)
  } finally {
    store.stop()
  }
}
</script>

<style scoped>
input, textarea {
  background-color: white;
  color: black;
}
</style>
