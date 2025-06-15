<!-- src/components/HeaderPage.vue -->
<template>
  <header class="bg-white shadow-sm px-4 py-2 sticky top-0 z-50">
    <div class="container mx-auto max-w-7xl flex items-center justify-between">
      <!-- 로고 및 메뉴 -->
      <div class="flex items-center gap-6">
        <RouterLink
          to="/"
          class="text-2xl font-bold flex items-center whitespace-nowrap"
        >
          <span class="text-red-600">Q</span><span class="text-red-600">Q</span
          ><span class="text-black">uest</span>
        </RouterLink>
        <div class="w-px h-6 bg-gray-300 mx-1"></div>

        <!-- 데스크탑 메뉴 -->
        <nav class="hidden md:flex gap-6 text-sm text-gray-700 items-center">
          <RouterLink to="/learn" class="hover:underline">학습하기</RouterLink>
          <RouterLink to="/exam" class="hover:underline">시험보기</RouterLink>
          <RouterLink to="/wrong" class="hover:underline">오답노트</RouterLink>
          <RouterLink to="/exam/history" class="hover:underline"
            >시험결과</RouterLink
          >

          <!-- Admin 메뉴: 클릭 시 토글 -->
          <div v-if="user?.is_admin" class="relative" ref="adminMenuRef">
            <button
              @click="toggleAdminMenu"
              class="hover:underline cursor-pointer"
            >
              Admin
            </button>
            <div
              v-if="showAdminMenu"
              class="absolute bg-white shadow-lg mt-2 py-2 rounded-md z-50 min-w-[200px] border"
            >
              <RouterLink
                to="/admin/category"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeAdminMenu"
                >카테고리관리</RouterLink
              >
              <RouterLink
                to="/admin/exam"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeAdminMenu"
                >자격증관리</RouterLink
              >
              <RouterLink
                to="/admin/round"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeAdminMenu"
                >차수관리</RouterLink
              >
              <RouterLink
                to="/admin/subject"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeAdminMenu"
                >과목관리</RouterLink
              >
              <RouterLink
                to="/admin/round-subject"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeAdminMenu"
                >차수-과목 연결관리</RouterLink
              >
              <RouterLink
                to="/admin/question"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeAdminMenu"
                >문제관리</RouterLink
              >
            </div>
          </div>

          <!-- 방문통계: 관리자만 -->
          <RouterLink
            v-if="user?.is_admin"
            to="/visit-stats"
            class="hover:underline"
            >방문통계</RouterLink
          >
        </nav>
      </div>

      <!-- 모바일 메뉴 버튼 -->
      <button
        @click="toggleMenu"
        class="md:hidden text-2xl text-gray-800 focus:outline-none ml-2"
      >
        ☰
      </button>

      <!-- 로그인 상태 -->
      <div class="hidden md:flex gap-3 text-sm items-center">
        <span v-if="user" class="text-xs text-gray-600"
          >{{ user.name }} 님</span
        >
        <button
          v-if="user"
          @click="handleLogout"
          class="bg-gray-300 text-gray-800 px-4 py-1 rounded-full hover:bg-gray-400"
        >
          로그아웃
        </button>
        <button
          v-else
          @click="handleLoginClick"
          class="bg-red-600 text-white px-4 py-1 rounded-full hover:bg-red-700"
        >
          로그인
        </button>
      </div>
    </div>

    <!-- 모바일 메뉴 -->
    <div v-if="menuOpen" class="md:hidden bg-white text-black px-4 pt-4 pb-2">
      <nav class="flex flex-col gap-3 text-sm">
        <RouterLink to="/learn" @click="closeMenu" class="hover:underline"
          >학습하기</RouterLink
        >
        <RouterLink to="/exam" @click="closeMenu" class="hover:underline"
          >시험보기</RouterLink
        >
        <RouterLink to="/wrong" @click="closeMenu" class="hover:underline"
          >오답노트</RouterLink
        >
        <RouterLink
          v-if="user"
          to="/exam/history"
          @click="closeMenu"
          class="hover:underline"
          >시험결과</RouterLink
        >
        <RouterLink
          v-if="user?.is_admin"
          to="/visit-stats"
          @click="closeMenu"
          class="hover:underline"
          >방문통계</RouterLink
        >

        <div class="flex gap-3 mt-2 items-center">
          <span v-if="user" class="text-xs text-gray-600"
            >{{ user.name }} 님</span
          >
          <button
            v-if="user"
            @click="handleLogout"
            class="bg-gray-300 text-gray-800 px-4 py-1 rounded-full hover:bg-gray-400"
          >
            로그아웃
          </button>
          <button
            v-else
            @click="handleLoginClick"
            class="bg-red-600 text-white px-4 py-1 rounded-full hover:bg-red-700"
          >
            로그인
          </button>
        </div>
      </nav>
    </div>

    <!-- Google 로그인 모달 -->
    <div
      v-if="showLoginModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        ref="modalRef"
        class="bg-white rounded-xl p-6 shadow-lg w-[300px] text-center"
      >
        <h3 class="text-lg font-semibold mb-4">Google 로그인</h3>
        <div id="google-btn-area" class="flex justify-center mb-4"></div>
        <button
          @click="showLoginModal = false"
          class="text-sm text-gray-500 hover:underline"
        >
          닫기
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const router = useRouter();

const menuOpen = ref(false);
const showLoginModal = ref(false);
const showAdminMenu = ref(false);
const adminMenuRef = ref(null);
const modalRef = ref(null);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function closeMenu() {
  menuOpen.value = false;
}

function toggleAdminMenu() {
  showAdminMenu.value = !showAdminMenu.value;
}

function closeAdminMenu() {
  showAdminMenu.value = false;
}

function handleClickOutside(event) {
  if (adminMenuRef.value && !adminMenuRef.value.contains(event.target)) {
    showAdminMenu.value = false;
  }
  if (modalRef.value && !modalRef.value.contains(event.target)) {
    showLoginModal.value = false;
  }
}

async function handleLoginClick() {
  if (user.value) {
    router.push("/dashboard");
    return;
  }

  const gsi = window.google?.accounts?.id;
  if (!gsi) {
    alert("Google 로그인 초기화가 필요합니다.");
    return;
  }

  showLoginModal.value = true;
  setTimeout(() => {
    gsi.renderButton(document.getElementById("google-btn-area"), {
      theme: "outline",
      size: "large",
      width: 250,
      type: "standard",
      text: "signin_with",
    });
  }, 100);
}

function handleLogout() {
  userStore.logout();
  router.push("/");
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});

watch(user, (val) => {
  if (val) {
    showLoginModal.value = false;
  }
});
</script>
