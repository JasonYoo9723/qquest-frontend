<template>
  <div class="learn-page p-6 relative">
    <!-- 상단 타이틀 + ⚙️ -->
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xl md:text-2xl font-semibold">📘 학습하기</h2>
      <button @click="toggleCategory" class="text-2xl" aria-label="범주 설정">⚙️</button>
    </div>

    <!-- 범주 토글 -->
    <transition name="fade">
      <CategorySelector
        v-if="showCategory && yearOptions.length > 0 && subjectOptions.length > 0"
        v-model="category"
        :year-options="yearOptions"
        :subject-options="subjectOptions"
      />
    </transition>

    <!-- 문제 카드 -->
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

      <div v-if="showAnswer" class="mt-4 text-green-600 font-bold">
        ✅ 정답: {{ parseInt(question.answer) + 1 }}. {{ getAnswerText() }}
      </div>

      <button
        class="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        @click="nextQuestion"
      >
        다음 문제
      </button>
    </div>

    <div v-else class="text-gray-400">문제를 불러오는 중입니다...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/lib/api'
import { useLoadingStore } from '@/stores/loading'
import { useCertificationStore } from '@/stores/certification'
import { useExamMetaStore } from '@/stores/examMeta'
import CategorySelector from '@/components/CategorySelector.vue'

const question = ref(null)
const selectedChoice = ref(null)
const showAnswer = ref(false)
const showCategory = ref(false)

const certStore = useCertificationStore()
const examMetaStore = useExamMetaStore()

const yearOptions = ref([])
const subjectOptions = ref([])
const category = ref({
  year: '',
  subject: '',
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
      year: category.value.year,
      subject: category.value.subject,
      mode: category.value.mode
    }
    if (category.value.mode === 'SEQ') {
      params.question_no = currentIndex.value
    }
    const res = await api.get('learn/random-question', { params })
    question.value = res.data
    selectedChoice.value = null
    showAnswer.value = false
  } catch (err) {
    alert('오류가 발생했습니다. 콘솔을 확인해 주세요.')
    console.error(err)
  } finally {
    store.stop()
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

const nextQuestion = () => {
  if (category.value.mode === 'SEQ') {
    currentIndex.value += 1
  }
  fetchQuestion()
}

onMounted(async () => {
  // ✅ examMeta 없으면 직접 불러오기
  if (!certStore.examMeta && certStore.selectedCert?.exam_code) {
    const meta = await examMetaStore.fetchMetadata(certStore.selectedCert.exam_code)
    certStore.setExamMeta(meta)
  }

  const meta = certStore.examMeta
  if (meta) {
    yearOptions.value = meta.years || []
    subjectOptions.value = (meta.subjects || []).map(s => ({
      label: s.subject_name,
      value: s.subject_code
    }))

    category.value.year = yearOptions.value[0] || ''
    category.value.subject = subjectOptions.value[0]?.value || ''
    category.value.mode = 'RAN'

    fetchQuestion()
  } else {
    console.warn('⚠️ examMeta 없음 - 초기 범주 설정 실패')
  }
})

let isInitialLoad = true

watch(category, (newVal, oldVal) => {
  if (isInitialLoad) {
    isInitialLoad = false
    return
  }
  if (newVal.year && newVal.subject) {
    currentIndex.value = 1
    fetchQuestion()
  }
}, { deep: true })
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
