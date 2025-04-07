<!-- src\views\DashboardPage.vue -->
<template>
  <div class="dashboard-page">
    <h1 class="page-title">📋 Action Items</h1>
    <div v-if="loading" class="text-gray-400 text-center mt-10">불러오는 중...</div>
    <div v-else v-html="renderedMarkdown" class="markdown-area"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { marked } from 'marked'

const renderedMarkdown = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('./ActionItems.md')
    const text = await res.text()
    renderedMarkdown.value = marked.parse(text)
  } catch (e) {
    renderedMarkdown.value = '# ❗ ActionItems.md 파일을 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
})
</script>
<style scoped>
.markdown-area {
  line-height: 1.75;
  color: #333;
  font-size: 14px;
}

.markdown-area h1,
.markdown-area h2,
.markdown-area h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.markdown-area p {
  margin: 0.5em 0;
}

.markdown-area ul {
  margin-left: 1.5em;
  list-style-type: disc;
}

.markdown-area li {
  margin-bottom: 0.3em;
}

.markdown-area hr {
  margin: 2em 0;
  border: none;
  border-top: 1px solid #ccc;
}
/* 기본 체크박스 스타일 */
.markdown-area input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  background-color: white;
  border: 1px solid #ccc;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 0.2rem;
  display: inline-block;
  position: relative;
  vertical-align: middle;
  margin-right: 0.5rem;
  cursor: pointer;
}

/* 체크됐을 때 스타일 (밝은 색 체크 표시) */
.markdown-area input[type="checkbox"]:checked {
  background-color: #f87171; /* 밝은 빨간색 (Tailwind의 red-400 느낌) */
  border-color: #f87171;
}

.markdown-area input[type="checkbox"]:checked::after {
  content: '✓';
  color: white;
  font-size: 0.9rem;
  position: absolute;
  top: 0;
  left: 2px;
}

.markdown-area li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}
</style>
