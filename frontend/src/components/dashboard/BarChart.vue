<template>
  <v-card flat>
    <v-card-text>
      <canvas ref="barChart"></canvas>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

const { t } = useI18n()

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);
let barChart = ref(null);
onMounted(() => {
  const ctx = barChart.value.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [t('dashboard.january'), t('dashboard.february'), t('dashboard.march')],
      datasets: [{
        label: t('dashboard.value'),
        data: [12, 19, 7],
        backgroundColor: '#1976D2',
      }],
    },
    options: { responsive: true }
  });
});
</script>
