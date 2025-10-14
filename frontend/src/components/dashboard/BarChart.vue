<template>
  <v-card flat>
    <v-card-text>
      <canvas ref="barChart"></canvas>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { onMounted, ref } from 'vue';
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
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);
let barChart = ref(null);
onMounted(() => {
  const ctx = barChart.value.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Styczeń', 'Luty', 'Marzec'],
      datasets: [{
        label: 'Wartość',
        data: [12, 19, 7],
        backgroundColor: '#1976D2',
      }],
    },
    options: { responsive: true }
  });
});
</script>
