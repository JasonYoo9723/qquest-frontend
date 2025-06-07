<template>
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">정답 업로드</h1>

    <!-- 시험 정보 입력 -->
    <div class="grid grid-cols-4 gap-4">
      <input
        v-model="form.exam_code"
        placeholder="시험코드 (예: realtor_1)"
        class="border p-2 rounded text-black"
      />
      <input
        v-model.number="form.year"
        type="number"
        placeholder="년도 (예: 2023)"
        class="border p-2 rounded text-black"
      />
      <input
        v-model.number="form.round"
        type="number"
        placeholder="회차 (예: 1)"
        class="border p-2 rounded text-black"
      />
      <input
        v-model.number="form.session"
        type="number"
        placeholder="교시 (예: 1)"
        class="border p-2 rounded text-black"
      />
    </div>

    <!-- 붙여넣기 정답 입력 -->
    <textarea
      v-model="rawText"
      placeholder="문제번호 탭 정답 (예: 1[TAB]4)"
      class="w-full h-64 border p-2 rounded text-black"
    ></textarea>

    <!-- 업로드 버튼 -->
    <button
      @click="uploadAnswers"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      업로드
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const rawText = ref('')
const form = ref({
  exam_code: '',
  year: null,
  round: null,
  session: null, // 교시 추가
})

function parseText() {
  const lines = rawText.value.trim().split('\n').filter(line => line.trim() !== '')

  return lines.map(line => {
    const [qRaw, aRaw] = line.split(/\t|,/)
    const question_number = parseInt(qRaw?.trim())
    const answers = aRaw
      .split(',')
      .map(a => parseInt(a.trim()))
      .filter(a => !isNaN(a))

    return {
      question_number,
      answers
    }
  }).filter(item => !isNaN(item.question_number) && item.answers.length > 0)
}

async function uploadAnswers() {
  if (!form.value.exam_code || !form.value.year || !form.value.round || !form.value.session) {
    alert("시험 정보(시험코드, 년도, 회차, 교시)를 모두 입력해 주세요.")
    return
  }

  const data = {
    exam_code: form.value.exam_code,
    year: form.value.year,
    round: form.value.round,
    session: form.value.session,
    answers: parseText()
  }

  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/upload-answers`, data)
    alert('정답 업로드 완료')
  } catch (e) {
    alert('업로드 실패: ' + (e.response?.data?.detail || e.message))
  }
}
</script>

<style scoped>
input,
textarea {
  background-color: white;
  color: black;
}
</style>
