<!-- src\App.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-black text-white">
    <HeaderPage />
    <LoadingBar />
    <main class="flex-1 container mx-auto px-4 py-6">
      <router-view />
    </main>

    <footer class="bg-gray-900 text-gray-400 text-sm text-center p-4">
      © 2025 QQuest. All rights reserved.
    </footer>

    <!-- 메시지 팝업 -->
    <BaseModal
      v-if="isOpen"
      :title="title"
      :message="message"
      @close="modal.close"
    />
  </div>
</template>

<script setup lang="ts">
import HeaderPage from '@/components/HeaderPage.vue'
import BaseModal from '@/components/BaseModal.vue'
import LoadingBar from '@/components/LoadingBar.vue'

import { onMounted } from 'vue'
import { useModalStore } from '@/stores/modal'
import { storeToRefs } from 'pinia'

const modal = useModalStore()
const { isOpen, title, message } = storeToRefs(modal) // ✅ 여기 중요!

// 예: 이전 방식처럼 이벤트도 병행할 수 있음
onMounted(() => {
  window.addEventListener('show-cert-warning', () => {
    modal.show('카테고리', '카테고리를 먼저 선택해주세요.')
  })
})
</script>