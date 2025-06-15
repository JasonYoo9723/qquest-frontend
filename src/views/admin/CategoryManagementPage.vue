<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-xl font-semibold mb-4">카테고리 관리</h1>

    <!-- 추가 버튼 -->
    <div class="mb-4">
      <button
        @click="startNew"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        v-if="!adding"
      >
        + 카테고리 추가
      </button>
    </div>

    <!-- 카테고리 목록 -->
    <table
      class="w-full border text-sm bg-white text-black rounded-xl overflow-hidden"
    >
      <thead class="text-black">
        <tr>
          <th class="border px-3 py-2">코드</th>
          <th class="border px-3 py-2">이름</th>
          <th class="border px-3 py-2">사용여부</th>
          <th class="border px-3 py-2">생성일</th>
          <th class="border px-3 py-2">동작</th>
        </tr>
      </thead>
      <tbody>
        <!-- 신규 추가 입력행 -->
        <tr v-if="adding">
          <td class="border px-2 py-1">
            <input
              v-model="newCategory.category_code"
              class="w-full border rounded px-2 py-1"
            />
          </td>
          <td class="border px-2 py-1">
            <input
              v-model="newCategory.category_name"
              class="w-full border rounded px-2 py-1"
            />
          </td>
          <td class="border px-2 py-1">
            <select
              v-model="newCategory.use_yn"
              class="w-full border rounded px-2 py-1"
            >
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </td>
          <td class="border px-2 py-1 text-center text-gray-400">-</td>
          <td class="border px-2 py-1 text-center">
            <button @click="addCategory" class="text-green-600 mr-2">
              저장
            </button>
            <button @click="cancelNew" class="text-gray-500">취소</button>
          </td>
        </tr>

        <!-- 기존 목록 -->
        <tr v-for="cat in categories" :key="cat.id">
          <!-- 수정 중인 행 -->
          <template v-if="editId === cat.id">
            <td class="border px-2 py-1">
              <input
                v-model="editCache.category_code"
                class="w-full border rounded px-2 py-1"
              />
            </td>
            <td class="border px-2 py-1">
              <input
                v-model="editCache.category_name"
                class="w-full border rounded px-2 py-1"
              />
            </td>
            <td class="border px-2 py-1">
              <select
                v-model="editCache.use_yn"
                class="w-full border rounded px-2 py-1"
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </td>
            <td class="border px-2 py-1 text-center text-gray-400">
              {{ formatDate(cat.created_at) }}
            </td>
            <td class="border px-2 py-1 text-center">
              <button @click="saveEdit(cat.id)" class="text-green-600 mr-2">
                저장
              </button>
              <button @click="cancelEdit" class="text-gray-500">취소</button>
            </td>
          </template>

          <!-- 일반 보기 행 -->
          <template v-else>
            <td class="border px-2 py-1">{{ cat.category_code }}</td>
            <td class="border px-2 py-1">{{ cat.category_name }}</td>
            <td class="border px-2 py-1 text-center">{{ cat.use_yn }}</td>
            <td class="border px-2 py-1 text-center">
              {{ formatDate(cat.created_at) }}
            </td>
            <td class="border px-2 py-1 text-center">
              <button @click="startEdit(cat)" class="text-blue-600 mr-2">
                수정
              </button>
              <button @click="deleteCategory(cat.id)" class="text-red-600">
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
import { ref, onMounted } from "vue";
import axios from "axios";

const categories = ref([]);
const editId = ref(null);
const editCache = ref({});
const adding = ref(false);
const newCategory = ref({ category_code: "", category_name: "", use_yn: "Y" });

const fetchCategories = async () => {
  const res = await axios.get("/api/admin/category");
  categories.value = res.data;
};

const formatDate = (dt) => {
  return dt ? new Date(dt).toLocaleDateString() : "";
};

const startEdit = (cat) => {
  editId.value = cat.id;
  editCache.value = { ...cat };
};

const cancelEdit = () => {
  editId.value = null;
  editCache.value = {};
};

const saveEdit = async (id) => {
  await axios.put(`/api/admin/category/${id}`, editCache.value);
  await fetchCategories();
  cancelEdit();
};

const deleteCategory = async (id) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    await axios.delete(`/api/admin/category/${id}`);
    await fetchCategories();
  }
};

const startNew = () => {
  adding.value = true;
};

const cancelNew = () => {
  adding.value = false;
  newCategory.value = { category_code: "", category_name: "", use_yn: "Y" };
};

const addCategory = async () => {
  await axios.post("/api/admin/category", newCategory.value);
  await fetchCategories();
  cancelNew();
};

onMounted(() => {
  fetchCategories();
});
</script>
