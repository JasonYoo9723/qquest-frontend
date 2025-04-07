<!-- src\App.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-black text-white">
    <HeaderPage />

    <main class="flex-1 container mx-auto px-4 py-6">
      <router-view />
    </main>

    <footer class="bg-gray-900 text-gray-400 text-sm text-center p-4">
      © 2025 QuizQuest. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import HeaderPage from '@/components/HeaderPage.vue'
</script>
