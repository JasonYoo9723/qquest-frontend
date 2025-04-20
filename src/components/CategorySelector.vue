<template>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <!-- 년도 선택 -->
      <div>
        <label class="block text-sm text-gray-500 mb-1">년도</label>
        <select v-model="selected.year" class="w-full p-2 border rounded text-black">
          <option disabled value="">선택하세요</option>
          <option v-for="y in props.yearOptions" :key="y" :value="y">{{ y }}년도</option>
        </select>
      </div>
  
      <!-- 과목 선택 -->
      <div>
        <label class="block text-sm text-gray-500 mb-1">과목</label>
        <select v-model="selected.subject" class="w-full p-2 border rounded text-black">
          <option disabled value="">선택하세요</option>
          <option v-for="s in props.subjectOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
  
      <!-- 방식 선택 -->
      <div>
        <label class="block text-sm text-gray-500 mb-1">진행방식</label>
        <select v-model="selected.mode" class="w-full p-2 border rounded text-black">
          <option value="순차">순차</option>
          <option value="랜덤">랜덤</option>
        </select>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  // ✅ props 정의 (중복 선언 제거)
  const props = defineProps({
    modelValue: Object,
    yearOptions: Array,
    subjectOptions: Array
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const selected = ref({
    year: '',
    subject: '',
    mode: '랜덤',
    ...props.modelValue
  })
  
  // ✅ v-model 연결
  watch(selected, (val) => {
    emit('update:modelValue', val)
  }, { deep: true })
  </script>
  