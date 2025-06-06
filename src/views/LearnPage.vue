<!-- LearnPage.vue -->
<template>
  <div class="learn-page p-6 relative">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xl md:text-2xl font-semibold">📘 학습하기</h2>
      <button @click="toggleCategory" class="text-2xl" aria-label="범주 설정">⚙️</button>
    </div>

    <transition name="fade">
      <CategorySelector
        v-if="showCategory"
        :year-options="yearOptions"
        :subject-options="subjectOptions"
        :session-options="sessionOptions"
        @confirm="handleConfirm"
      />
    </transition>

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
            'bg-green-100 border-green-400': showAnswer && c.number === parseInt(question.answer),
            'bg-red-100 border-red-400': showAnswer && selectedChoice === c.number && c.number !== parseInt(question.answer)
          }"
          @click="handleChoice(c.number)"
        >
          {{ index + 1 }}. {{ c.content }}
        </li>
      </ul>

      <div v-if="showAnswer && !isNaN(parseInt(question.answer))" class="mt-4 text-green-600 font-bold">
        ✅ 정답: {{ parseInt(question.answer) }}. {{ getAnswerText() }}
      </div>
      <div v-else-if="showAnswer" class="mt-4 text-red-600 font-bold">
        ⚠️ 정답 정보가 없습니다
      </div>

      <button
        class="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        @click="nextQuestion"
      >
        다음 문제
      </button>
    </div>

    <div v-else class="text-gray-400">문제를 보러오는 중입니다...</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import api from '@/lib/api'
import { useLoadingStore } from '@/stores/loading'
import { useCertificationStore } from '@/stores/certification'
import { useExamMetaStore } from '@/stores/examMeta'
import CategorySelector from '@/components/CategorySelector.vue'
import { useUserStore } from '@/stores/user'

const question = ref(null)
const selectedChoice = ref(null)
const showAnswer = ref(false)
const showCategory = ref(false)

const certStore = useCertificationStore()
const examMetaStore = useExamMetaStore()

const yearOptions = ref([])
const subjectOptions = ref([])
const sessionOptions = ref([])

const category = reactive({
  year: '',
  subject: '',
  session: '',
  mode: 'RAN'
})

const currentIndex = ref(1)

const toggleCategory = () => {
  showCategory.value = !showCategory.value
}

const fetchQuestion = async () => {
  const store = useLoadingStore()
  store.start()
  try {
    const params = {
      exam_code: certStore.selectedCert.exam_code,
      year: category.year,
      subject: category.subject,
      session: category.session,
      mode: category.mode
    }
    if (category.mode === 'SEQ') {
      params.question_no = currentIndex.value
    }
    const res = await api.get('learn/random-question', { params })
    question.value = res.data
    selectedChoice.value = null
    showAnswer.value = false
  } catch (err) {
    alert('문제 불러오기 오류 (콘솔 확인)')
    console.error(err)
  } finally {
    store.stop()
  }
}

const handleChoice = async (number) => {
  if (!showAnswer.value) {
    selectedChoice.value = number
    showAnswer.value = true
    const correct = parseInt(question.value.answer)
    if (number !== correct) {
      const userStore = useUserStore()
      if (userStore.isLoggedIn) {
        try {
          await api.post('/wrong-note/add', { question_id: question.value.id })
        } catch (err) {
          console.error('오답노트 저장 실패:', err)
        }
      }
    }
  }
}

const getAnswerText = () => {
  const answerNum = parseInt(question.value.answer)
  if (isNaN(answerNum)) return ''
  return question.value.choices.find(c => c.number === answerNum)?.content || ''
}

const nextQuestion = () => {
  if (category.mode === 'SEQ') {
    currentIndex.value += 1
  }
  fetchQuestion()
}

const handleConfirm = (newCategory) => {

  Object.assign(category, newCategory)
  currentIndex.value = 1
  showCategory.value = false

  
  fetchQuestion()
}

const initCategoryAndQuestion = async () => {
  if (!certStore.selectedCert?.exam_code) return

  const meta = await examMetaStore.fetchMetadata(certStore.selectedCert.exam_code)
  certStore.setExamMeta(meta)

  yearOptions.value = meta.years || []
  subjectOptions.value = (meta.subjects || []).map(s => ({
    label: s.subject_name,
    value: s.subject_code,
    session: s.session
  }))
  sessionOptions.value = meta.sessions || []

  const defaultSession = sessionOptions.value[0] || ''
  const defaultSubject = subjectOptions.value.find(s => s.session === defaultSession)?.value || ''
  const defaultYear = yearOptions.value[0] || ''

  category.year = defaultYear
  category.session = defaultSession
  category.subject = defaultSubject
  category.mode = 'RAN'

  await nextTick()
  fetchQuestion()
}

onMounted(initCategoryAndQuestion)
</script>

<style scoped>
.learn-page {
  max-width: 720px;
  margin: auto;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
