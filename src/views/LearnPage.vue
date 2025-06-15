<template>
  <div
    class="learn-page w-full max-w-screen-md mx-auto px-1 sm:px-6 py-4 relative"
  >
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xl md:text-2xl font-semibold">📘 학습하기</h2>
      <button @click="toggleCategory" class="text-2xl" aria-label="범주 설정">
        ⚙️
      </button>
    </div>
    <hr class="border-t border-gray-600 my-3" />

    <transition name="fade">
      <CategorySelector
        v-if="showCategory"
        v-model="selectedCategory"
        @confirm="handleConfirm"
      />
    </transition>

    <div
      v-if="totalCount > 0"
      class="mb-4 text-right text-sm font-semibold"
      :class="answerRate < 60 ? 'text-red-600' : 'text-green-600'"
    >
      정답 {{ correctCount }}/{{ totalCount }} ({{ answerRate }}%)
    </div>

    <div
      v-if="question"
      class="w-full bg-white text-black p-3 rounded-xl shadow"
    >
      <p class="text-sm text-gray-600 mb-1">
        {{ question.exam_name }} | {{ question.year }}년도
        {{ question.round }}회 <br />
        {{ question.subject_name }}
      </p>
      <p class="text-lg font-semibold mb-2 whitespace-pre-line">
        {{ question.question_no }}. {{ question.question_text }}
      </p>

      <ul class="space-y-1">
        <li
          v-for="(c, index) in question.choices"
          :key="index"
          class="border rounded-lg p-2 cursor-pointer hover:bg-gray-100"
          :class="{
            'bg-green-100 border-green-400':
              showAnswer && c.number === parseInt(question.answer),
            'bg-red-100 border-red-400':
              showAnswer &&
              selectedChoice === c.number &&
              c.number !== parseInt(question.answer),
          }"
          @click="handleChoice(c.number)"
        >
          {{ index + 1 }}. {{ c.content }}
        </li>
      </ul>

      <div
        v-if="showAnswer && !isNaN(parseInt(question.answer))"
        class="mt-4 text-green-600 font-bold"
      >
        ✅ 정답: {{ parseInt(question.answer) }}. {{ getAnswerText() }}
      </div>
      <div v-else-if="showAnswer" class="mt-4 text-red-600 font-bold">
        ⚠️ 정답 정보가 없습니다
      </div>

      <button
        class="mt-6 w-full text-lg font-semibold bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        @click="nextQuestion"
      >
        다음 문제
      </button>
    </div>

    <div v-else class="text-gray-400"></div>

    <BaseModal
      v-if="showAnswerRequiredModal"
      title="알림"
      message="정답을 선택해주세요."
      @close="showAnswerRequiredModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { useLoadingStore } from "@/stores/loading";
import { useExamMetaStore } from "@/stores/examMeta";
import { useUserStore } from "@/stores/user";
import CategorySelector from "@/components/CategorySelector.vue";
import BaseModal from "@/components/BaseModal.vue";
import { useRoute } from "vue-router";

const question = ref(null);
const selectedChoice = ref(null);
const showAnswer = ref(false);
const showCategory = ref(false);
const showAnswerRequiredModal = ref(false);
const currentIndex = ref(1);

const correctCount = ref(0);
const totalCount = ref(0);
const route = useRoute();

const answerRate = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((correctCount.value / totalCount.value) * 100);
});

const selectedCategory = ref({
  exam: "",
  year: "",
  round: "",
  session: "",
  subject: "",
  mode: "RAN",
});

const toggleCategory = () => {
  showCategory.value = !showCategory.value;
};

const fetchQuestion = async () => {
  const store = useLoadingStore();
  const c = selectedCategory.value;

  if (!c.exam) {
    console.warn("자격증이 선택되지 않았습니다. 문제 조회를 건너뜁니다.");
    return;
  }

  const params = {
    exam_code: c.exam,
    year: c.year || null,
    round: c.round || null,
    subject: c.subject || null,
    session: c.session || null,
    mode: c.mode,
  };

  if (c.mode === "SEQ") {
    const metaStore = useExamMetaStore();
    const startNo = metaStore.getStartNo(
      c.exam,
      c.year || "",
      c.round || "",
      c.session || "",
      c.subject || ""
    );
    params.question_no = startNo + (currentIndex.value - 1);
  }

  store.start();
  try {
    const res = await api.get("learn/random-question", { params });
    question.value = res.data;
    selectedChoice.value = null;
    showAnswer.value = false;
  } catch (err) {
    alert("문제 불러오기 오류 (콘솔 확인)");
    console.error(err);
  } finally {
    store.stop();
  }
};

const handleChoice = async (number) => {
  if (!showAnswer.value) {
    selectedChoice.value = number;
    showAnswer.value = true;

    const correct = parseInt(question.value.answer);
    totalCount.value += 1;
    if (number === correct) {
      correctCount.value += 1;
    }

    if (number !== correct) {
      const userStore = useUserStore();
      if (userStore.isLoggedIn) {
        try {
          await api.post("/wrong-note/add", { question_id: question.value.id });
        } catch (err) {
          console.error("오답노트 저장 실패:", err);
        }
      }
    }
  }
};

const getAnswerText = () => {
  const answerNum = parseInt(question.value.answer);
  if (isNaN(answerNum)) return "";
  return (
    question.value.choices.find((c) => c.number === answerNum)?.content || ""
  );
};

const nextQuestion = () => {
  if (!showAnswer.value) {
    showAnswerRequiredModal.value = true;
    return;
  }

  if (selectedCategory.value.mode === "SEQ") {
    currentIndex.value += 1;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  fetchQuestion();
};

const handleConfirm = (confirmedCategory) => {
  const store = useLoadingStore();
  store.start();
  selectedCategory.value = { ...confirmedCategory };
  currentIndex.value = 1;
  correctCount.value = 0;
  totalCount.value = 0;
  showCategory.value = false;
  fetchQuestion().finally(() => {
    store.stop();
  });
};

onMounted(async () => {
  const store = useLoadingStore();
  store.start();
  const examMetaStore = useExamMetaStore();
  await examMetaStore.fetchMeta();
  store.stop();

  selectedCategory.value = {
    exam: Cookies.get("last_exam") || "",
    year: Cookies.get("last_year") || "",
    round: Cookies.get("last_round") || "",
    session: Cookies.get("last_session") || "",
    subject: Cookies.get("last_subject") || "",
    mode: Cookies.get("last_mode") || "RAN",
  };

  showCategory.value = true;
  api
    .post("/admin/visit", {
      exam_code: selectedCategory.value.exam || "",
      path: route.fullPath,
    })
    .catch((err) => {
      console.warn("방문 로그 실패:", err);
    });
});
</script>

<style scoped>
.learn-page {
  max-width: 100%;
  margin: auto;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
