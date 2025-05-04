
<!-- qquest-frontend/src/views/ModifyPage.vue -->
<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">문제수정</h1>

    <!-- 시험 정보 입력 -->
    <div class="grid grid-cols-2 gap-4">
      <input v-model="form.exam_code" placeholder="시험코드 (예: realtor_1)" class="border p-2 rounded text-black" />
      <input v-model="form.year" type="number" placeholder="년도" class="border p-2 rounded text-black" />
      <input v-model="form.round" type="number" placeholder="회차" class="border p-2 rounded text-black" />
    </div>

    <!-- 파일 업로드 -->
    <div class="border-2 border-dashed p-4 rounded-xl">
      <input type="file" @change="handleFile" accept=".txt" />
    </div>

    <!-- 파싱된 문제 미리보기 -->
    <div v-if="questions.length">
      <h2 class="text-lg font-semibold mt-4">문제 미리보기</h2>
      <div v-for="(q, i) in questions" :key="i" :ref="el => questionRefs[i] = el" class="border p-3 rounded-xl mt-2">
        <div class="mb-2 font-semibold">문제 {{ q.question_no }} <span class="text-xs text-gray-600">({{ q.subject_name || '과목 없음' }})</span></div>

        <label class="block text-sm text-gray-500 mb-1">원본 텍스트</label>
        <textarea
          v-model="q.raw"
          rows="6"
          class="w-full border p-2 rounded text-black mb-3"
          @blur="reparse(i)"
        ></textarea>

        <label class="block text-sm text-gray-500 mb-1">문제 지문</label>
        <textarea
          v-model="q.question_text"
          rows="3"
          :class="['w-full p-2 rounded text-black font-medium border-4', q.question_text.trim() === '' ? 'border-red-500 border-2' : 'border-gray-300']"
        ></textarea>

        <label class="block text-sm text-gray-500 mt-2">보기</label>
        <div class="grid grid-cols-2 gap-2 mt-1">
          <div v-for="(c, idx) in q.choices" :key="idx" class="flex items-center">
            <span class="w-6 font-bold">{{ idx + 1 }}.</span>
            <input
              v-model="q.choices[idx]"
              :class="['flex-1 p-2 rounded text-black font-medium border-4', q.choices[idx].trim() === '' ? 'border-red-500 border-2' : 'border-gray-300']"
            />
          </div>
        </div>
      </div>
      <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded" @click="submit">저장하기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import axios from 'axios'
import { useLoadingStore } from '@/stores/loading'

const form = ref({
  exam_code: '',
  year: null,
  round: null,
})

const questions = ref([])
const questionRefs = ref([])

function splitQuestionAndChoices(block) {
  let question_text = ''
  let choices = ['', '', '', '', '']
  const choiceSplit = block.split(/(?=①|②|③|④|⑤)/g)
  if (choiceSplit.length > 1) {
    question_text = choiceSplit[0].replace(/^\d+\.\s*/, '').trim()
    const rawChoices = choiceSplit.slice(1)
    for (let j = 0; j < Math.min(rawChoices.length, 5); j++) {
      choices[j] = rawChoices[j].replace(/^[①②③④⑤]\s*/, '').trim()
    }
  }
  return { question_text, choices }
}

function detectSubjectMap(text) {
  const subjectPattern = /제\d+과목\s*:\s*([가-힣A-Za-z\s]+)/g
  const matches = [...text.matchAll(subjectPattern)]
  const map = []
  for (let i = 0; i < matches.length; i++) {
    const name = matches[i][1].trim()
    const index = matches[i].index
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index : text.length
    map.push({ subject_name: name, start: index, end: nextIndex })
  }
  return map
}

function generateQuestionBlocks(text) {
  const subjectMap = detectSubjectMap(text)
  const questionPattern = /(?<=\n|^)(\d{1,3})\.\s*/g
  const positions = [...text.matchAll(questionPattern)].map(match => ({
    no: parseInt(match[1]),
    index: match.index
  }))

  const maxQuestionNo = positions.reduce((max, curr) => Math.max(max, curr.no), 0)
  const result = []

  for (let i = 0; i < maxQuestionNo; i++) {
    const question_no = i + 1
    const pos = positions.find(p => p.no === question_no)
    const startIdx = pos ? pos.index : -1
    const endIdx = positions.find(p => p.no === question_no + 1)?.index ?? text.length
    const block = startIdx !== -1 ? text.slice(startIdx, endIdx).trim() : ''
    const subject_name = subjectMap.find(s => startIdx >= s.start && startIdx < s.end)?.subject_name ?? ''
    const { question_text, choices } = splitQuestionAndChoices(block)

    result.push({
      question_no,
      raw: block,
      question_text,
      choices,
      subject_name
    })
  }

  return result
}

function reparse(index) {
  const q = questions.value[index]
  const { question_text, choices } = splitQuestionAndChoices(q.raw)
  q.question_text = question_text
  q.choices = choices
}

const handleFile = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const text = await file.text()
  questions.value = generateQuestionBlocks(text)
}

const submit = async () => {
  for (let i = 0; i < questions.value.length; i++) {
    const q = questions.value[i]
    if (q.question_text.trim() === '' || q.choices.some(c => c.trim() === '')) {
      await nextTick()
      questionRefs.value[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      alert(`${q.question_no}번 문제에 빈 항목이 있습니다. 확인해 주세요.`)
      return
    }
  }

  const payload = {
    exam_code: form.value.exam_code,
    year: form.value.year,
    round: form.value.round,
    questions: questions.value.map(q => ({
      question_no: q.question_no,
      question_text: q.question_text,
      subject_name: q.subject_name.trim(),
      choices: q.choices.map(c => ({ choice_content: c }))
    }))
  }

  console.log('📦 전송 데이터:', JSON.stringify(payload, null, 2))

  const store = useLoadingStore()
  store.start()
  try {
    await axios.post("http://localhost:8099/api/admin/save-questions", payload)
    alert('저장 완료!')
  } catch (err) {
    console.error('❌ 저장 실패:', err)
    alert('저장 중 오류가 발생했습니다. 콘솔을 확인해 주세요.')
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
