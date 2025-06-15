<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-xl font-semibold mb-4">차수-과목 연결 관리</h1>

    <div class="mb-4 flex justify-start">
      <button
        @click="startNew"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        v-if="!adding"
      >
        + 연결 추가
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
          <th class="border px-4 py-3">과목</th>
          <th class="border px-4 py-3">생성일</th>
          <th class="border px-4 py-3">동작</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="adding">
          <td class="border px-2 py-1">
            <select
              v-model="newItem.exam_id"
              @change="onExamChange"
              class="w-full border rounded px-2 py-1"
            >
              <option value="">자격증 선택</option>
              <option v-for="e in exams" :key="e.id" :value="e.id">
                {{ e.exam_name }}
              </option>
            </select>
          </td>
          <td class="border px-2 py-1">
            <select
              v-model="newItem.exam_round_id"
              class="w-full border rounded px-2 py-1"
            >
              <option value="">년도/차수 선택</option>
              <option
                v-for="r in examRounds.filter(
                  (er) => er.exam_id === newItem.exam_id
                )"
                :key="r.id"
                :value="r.id"
              >
                {{ r.year }}년 {{ r.round }}차
              </option>
            </select>
          </td>
          <td class="border px-2 py-1" />
          <td class="border px-2 py-1">
            <select
              v-model="newItem.subject_ids"
              multiple
              class="w-full border rounded px-2 py-1 h-[120px]"
            >
              <option v-for="s in filteredSubjects" :key="s.id" :value="s.id">
                {{ s.subject_name }}
              </option>
            </select>
          </td>
          <td class="border px-2 py-1 text-center text-gray-400">-</td>
          <td class="border px-2 py-1 text-center">
            <button @click="addItem" class="text-green-600 mr-2">저장</button>
            <button @click="cancelNew" class="text-gray-500">취소</button>
          </td>
        </tr>

        <tr v-for="item in items" :key="item.id">
          <td class="border px-2 py-1">
            {{ getExamNameByRoundId(item.exam_round_id) }}
          </td>
          <td class="border px-2 py-1 text-center">
            {{ getExamYear(item.exam_round_id) }}
          </td>
          <td class="border px-2 py-1 text-center">
            {{ getExamRound(item.exam_round_id) }}
          </td>
          <td class="border px-2 py-1">
            {{ getSubjectName(item.subject_id) }}
          </td>
          <td class="border px-2 py-1 text-center">
            {{ formatDate(item.created_at) }}
          </td>
          <td class="border px-2 py-1 text-center">
            <button @click="deleteItem(item.id)" class="text-red-600">
              삭제
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const items = ref([]);
const exams = ref([]);
const examRounds = ref([]);
const allSubjects = ref([]);
const filteredSubjects = ref([]);

const adding = ref(false);
const newItem = ref({
  exam_id: "",
  exam_round_id: "",
  subject_ids: [],
});

const fetchItems = async () => {
  const res = await axios.get("/api/admin/round-subject");
  items.value = res.data;
};
const fetchExams = async () => {
  const res = await axios.get("/api/admin/exam");
  exams.value = res.data;
};
const fetchExamRounds = async () => {
  const res = await axios.get("/api/admin/exam-round");
  examRounds.value = res.data;
};
const fetchAllSubjects = async () => {
  const res = await axios.get("/api/admin/subject");
  allSubjects.value = res.data;
};

const onExamChange = async () => {
  newItem.value.exam_round_id = "";
  newItem.value.subject_ids = [];
  filteredSubjects.value = allSubjects.value.filter(
    (s) => s.exam_id === newItem.value.exam_id
  );
};

const getExamNameByRoundId = (round_id) => {
  const round = examRounds.value.find((r) => r.id === round_id);
  const exam = exams.value.find((e) => e.id === round?.exam_id);
  return exam ? exam.exam_name : "-";
};
const getExamYear = (round_id) => {
  const r = examRounds.value.find((r) => r.id === round_id);
  return r ? r.year : "-";
};
const getExamRound = (round_id) => {
  const r = examRounds.value.find((r) => r.id === round_id);
  return r ? r.round : "-";
};
const getSubjectName = (subject_id) => {
  const s = allSubjects.value.find((s) => s.id === subject_id);
  return s ? s.subject_name : "-";
};
const formatDate = (dt) => (dt ? new Date(dt).toLocaleDateString() : "-");
const deleteItem = async (id) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    await axios.delete(`/api/admin/round-subject/${id}`);
    await fetchItems();
  }
};
const startNew = () => {
  adding.value = true;
};
const cancelNew = () => {
  adding.value = false;
  newItem.value = { exam_id: "", exam_round_id: "", subject_ids: [] };
};
const addItem = async () => {
  for (const subject_id of newItem.value.subject_ids) {
    await axios.post("/api/admin/round-subject", {
      exam_round_id: newItem.value.exam_round_id,
      subject_id,
    });
  }
  await fetchItems();
  cancelNew();
};

onMounted(async () => {
  await fetchExams();
  await fetchExamRounds();
  await fetchAllSubjects();
  await fetchItems();
});
</script>
