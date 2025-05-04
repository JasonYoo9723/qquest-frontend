<!-- src/components/CategorySelector.vue -->
<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
    <!-- 년도 선택 -->
    <div>
      <label class="block text-sm text-gray-500 mb-1">년도</label>
      <select v-model="selected.year" class="w-full p-2 border rounded text-black">
        <option v-for="year in yearOptions" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>

    <!-- 과목 선택 -->
    <div>
      <label class="block text-sm text-gray-500 mb-1">과목</label>
      <select v-model="selected.subject" class="w-full p-2 border rounded text-black">
        <option v-for="subj in subjectOptions" :key="subj.value" :value="subj.value">
          {{ subj.label }}
        </option>
      </select>
    </div>

    <!-- 방식 선택 -->
    <div>
      <label class="block text-sm text-gray-500 mb-1">진행방식</label>
      <select v-model="selected.mode" class="w-full p-2 border rounded text-black">
        <option value="SEQ">순차</option>
        <option value="RAN">랜덤</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  yearOptions: {
    type: Array,
    default: () => []
  },
  subjectOptions: {
    type: Array, // [{ label: '과목명', value: 'subject_code' }]
    default: () => []
  },
  modelValue: {
    type: Object,
    default: () => ({ year: '', subject: '', mode: 'RAN' })
  }
})

const emit = defineEmits(['update:modelValue'])

const selected = ref({
  year: props.modelValue.year,
  subject: props.modelValue.subject,
  mode: props.modelValue.mode
})

watch(selected, (val) => {
  emit('update:modelValue', val)
}, { deep: true })
</script>

<style scoped>
select {
  background-color: white;
}
</style>