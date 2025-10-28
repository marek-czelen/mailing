<template>
  <v-container>
    <h1 class="mb-6">Dashboard</h1>
    
    <!-- Sekcja szybkiego dostępu -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
            Szybki dostęp
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-card 
                  class="quick-access-card" 
                  elevation="2" 
                  hover
                  @click="$router.push('/block-email-editor')"
                >
                  <v-card-text class="text-center pa-4">
                    <v-icon size="48" color="primary" class="mb-3">mdi-email-edit</v-icon>
                    <h3 class="mb-2">Edytor Email (Bloki)</h3>
                    <p class="text-body-2 text-medium-emphasis">
                      Nowoczesny edytor z systemem bloków, szablonem i podglądem mobilnym
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card 
                  class="quick-access-card" 
                  elevation="2" 
                  hover
                  @click="$router.push('/campaigns')"
                >
                  <v-card-text class="text-center pa-4">
                    <v-icon size="48" color="success" class="mb-3">mdi-email-send</v-icon>
                    <h3 class="mb-2">Kampanie</h3>
                    <p class="text-body-2 text-medium-emphasis">
                      Zarządzaj kampaniami email i przeglądaj statystyki
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card 
                  class="quick-access-card" 
                  elevation="2" 
                  hover
                  @click="$router.push('/email-editor')"
                >
                  <v-card-text class="text-center pa-4">
                    <v-icon size="48" color="info" class="mb-3">mdi-code-tags</v-icon>
                    <h3 class="mb-2">Edytor HTML</h3>
                    <p class="text-body-2 text-medium-emphasis">
                      Klasyczny edytor HTML dla zaawansowanych użytkowników
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Wykres kołowy</v-card-title>
          <v-card-text>
            <PieChart />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-card-title>Wykres słupkowy</v-card-title>
          <v-card-text>
            <BarChart />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
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
.quick-access-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.quick-access-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
}

.quick-access-card .v-icon {
  transition: all 0.3s ease;
}

.quick-access-card:hover .v-icon {
  transform: scale(1.1);
}
</style>

