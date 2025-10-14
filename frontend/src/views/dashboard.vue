<template>
  <v-container>
    dashboard
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Wykres kołowy</v-card-title>
          <v-card-text>
            <PieChart />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Wykres słupkowy</v-card-title>
          <v-card-text>
            <BarChart />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Przykładowa tabelka</v-card-title>
          <v-card-text>
            <SampleTable />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import PieChart from '../components/dashboard/PieChart.vue';
import BarChart from '../components/dashboard/BarChart.vue';
import SampleTable from '../components/dashboard/SampleTable.vue';
</script>

<style scoped>
</style>
