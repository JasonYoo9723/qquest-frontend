<!-- src\components\BaseModal.vue -->
<template>
    <transition name="fade">
      <div
        class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        @click.self="emit('close')"
      >
        <div class="bg-white rounded-lg shadow-xl px-6 py-5 w-[320px] text-center text-gray-800">
          <div class="text-lg font-semibold mb-3">{{ title }}</div>
          <div class="text-sm text-gray-600">{{ message }}</div>
          <button
            @click="emit('close')"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            확인
          </button>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup lang="ts">
  const props = defineProps<{
    title: string,
    message: string
  }>()
  
  const emit = defineEmits(['close'])
  </script>
  
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  