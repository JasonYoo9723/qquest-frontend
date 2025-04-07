<template>
  <header class="bg-white shadow-sm px-4 py-2 sticky top-0 z-50">
    <div class="container mx-auto max-w-7xl flex items-center justify-between">

      <!-- 왼쪽: 로고 + 자격증 선택 -->
      <div class="flex items-center gap-2">
        <!-- 로고 -->
        <RouterLink to="/" class="text-2xl font-bold flex items-center whitespace-nowrap">
          <span class="text-red-600">Q</span><span class="text-black">uiz</span>
          <span class="text-red-600">Q</span><span class="text-black">uest</span>
        </RouterLink>

        <!-- 구분선 -->
        <div class="w-px h-6 bg-gray-300 mx-1"></div>

        <!-- 자격증 선택 -->
        <div id="cert-dropdown" class="relative">
          <span
            @click="toggleDropdown"
            class="cursor-pointer text-xs border px-2 py-1 rounded hover:bg-gray-100 text-gray-800 w-40 inline-flex justify-between items-center"
          >
            {{ certStore.selectedCert.name }}
            <svg class="w-4 h-4 ml-1 text-gray-500" fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>

          <!-- 드롭다운 -->
          <ul
            v-if="showDropdown"
            class="absolute bg-white border rounded shadow-md mt-1 py-1 w-40 z-50"
          >
            <li v-for="(cert, index) in certStore.certifications" :key="index">
              <a
                href="#"
                @click.prevent="selectCert(cert)"
                class="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-sm"
              >
                {{ cert.name }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 햄버거 메뉴 버튼 -->
      <button @click="toggleMenu" class="md:hidden text-2xl text-gray-800 focus:outline-none ml-2">
        ☰
      </button>

      <!-- 데스크탑 네비게이션 -->
      <nav class="hidden md:flex gap-6 text-sm text-gray-700">
        <RouterLink to="/learn" class="hover:underline">학습 도구</RouterLink>
        <RouterLink to="/solve" class="hover:underline">문제풀이</RouterLink>
        <RouterLink to="/note" class="hover:underline">오답노트</RouterLink>
        <RouterLink to="/dashboard" class="hover:underline">대시보드</RouterLink>
      </nav>

      <!-- 오른쪽 버튼 -->
      <div class="hidden md:flex gap-3 text-sm">
        <button class="text-gray-600 hover:text-black">+ 만들기</button>
        <button class="bg-red-600 text-white px-4 py-1 rounded-full hover:bg-red-700">로그인</button>
      </div>
    </div>

    <!-- 모바일 메뉴 -->
    <div v-if="menuOpen" class="md:hidden bg-white text-black px-4 pt-4 pb-2">
      <nav class="flex flex-col gap-3 text-sm">
        <RouterLink to="/learn" @click="closeMenu" class="hover:underline">학습 도구</RouterLink>
        <RouterLink to="/solve" @click="closeMenu" class="hover:underline">문제풀이</RouterLink>
        <RouterLink to="/note" @click="closeMenu" class="hover:underline">오답노트</RouterLink>
        <RouterLink to="/dashboard" @click="closeMenu" class="hover:underline">대시보드</RouterLink>

        <div class="flex gap-3 mt-2">
          <button class="text-gray-600 hover:text-black">+ 만들기</button>
          <button class="bg-red-600 text-white px-4 py-1 rounded-full hover:bg-red-700">로그인</button>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { useCertificationStore } from '@/stores/certification'

const menuOpen = ref(false)
const mobileDropdown = ref(false)
const showDropdown = ref(false)

const certStore = useCertificationStore()

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
  mobileDropdown.value = false
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function selectCert(cert) {
  certStore.setCertification(cert)
  showDropdown.value = false
  closeMenu()
}

// 외부 클릭 감지 → 드롭다운 닫기
function handleClickOutside(event) {
  const dropdown = document.getElementById('cert-dropdown')
  if (dropdown && !dropdown.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
