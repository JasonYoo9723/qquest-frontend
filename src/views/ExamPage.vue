<!-- src\views\ExamPage.vue -->
<template>
  <div class="exam-page w-full max-w-screen-md mx-auto px-1 sm:px-6 py-4">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xl md:text-2xl font-semibold">📝 시험보기</h2>
    </div>
    <hr class="border-t border-gray-600 my-3" />

    <!-- 시험 설정 -->
    <div v-if="!started" class="space-y-4">
      <CategorySelector
        v-model="category"
        :isExam="true"
        :maxCount="maxQuestionCount"
        @confirm="handleConfirm"
      />
    </div>

    <!-- 문제 풀이 화면 -->
    <div v-else>
      <div class="text-right mb-2 text-sm text-gray-700 font-semibold">
        {{ currentIndex + 1 }}/{{ questions.length }}
      </div>

      <div
        v-if="currentQuestion"
        class="bg-white p-3 rounded shadow text-black"
      >
        <!-- 문제 정보 -->
        <p class="text-sm text-gray-600 mb-2">
          {{ currentQuestion.exam_name }} | {{ currentQuestion.year }}년도
          {{ currentQuestion.round }}회<br />
          {{ currentQuestion.subject_name }}
        </p>

        <p class="text-lg font-semibold mb-2 whitespace-pre-line">
          {{ currentQuestion.question_no }}. {{ currentQuestion.question_text }}
        </p>

        <ul class="space-y-1">
          <li
            v-for="(choice, i) in currentQuestion.choices"
            :key="i"
            class="border rounded-lg p-2 cursor-pointer hover:bg-gray-100"
            :class="{
              'bg-blue-100 border-blue-400':
                selected[currentIndex] === choice.number,
            }"
            @click="selectChoice(choice.number)"
          >
            {{ i + 1 }}. {{ choice.content }}
          </li>
        </ul>

        <button
          class="mt-6 w-full text-white px-4 py-2 rounded transition"
          :class="{
            'bg-green-600 hover:bg-green-700':
              currentIndex === questions.length - 1,
            'bg-blue-600 hover:bg-blue-700':
              currentIndex < questions.length - 1,
          }"
          @click="nextOrFinish"
        >
          {{
            currentIndex === questions.length - 1 ? "시험 종료" : "다음 문제"
          }}
        </button>
      </div>
    </div>

    <BaseModal
      v-if="showModal"
      title="알림"
      message="정답을 선택해주세요"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import api from "@/lib/api";
import CategorySelector from "@/components/CategorySelector.vue";
import BaseModal from "@/components/BaseModal.vue";
import { useLoadingStore } from "@/stores/loading";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const started = ref(false);
const questions = ref([]);
const currentIndex = ref(0);
const selected = ref([]);
const showModal = ref(false);
const examResult = ref(null);
let examStartTime = null;

const category = ref({
  exam: "",
  year: "",
  round: "",
  session: "",
  subject: "",
  mode: "RAN",
  questionCount: 20,
});
const maxQuestionCount = ref(100);

const currentQuestion = computed(() => questions.value[currentIndex.value]);

const cleanCategoryForCount = (cat) => ({
  exam_code: cat.exam,
  year: Number(cat.year) || 0,
  round: Number(cat.round) || 0,
  session: Number(cat.session) || 0,
  subject: cat.subject || "",
});
onMounted(() => {
  const store = useLoadingStore();
  store.start();
});

watch(
  category,
  async (newVal) => {
    if (!newVal.exam) {
      maxQuestionCount.value = 0;
      return;
    }

    try {
      const res = await api.post("/exam/count", cleanCategoryForCount(newVal));
      maxQuestionCount.value = res.data.count || 0;
      if (category.value.questionCount > maxQuestionCount.value) {
        category.value.questionCount = maxQuestionCount.value;
      }
    } catch (err) {
      console.error("문제 수 계산 실패:", err);
      maxQuestionCount.value = 0;
    }
  },
  { immediate: true, deep: true }
);

const handleConfirm = (confirmed) => {
  category.value = { ...confirmed };
  startExam();
};

const startExam = async () => {
  const store = useLoadingStore();
  store.start();
  const params = {
    exam_code: category.value.exam,
    year: Number(category.value.year) || 0,
    round: Number(category.value.round) || 0,
    session: Number(category.value.session) || 0,
    subject: category.value.subject || "",
    count: category.value.questionCount || 10,
  };

  try {
    const res = await api.post("/exam/start", params);
    questions.value = res.data;
    selected.value = Array(res.data.length).fill(null);
    started.value = true;
    currentIndex.value = 0;
    examStartTime = new Date();

    api
      .post("/admin/visit", {
        exam_code: category.value.exam || "",
        path: router.path,
      })
      .catch((err) => {
        console.warn("방문 로그 실패:", err);
      });
  } catch (err) {
    alert("문제 로드 실패");
    console.error(err);
  } finally {
    store.stop();
  }
};

const selectChoice = (num) => {
  selected.value[currentIndex.value] = num;
};

const nextOrFinish = () => {
  if (!selected.value[currentIndex.value]) {
    showModal.value = true;
    return;
  }

  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++;
  } else {
    finishExam();
  }
};

async function finishExam() {
  const userStore = useUserStore();
  const token = userStore.token;
  if (!token) {
    alert("로그인이 필요합니다.");
    return;
  }

  const duration = examStartTime
    ? Math.floor((new Date().getTime() - examStartTime.getTime()) / 1000)
    : 0;

  const correctCount = questions.value.filter(
    (q, i) => q.answer && selected.value[i] === q.answer
  ).length;

  const wrongList = questions.value
    .map((q, i) => ({
      question_id: q.id,
      chosen_choice: selected.value[i],
    }))
    .filter((entry, i) => selected.value[i] !== questions.value[i].answer);

  const payload = {
    exam_code: category.value.exam,
    year: Number(category.value.year) || null,
    round: Number(category.value.round) || null,
    session: Number(category.value.session) || null,
    subject: category.value.subject || null,
    total_count: questions.value.length,
    correct_count: correctCount,
    wrong_count: wrongList.length,
    duration_seconds: duration,
    wrong_questions: wrongList,
  };

  const store = useLoadingStore();

  try {
    store.start();
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/exam/finish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await res.json();

    // 유효성 검사: result.id 없으면 실패 처리
    if (!res.ok || !result.id) {
      throw new Error("시험 결과 저장 실패 (응답 오류)");
    }

    examResult.value = result;
    router.push(`/exam/result/${result.id}`);
  } catch (err) {
    console.error("시험 결과 저장 실패:", err);
    alert("시험 결과 저장 중 오류가 발생했습니다.");
  } finally {
    store.stop();
  }
}
</script>

<style scoped>
.exam-page {
  max-width: 100%;
  margin: auto;
}
</style>
