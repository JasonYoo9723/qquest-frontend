<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-xl font-semibold mb-4">차수 관리</h1>

    <!-- 상단 추가 버튼 -->
    <div class="mb-4 flex justify-start">
      <button
        @click="startNew"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        v-if="!adding"
      >
        + 회차 추가
      </button>
    </div>

    <table
      class="w-full border text-sm bg-white text-black rounded-xl overflow-hidden shadow-sm"
    >
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-4 py-3">자격증</th>
          <th class="border px-4 py-3">년도</th>
          <th class="border px-4 py-3">차수</th>
          <th class="border px-4 py-3">생성일</th>
          <th class="border px-4 py-3">동작</th>
        </tr>
      </thead>
      <tbody>
        <!-- 신규 입력 -->
        <tr v-if="adding">
          <td class="border px-2 py-1">
            <select
              v-model="newRound.exam_id"
              class="w-full border rounded px-2 py-1"
            >
              <option v-for="exam in exams" :key="exam.id" :value="exam.id">
                {{ exam.exam_name }}
              </option>
            </select>
          </td>
          <td class="border px-2 py-1">
            <input
              v-model.number="newRound.year"
              type="number"
              class="w-full border rounded px-2 py-1"
            />
          </td>
          <td class="border px-2 py-1">
            <input
              v-model.number="newRound.round"
              type="number"
              class="w-full border rounded px-2 py-1"
            />
          </td>
          <td class="border px-2 py-1 text-center text-gray-400">-</td>
          <td class="border px-2 py-1 text-center">
            <button @click="addRound" class="text-green-600 mr-2">저장</button>
            <button @click="cancelNew" class="text-gray-500">취소</button>
          </td>
        </tr>

        <!-- 목록 -->
        <tr v-for="item in rounds" :key="item.id">
          <template v-if="editId === item.id">
            <td class="border px-2 py-1">
              <select
                v-model="editCache.exam_id"
                class="w-full border rounded px-2 py-1"
              >
                <option v-for="exam in exams" :key="exam.id" :value="exam.id">
                  {{ exam.exam_name }}
                </option>
              </select>
            </td>
            <td class="border px-2 py-1">
              <input
                v-model.number="editCache.year"
                type="number"
                class="w-full border rounded px-2 py-1"
              />
            </td>
            <td class="border px-2 py-1">
              <input
                v-model.number="editCache.round"
                type="number"
                class="w-full border rounded px-2 py-1"
              />
            </td>
            <td class="border px-2 py-1 text-center text-gray-400">
              {{ formatDate(item.created_at) }}
            </td>
            <td class="border px-2 py-1 text-center">
              <button @click="saveEdit(item.id)" class="text-green-600 mr-2">
                저장
              </button>
              <button @click="cancelEdit" class="text-gray-500">취소</button>
            </td>
          </template>

          <template v-else>
            <td class="border px-2 py-1">{{ getExamName(item.exam_id) }}</td>
            <td class="border px-2 py-1 text-center">{{ item.year }}</td>
            <td class="border px-2 py-1 text-center">{{ item.round }}</td>
            <td class="border px-2 py-1 text-center">
              {{ formatDate(item.created_at) }}
            </td>
            <td class="border px-2 py-1 text-center">
              <button @click="startEdit(item)" class="text-blue-600 mr-2">
                수정
              </button>
              <button @click="deleteRound(item.id)" class="text-red-600">
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

const rounds = ref([]);
const exams = ref([]);
const editId = ref(null);
const editCache = ref({});
const adding = ref(false);
const newRound = ref({
  exam_id: "",
  year: "",
  round: "",
});

const fetchRounds = async () => {
  const res = await axios.get("/api/admin/exam-round");
  rounds.value = res.data;
};

const fetchExams = async () => {
  const res = await axios.get("/api/admin/exam");
  exams.value = res.data;
};

const getExamName = (id) => {
  const exam = exams.value.find((e) => e.id === id);
  return exam ? exam.exam_name : "-";
};

const formatDate = (dt) => (dt ? new Date(dt).toLocaleDateString() : "");

const startEdit = (round) => {
  editId.value = round.id;
  editCache.value = { ...round };
};

const cancelEdit = () => {
  editId.value = null;
  editCache.value = {};
};

const saveEdit = async (id) => {
  await axios.put(`/api/admin/exam-round/${id}`, editCache.value);
  await fetchRounds();
  cancelEdit();
};

const deleteRound = async (id) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    await axios.delete(`/api/admin/exam-round/${id}`);
    await fetchRounds();
  }
};

const startNew = () => {
  adding.value = true;
};

const cancelNew = () => {
  adding.value = false;
  newRound.value = { exam_id: "", year: "", round: "" };
};

const addRound = async () => {
  await axios.post("/api/admin/exam-round", newRound.value);
  await fetchRounds();
  cancelNew();
};

onMounted(async () => {
  await fetchExams();
  await fetchRounds();
});
</script>
