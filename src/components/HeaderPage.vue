<!-- src\components\HeaderPage.vue -->
<template>
  <header class="bg-white shadow-sm px-4 py-2 sticky top-0 z-50">
    <div class="container mx-auto max-w-7xl flex items-center justify-between">
      <!-- 로고 및 자격증 선택 -->
      <div class="flex items-center gap-2">
        <RouterLink to="/" class="text-2xl font-bold flex items-center whitespace-nowrap">
          <span class="text-red-600">Q</span><span class="text-red-600">Q</span><span class="text-black">uest</span>
        </RouterLink>

        <div class="w-px h-6 bg-gray-300 mx-1"></div>

        <div id="cert-dropdown" class="relative">
          <span
            @click="toggleDropdown"
            class="cursor-pointer text-xs border px-2 py-1 rounded hover:bg-gray-100 text-gray-800 w-40 inline-flex justify-between items-center"
          >
            {{ certStore.selectedCert?.exam_name || '카테고리 선택' }}
            <svg class="w-4 h-4 ml-1 text-gray-500" fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>

          <ul v-if="showDropdown" class="absolute bg-white border rounded shadow-md mt-1 py-1 w-40 z-50">
            <li v-for="(cert, index) in certStore.certifications" :key="index">
              <a
                href="#"
                @click.prevent="selectCert(cert)"
                class="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-sm"
              >
                {{ cert.exam_name }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <button @click="toggleMenu" class="md:hidden text-2xl text-gray-800 focus:outline-none ml-2">☰</button>

      <!-- 데스크탑 메뉴 -->
      <nav class="hidden md:flex gap-6 text-sm text-gray-700">
        <RouterLink to="/learn" class="hover:underline">학습하기</RouterLink>
        <!-- <RouterLink to="/solve" class="hover:underline">시험보기</RouterLink> -->
        <RouterLink to="/wrong" class="hover:underline">오답노트</RouterLink>
        <RouterLink v-if="user?.is_admin" to="/dashboard" class="hover:underline">대시보드</RouterLink>
        <RouterLink v-if="user?.is_admin" to="/upload" class="hover:underline">문제등록</RouterLink>
        <RouterLink v-if="user?.is_admin" to="/modify" class="hover:underline">문제수정</RouterLink>
      </nav>

      <!-- 로그인 상태 -->
      <div class="hidden md:flex gap-3 text-sm items-center">
        <span v-if="user" class="text-xs text-gray-600">{{ user.name }} 님</span>
        <button v-if="user" @click="handleLogout" class="bg-gray-300 text-gray-800 px-4 py-1 rounded-full hover:bg-gray-400">로그아웃</button>
        <button v-else @click="handleLoginClick" class="bg-red-600 text-white px-4 py-1 rounded-full hover:bg-red-700">로그인</button>
      </div>
    </div>

    <!-- 모바일 메뉴 -->
    <div v-if="menuOpen" class="md:hidden bg-white text-black px-4 pt-4 pb-2">
      <nav class="flex flex-col gap-3 text-sm">
        <RouterLink to="/learn" @click="closeMenu" class="hover:underline">학습하기</RouterLink>
        <!-- <RouterLink to="/solve" @click="closeMenu" class="hover:underline">문제풀기</RouterLink> -->
        <RouterLink to="/wrong" @click="closeMenu" class="hover:underline">오답노트</RouterLink>
        <RouterLink to="/dashboard" @click="closeMenu" class="hover:underline">대시보드</RouterLink>

        <div class="flex gap-3 mt-2 items-center">
          <span v-if="user" class="text-xs text-gray-600">{{ user.name }} 님</span>
          <button v-if="user" @click="handleLogout" class="bg-gray-300 text-gray-800 px-4 py-1 rounded-full hover:bg-gray-400">로그아웃</button>
          <button v-else @click="handleLoginClick" class="bg-red-600 text-white px-4 py-1 rounded-full hover:bg-red-700">로그인</button>
        </div>
      </nav>
    </div>

    <!-- 데스크탑 Google 로그인 모달 -->
    <div v-if="showLoginModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref="modalRef" class="bg-white rounded-xl p-6 shadow-lg w-[300px] text-center">
        <h3 class="text-lg font-semibold mb-4">Google 로그인</h3>
        <div id="google-btn-area" class="flex justify-center mb-4"></div>
        <button @click="showLoginModal = false" class="text-sm text-gray-500 hover:underline">닫기</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useCertificationStore } from '@/stores/certification'
import { useExamMetaStore } from '@/stores/examMeta'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const certStore = useCertificationStore()
const examMetaStore = useExamMetaStore()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const router = useRouter()
const route = useRoute()

const showDropdown = ref(false)
const menuOpen = ref(false)
const showLoginModal = ref(false)
const modalRef = ref(null)

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
  showDropdown.value = false
}

function selectCert(cert) {
  certStore.setCertification(cert)
  closeMenu()
}

function handleClickOutside(event) {
  const dropdown = document.getElementById('cert-dropdown')
  if (dropdown && !dropdown.contains(event.target)) {
    showDropdown.value = false
  }
}

function handleClickOutsideModal(event) {
  if (modalRef.value && !modalRef.value.contains(event.target)) {
    showLoginModal.value = false
  }
}

async function handleLoginClick() {
  if (user.value) {
    router.push('/dashboard')
    return
  }

  const gsi = window.google?.accounts?.id
  if (!gsi) {
    alert("Google 로그인 초기화가 필요합니다.")
    return
  }

  showLoginModal.value = true
  setTimeout(() => {
    gsi.renderButton(document.getElementById("google-btn-area"), {
      theme: "outline",
      size: "large",
      width: 250,
      type: "standard",
      text: "signin_with",
    })
  }, 100)
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}

onMounted(async () => {
  await certStore.fetchCertifications()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('mousedown', handleClickOutsideModal)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('mousedown', handleClickOutsideModal)
})

watch(user, (val) => {
  if (val) {
    showLoginModal.value = false
  }
})
</script>
