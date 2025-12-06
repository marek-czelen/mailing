<template>
  <v-card flat>
    <v-card-text>
      <canvas ref="pieChart"></canvas>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n'
import {
  Chart,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

const { t } = useI18n()

Chart.register(PieController, ArcElement, Tooltip, Legend, Title);
let pieChart = ref(null);
onMounted(() => {
  const ctx = pieChart.value.getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [t('dashboard.categoryA'), t('dashboard.categoryB'), t('dashboard.categoryC')],
      datasets: [{
        data: [30, 50, 20],
        backgroundColor: ['#1976D2', '#E53935', '#43A047'],
      }],
    },
    options: { responsive: true }
  });
});
</script>
