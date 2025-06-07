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
          <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-500 mb-1">차수</label>
        <select v-model="model.round" class="w-full p-2 border rounded text-black">
          <option v-for="round in roundOptions" :key="round" :value="round">{{ round }}회</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-500 mb-1">교시</label>
        <select v-model="model.session" class="w-full p-2 border rounded text-black">
          <option v-for="sess in sessionOptions" :key="sess" :value="sess">{{ sess }}교시</option>
        </select>
      </div>
    </div>

    <!-- 과목, 진행방식 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm text-gray-500 mb-1">과목</label>
        <select v-model="model.subject" class="w-full p-2 border rounded text-black">
          <option v-for="subj in filteredSubjects" :key="subj.subject_code" :value="subj.subject_code">
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

    <!-- 확인 버튼 -->
    <div class="text-right pt-2">
      <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" @click="confirmSelection">
        확인
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Cookies from 'js-cookie'
import { useExamMetaStore } from '@/stores/examMeta'

const emit = defineEmits(['update:modelValue', 'confirm'])
const props = defineProps({
  modelValue: Object
})

const examMeta = useExamMetaStore()

const model = ref({
  exam: Cookies.get('last_exam') || '',
  year: Number(Cookies.get('last_year')) || '',
  round: Number(Cookies.get('last_round')) || '',
  session: Number(Cookies.get('last_session')) || '',
  subject: Cookies.get('last_subject') || '',
  mode: Cookies.get('last_mode') || 'RAN'
})

onMounted(() => {
  examMeta.fetchMeta()
  if (props.modelValue) {
    Object.assign(model.value, props.modelValue)
  }
})

watch(model, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

const examOptions = computed(() => examMeta.getExamCodes())
const yearOptions = computed(() =>
  model.value.exam ? examMeta.getYears(model.value.exam) : []
)
const roundOptions = computed(() =>
  model.value.exam && model.value.year
    ? examMeta.getRounds(model.value.exam, model.value.year)
    : []
)
const sessionOptions = computed(() =>
  model.value.exam && model.value.year && model.value.round
    ? examMeta.getSessions(model.value.exam, model.value.year, model.value.round)
    : []
)
const filteredSubjects = computed(() =>
  model.value.exam && model.value.year && model.value.round && model.value.session
    ? examMeta.getSubjects(model.value.exam, model.value.year, model.value.round, model.value.session)
    : []
)

watch(examOptions, (opts) => {
  if (opts.length && !opts.find(opt => opt.value === model.value.exam)) {
    model.value.exam = opts[0].value
  }
})
watch(yearOptions, (opts) => {
  if (opts.length && !opts.includes(model.value.year)) {
    model.value.year = opts[0]
  }
})
watch(roundOptions, (opts) => {
  if (opts.length && !opts.includes(model.value.round)) {
    model.value.round = opts[0]
  }
})
watch(sessionOptions, (opts) => {
  if (opts.length && !opts.includes(model.value.session)) {
    model.value.session = opts[0]
  }
})
watch(filteredSubjects, (subjects) => {
  const codes = subjects.map(s => s.subject_code)
  if (codes.length && !codes.includes(model.value.subject)) {
    model.value.subject = codes[0]
  }
})

const confirmSelection = () => {
  Cookies.set('last_exam', model.value.exam, { expires: 7 })
  Cookies.set('last_year', model.value.year, { expires: 7 })
  Cookies.set('last_round', model.value.round, { expires: 7 })
  Cookies.set('last_session', model.value.session, { expires: 7 })
  Cookies.set('last_subject', model.value.subject, { expires: 7 })
  Cookies.set('last_mode', model.value.mode, { expires: 7 })
  emit('confirm', { ...model.value })
}
</script>

<style scoped>
select {
  background-color: white;
}
</style>
