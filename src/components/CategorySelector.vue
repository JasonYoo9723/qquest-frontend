<template>
  <div class="space-y-4 mb-4">
    <!-- 자격증 선택 -->
    <div>
      <label class="block text-sm text-gray-500 mb-1">자격증</label>
      <select v-model="model.exam" class="w-full p-2 border rounded text-black">
        <option v-for="exam in examOptions" :key="exam.value" :value="exam.value">
          {{ exam.label }}
        </option>
      </select>
    </div>

    <!-- 년도, 차수, 교시 -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm text-gray-500 mb-1">년도</label>
        <select v-model="model.year" class="w-full p-2 border rounded text-black">
          <option value="">전체</option>
          <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-500 mb-1">차수</label>
        <select v-model="model.round" class="w-full p-2 border rounded text-black">
          <option value="">전체</option>
          <option v-for="round in roundOptions" :key="round" :value="round">{{ round }}회</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-500 mb-1">교시</label>
        <select v-model="model.session" class="w-full p-2 border rounded text-black">
          <option value="">전체</option>
          <option v-for="sess in sessionOptions" :key="sess" :value="sess">{{ sess }}교시</option>
        </select>
      </div>
    </div>

    <!-- 과목, 진행방식 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm text-gray-500 mb-1">과목</label>
        <select v-model="model.subject" class="w-full p-2 border rounded text-black">
          <option value="">전체</option>
          <option v-for="subj in subjectOptions" :key="subj.subject_code" :value="subj.subject_code">
            {{ subj.subject_name }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-500 mb-1">진행방식</label>
        <select v-model="model.mode" class="w-full p-2 border rounded text-black">
          <option value="SEQ">순차</option>
          <option value="RAN">랜덤</option>
        </select>
      </div>
    </div>

    <!-- 문제 수 (시험 모드일 경우만 표시) -->
    <div v-if="isExam">
      <label class="block text-sm text-gray-500 mb-1">문제 수({{maxCount}})</label>
      <input type="number" v-model.number="model.questionCount" min="1" class="w-full p-2 border rounded text-black" />
    </div>

    <!-- 확인 버튼 -->
    <div class="text-right pt-2">
      <button
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        @click="confirmSelection"
      >
        {{ isExam ? '시험 시작' : '확인' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Cookies from 'js-cookie'
import { useExamMetaStore } from '@/stores/examMeta'
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()
const emit = defineEmits(['update:modelValue', 'confirm'])
const props = defineProps({
  modelValue: Object,
  isExam: Boolean,
  maxCount: {
    type: Number,
    default: 0
  }
})

const examMeta = useExamMetaStore()

const model = ref({
  exam: '',
  year: '',
  round: '',
  session: '',
  subject: '',
  mode: 'RAN',
  questionCount: 10
})

watch(() => props.modelValue, (val) => {
  if (val) Object.assign(model.value, val)
}, { immediate: true, deep: true })

watch(model, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

onMounted(async () => {
  const store = useLoadingStore()
  try {
    await examMeta.fetchMeta()
    const examList = examMeta.getExamCodes()
    const savedExam = Cookies.get('last_exam')
    const validExam = examList.find(e => e.value === savedExam)
    const defaultExam = validExam?.value || (examList.length > 0 ? examList[0].value : '')

    const saved = {
      exam: defaultExam,
      year: Cookies.get('last_year') ?? '',
      round: Cookies.get('last_round') ?? '',
      session: Cookies.get('last_session') ?? '',
      subject: Cookies.get('last_subject') ?? '',
      mode: Cookies.get('last_mode') ?? 'RAN',
      questionCount: Cookies.get('last_questionCount') ? Number(Cookies.get('last_questionCount')) : 20
    }

    Object.assign(model.value, saved)
  } finally {
    store.stop()  // ✅ 로딩 종료
  }
})


const examOptions = computed(() => examMeta.getExamCodes())
const yearOptions = computed(() => model.value.exam ? examMeta.getYears(model.value.exam) : [])
const roundOptions = computed(() =>
  model.value.exam && model.value.year ? examMeta.getRounds(model.value.exam, model.value.year) : []
)
const sessionOptions = computed(() =>
  model.value.exam && model.value.year && model.value.round
    ? examMeta.getSessions(model.value.exam, model.value.year, model.value.round)
    : []
)
const subjectOptions = computed(() => {
  if (model.value.session === '') {
    return model.value.exam ? examMeta.getAllSubjects(model.value.exam) : []
  }
  if (!model.value.exam || !model.value.year || !model.value.round || !model.value.session) return []
  return examMeta.getSubjects(model.value.exam, model.value.year, model.value.round, model.value.session)
})

watch(() => model.value.exam, (exam) => {
  const years = examMeta.getYears(exam)
  model.value.year = years[0] || ''
})
watch(() => model.value.year, (year) => {
  const rounds = examMeta.getRounds(model.value.exam, year)
  model.value.round = rounds[0] || ''
})
watch(() => model.value.round, (round) => {
  const sessions = examMeta.getSessions(model.value.exam, model.value.year, round)
  model.value.session = sessions[0] || ''
})
watch(() => model.value.session, () => {
  const subs = subjectOptions.value
  model.value.subject = subs[0]?.subject_code || ''
})

const confirmSelection = () => {
  Cookies.set('last_exam', model.value.exam, { expires: 7 })
  Cookies.set('last_year', model.value.year, { expires: 7 })
  Cookies.set('last_round', model.value.round, { expires: 7 })
  Cookies.set('last_session', model.value.session, { expires: 7 })
  Cookies.set('last_subject', model.value.subject, { expires: 7 })
  Cookies.set('last_mode', model.value.mode, { expires: 7 })
  Cookies.set('last_questionCount', model.value.questionCount.toString(), { expires: 7 })
  emit('confirm', { ...model.value })
}
</script>

<style scoped>
select {
  background-color: white;
}
</style>
