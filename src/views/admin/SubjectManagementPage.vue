<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-xl font-semibold mb-4">과목 관리</h1>

    <!-- 상단 버튼 -->
    <div class="mb-4 flex justify-start">
      <button
        @click="startNew"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        v-if="!adding"
      >
        + 과목 추가
      </button>
    </div>

    <table
      class="w-full border text-sm bg-white text-black rounded-xl overflow-hidden shadow-sm"
    >
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-4 py-3">자격증</th>
          <th class="border px-4 py-3">코드</th>
          <th class="border px-4 py-3">이름</th>
          <th class="border px-4 py-3">생성일</th>
          <th class="border px-4 py-3">동작</th>
        </tr>
      </thead>
      <tbody>
        <!-- 신규 입력 -->
        <tr v-if="adding">
          <td class="border px-2 py-1">
            <select
              v-model="newSubject.exam_id"
              class="w-full border rounded px-2 py-1"
            >
              <option v-for="exam in exams" :key="exam.id" :value="exam.id">
                {{ exam.exam_name }}
              </option>
            </select>
          </td>
          <td class="border px-2 py-1">
            <input
              v-model="newSubject.subject_code"
              class="w-full border rounded px-2 py-1"
            />
          </td>
          <td class="border px-2 py-1">
            <input
              v-model="newSubject.subject_name"
              class="w-full border rounded px-2 py-1"
            />
          </td>
          <td class="border px-2 py-1 text-center text-gray-400">-</td>
          <td class="border px-2 py-1 text-center">
            <button @click="addSubject" class="text-green-600 mr-2">
              저장
            </button>
            <button @click="cancelNew" class="text-gray-500">취소</button>
          </td>
        </tr>

        <!-- 목록 -->
        <tr v-for="subject in subjects" :key="subject.id">
          <template v-if="editId === subject.id">
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
                v-model="editCache.subject_code"
                class="w-full border rounded px-2 py-1"
              />
            </td>
            <td class="border px-2 py-1">
              <input
                v-model="editCache.subject_name"
                class="w-full border rounded px-2 py-1"
              />
            </td>
            <td class="border px-2 py-1 text-center text-gray-400">
              {{ formatDate(subject.created_at) }}
            </td>
            <td class="border px-2 py-1 text-center">
              <button @click="saveEdit(subject.id)" class="text-green-600 mr-2">
                저장
              </button>
              <button @click="cancelEdit" class="text-gray-500">취소</button>
            </td>
          </template>

          <template v-else>
            <td class="border px-2 py-1">{{ getExamName(subject.exam_id) }}</td>
            <td class="border px-2 py-1">{{ subject.subject_code }}</td>
            <td class="border px-2 py-1">{{ subject.subject_name }}</td>
            <td class="border px-2 py-1 text-center">
              {{ formatDate(subject.created_at) }}
            </td>
            <td class="border px-2 py-1 text-center">
              <button @click="startEdit(subject)" class="text-blue-600 mr-2">
                수정
              </button>
              <button @click="deleteSubject(subject.id)" class="text-red-600">
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

const subjects = ref([]);
const exams = ref([]);

const editId = ref(null);
const editCache = ref({});
const adding = ref(false);

const newSubject = ref({
  subject_code: "",
  subject_name: "",
  exam_id: "",
});

const fetchSubjects = async () => {
  const res = await axios.get("/api/admin/subject");
  subjects.value = res.data;
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

const startEdit = (subject) => {
  editId.value = subject.id;
  editCache.value = { ...subject };
};

const cancelEdit = () => {
  editId.value = null;
  editCache.value = {};
};

const saveEdit = async (id) => {
  await axios.put(`/api/admin/subject/${id}`, editCache.value);
  await fetchSubjects();
  cancelEdit();
};

const deleteSubject = async (id) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    await axios.delete(`/api/admin/subject/${id}`);
    await fetchSubjects();
  }
};

const startNew = () => {
  adding.value = true;
};

const cancelNew = () => {
  adding.value = false;
  newSubject.value = { subject_code: "", subject_name: "", exam_id: "" };
};

const addSubject = async () => {
  await axios.post("/api/admin/subject", newSubject.value);
  await fetchSubjects();
  cancelNew();
};

onMounted(async () => {
  await fetchExams();
  await fetchSubjects();
});
</script>
