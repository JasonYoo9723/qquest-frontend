<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-xl font-semibold mb-4">자격증 관리</h1>

    <!-- 상단 컨트롤 바 -->
    <div class="mb-4 flex justify-between items-center">
      <button
        @click="startNew"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        v-if="!adding"
      >
        + 자격증 추가
      </button>

      <div class="flex items-center space-x-2 text-black">
        <label class="font-medium">카테고리 필터:</label>
        <select
          v-model="categoryFilter"
          class="border rounded px-2 py-1 text-black"
        >
          <option value="">전체</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.category_name }}
          </option>
        </select>
      </div>
    </div>

    <table
      class="w-full border text-sm bg-white text-black rounded-xl overflow-hidden shadow-sm"
    >
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-4 py-3">코드</th>
          <th class="border px-4 py-3">이름</th>
          <th class="border px-4 py-3">카테고리</th>
          <th class="border px-4 py-3">생성일</th>
          <th class="border px-4 py-3">동작</th>
        </tr>
      </thead>
      <tbody>
        <!-- 신규 입력 -->
        <tr v-if="adding">
          <td class="border px-2 py-1">
            <input
              v-model="newExam.exam_code"
              class="w-full border rounded px-2 py-1"
            />
          </td>
          <td class="border px-2 py-1">
            <input
              v-model="newExam.exam_name"
              class="w-full border rounded px-2 py-1"
            />
          </td>
          <td class="border px-2 py-1">
            <select
              v-model="newExam.category_code"
              class="w-full border rounded px-2 py-1"
            >
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.category_name }}
              </option>
            </select>
          </td>
          <td class="border px-2 py-1 text-center text-gray-400">-</td>
          <td class="border px-2 py-1 text-center">
            <button @click="addExam" class="text-green-600 mr-2">저장</button>
            <button @click="cancelNew" class="text-gray-500">취소</button>
          </td>
        </tr>

        <!-- 목록 -->
        <tr v-for="exam in filteredExams" :key="exam.id">
          <template v-if="editId === exam.id">
            <td class="border px-2 py-1">
              <input
                v-model="editCache.exam_code"
                class="w-full border rounded px-2 py-1"
              />
            </td>
            <td class="border px-2 py-1">
              <input
                v-model="editCache.exam_name"
                class="w-full border rounded px-2 py-1"
              />
            </td>
            <td class="border px-2 py-1">
              <select
                v-model="editCache.category_code"
                class="w-full border rounded px-2 py-1"
              >
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.category_name }}
                </option>
              </select>
            </td>
            <td class="border px-2 py-1 text-center text-gray-400">
              {{ formatDate(exam.created_at) }}
            </td>
            <td class="border px-2 py-1 text-center">
              <button @click="saveEdit(exam.id)" class="text-green-600 mr-2">
                저장
              </button>
              <button @click="cancelEdit" class="text-gray-500">취소</button>
            </td>
          </template>

          <template v-else>
            <td class="border px-2 py-1">{{ exam.exam_code }}</td>
            <td class="border px-2 py-1">{{ exam.exam_name }}</td>
            <td class="border px-2 py-1 text-center">
              {{ getCategoryName(exam.category_id) }}
            </td>
            <td class="border px-2 py-1 text-center">
              {{ formatDate(exam.created_at) }}
            </td>
            <td class="border px-2 py-1 text-center">
              <button @click="startEdit(exam)" class="text-blue-600 mr-2">
                수정
              </button>
              <button @click="deleteExam(exam.id)" class="text-red-600">
                삭제
              </button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

const exams = ref([]);
const categories = ref([]);
const categoryFilter = ref("");
const editId = ref(null);
const editCache = ref({});
const adding = ref(false);
const newExam = ref({
  exam_code: "",
  exam_name: "",
  category_code: "",
});

const fetchExams = async () => {
  const res = await axios.get("/api/admin/exam");
  exams.value = res.data;
};

const fetchCategories = async () => {
  const res = await axios.get("/api/admin/category");
  categories.value = res.data;
};

const formatDate = (dt) => (dt ? new Date(dt).toLocaleDateString() : "");

const getCategoryName = (id) => {
  const found = categories.value.find((cat) => cat.id === id);
  return found ? found.category_name : "-";
};

const filteredExams = computed(() => {
  if (!categoryFilter.value) return exams.value;
  return exams.value.filter(
    (exam) => exam.category_id === categoryFilter.value
  );
});

const startEdit = (exam) => {
  editId.value = exam.id;
  editCache.value = { ...exam };
};

const cancelEdit = () => {
  editId.value = null;
  editCache.value = {};
};

const saveEdit = async (id) => {
  await axios.put(`/api/admin/exam/${id}`, editCache.value);
  await fetchExams();
  cancelEdit();
};

const deleteExam = async (id) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    await axios.delete(`/api/admin/exam/${id}`);
    await fetchExams();
  }
};

const startNew = () => {
  adding.value = true;
};

const cancelNew = () => {
  adding.value = false;
  newExam.value = { exam_code: "", exam_name: "", category_code: "" };
};

const addExam = async () => {
  await axios.post("/api/admin/exam", newExam.value);
  await fetchExams();
  cancelNew();
};

onMounted(async () => {
  await fetchCategories();
  await fetchExams();
});
</script>
