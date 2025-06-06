<template>
  <div class="space-y-4 mb-4">
    <!-- 상단: 년도, 교시 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm text-gray-500 mb-1">년도</label>
        <select v-model="selected.year" class="w-full p-2 border rounded text-black">
          <option v-for="year in yearOptions" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm text-gray-500 mb-1">교시</label>
        <select v-model="selected.session" class="w-full p-2 border rounded text-black">
          <option v-for="sess in sessionOptions" :key="sess" :value="sess">
            {{ sess }}교시
          </option>
        </select>
      </div>
    </div>

    <!-- 하단: 과목, 진행방식 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm text-gray-500 mb-1">과목</label>
        <select v-model="selected.subject" class="w-full p-2 border rounded text-black">
          <option v-for="subj in filteredSubjects" :key="subj.value" :value="subj.value">
            {{ subj.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm text-gray-500 mb-1">진행방식</label>
        <select v-model="selected.mode" class="w-full p-2 border rounded text-black">
          <option value="SEQ">순차</option>
          <option value="RAN">랜덤</option>
        </select>
      </div>
    </div>

    <!-- 확인 버튼 -->
    <div class="text-right pt-2">
      <button
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        @click="confirmSelection"
      >
        확인
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Cookies from 'js-cookie'

const props = defineProps({
  yearOptions: Array,
  subjectOptions: Array, // [{ label, value, session }]
  sessionOptions: Array,
  modelValue: {
    type: Object,
    default: () => ({
      year: '',
      subject: '',
      session: '',
      mode: 'RAN'
    })
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const selected = ref({
  year: Cookies.get('last_year') || props.modelValue.year,
  subject: Cookies.get('last_subject') || props.modelValue.subject,
  session: Cookies.get('last_session') || props.modelValue.session,
  mode: Cookies.get('last_mode') || props.modelValue.mode
})

const filteredSubjects = computed(() =>
  props.subjectOptions.filter(s => String(s.session) === String(selected.value.session))
)

watch(() => selected.value.session, (newSession, oldSession) => {
  // session이 바뀌었을 때 subject가 현재 filtered list에 없는 경우만 덮어쓰기
  const availableSubjects = filteredSubjects.value.map(s => s.value)
  if (!availableSubjects.includes(selected.value.subject)) {
    const firstSubject = filteredSubjects.value[0]
    selected.value.subject = firstSubject ? firstSubject.value : ''
  }
})

// 외부 modelValue 변경 시 반영
watch(() => props.modelValue, (val) => {
  selected.value = { ...val }
}, { deep: true })

const confirmSelection = () => {
  emit('update:modelValue', { ...selected.value })
  emit('confirm', { ...selected.value })

  Cookies.set('last_year', selected.value.year, { expires: 7 })
  Cookies.set('last_subject', selected.value.subject, { expires: 7 })
  Cookies.set('last_session', selected.value.session, { expires: 7 })
  Cookies.set('last_mode', selected.value.mode, { expires: 7 })
}
</script>

<style scoped>
select {
  background-color: white;
}
</style>
