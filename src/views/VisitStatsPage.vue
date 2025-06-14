<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6">📊 방문자 통계</h2>

    <div class="mb-12">
      <h3 class="text-xl font-semibold mb-2">일별 방문자 수</h3>
      <LineChart v-if="dailyChartData" :chart-data="dailyChartData" />
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-2">월별 방문자 수</h3>
      <LineChart v-if="monthlyChartData" :chart-data="monthlyChartData" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/lib/api'; // axios 인스턴스
import LineChart from '@/components/LineChart.vue';

const dailyChartData = ref(null);
const monthlyChartData = ref(null);

onMounted(async () => {
  const { data: daily } = await api.get('/visit/stats/daily');
  const { data: monthly } = await api.get('/visit/stats/monthly');

  dailyChartData.value = {
    labels: daily.map((d) => convertToKST(d.date)),
    datasets: [
      {
        label: '페이지뷰',
        data: daily.map((d) => d.pv),
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.1)',
        tension: 0.3,
      },
      {
        label: '유니크 방문자',
        data: daily.map((d) => d.uv),
        borderColor: 'green',
        backgroundColor: 'rgba(0,255,0,0.1)',
        tension: 0.3,
      },
    ],
  };

  monthlyChartData.value = {
    labels: monthly.map((m) => m.month),
    datasets: [
      {
        label: '페이지뷰',
        data: monthly.map((m) => m.pv),
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.1)',
        tension: 0.3,
      },
      {
        label: '유니크 방문자',
        data: monthly.map((m) => m.uv),
        borderColor: 'green',
        backgroundColor: 'rgba(0,255,0,0.1)',
        tension: 0.3,
      },
    ],
  };
});

function convertToKST(dateStr) {
  const utcDate = new Date(dateStr + 'T00:00:00Z');
  return utcDate.toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
</script>
