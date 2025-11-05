<template>
  <div class="unsubscribe-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <p class="mt-4">Przetwarzanie żądania...</p>
    </div>

    <!-- Success State -->
    <div v-else-if="unsubscribed && !error" class="success-container">
      <v-card class="mx-auto" max-width="600" elevation="3">
        <v-card-title class="success-header">
          <v-icon large color="success" class="mr-3">mdi-check-circle</v-icon>
          Wypisanie z list mailingowych
        </v-card-title>
        
        <v-card-text class="py-6">
          <div class="text-center">
            <v-icon size="80" color="success" class="mb-4">mdi-email-remove-outline</v-icon>
            
            <h2 class="mb-4">Zostałeś pomyślnie wypisany!</h2>
            
            <p class="text-h6 mb-4">
              Adres email <strong>{{ contactEmail }}</strong> został usunięty ze wszystkich naszych baz mailingowych.
            </p>
            
            <v-divider class="my-4"></v-divider>
            
            <div class="info-section">
              <h3 class="mb-3">Co to oznacza?</h3>
              <ul class="text-left unsubscribe-info">
                <li>Nie będziesz już otrzymywać emaili marketingowych od nas</li>
                <li>Zostałeś usunięty ze wszystkich naszych list mailingowych</li>
                <li>Twoje dane osobowe zostały oznaczone jako nieaktywne</li>
                <li>Możesz w każdej chwili ponownie się zapisać na naszą listę</li>
              </ul>
            </div>
            
            <v-divider class="my-4"></v-divider>
            
            <div class="contact-info">
              <p class="text-body-2 text-grey-darken-1">
                W przypadku pytań dotyczących przetwarzania danych osobowych<br>
                skontaktuj się z nami pod adresem: 
                <strong>{{ companyEmail || 'kontakt@verx.pl' }}</strong>
              </p>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="justify-center pb-4">
          <v-btn v-if="false"
            color="primary" 
            variant="outlined"
            @click="goHome"
            prepend-icon="mdi-home"
          >
            Strona główna
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <v-card class="mx-auto" max-width="600" elevation="3">
        <v-card-title class="error-header">
          <v-icon large color="error" class="mr-3">mdi-alert-circle</v-icon>
          Błąd wypisywania
        </v-card-title>
        
        <v-card-text class="py-6">
          <div class="text-center">
            <v-icon size="80" color="error" class="mb-4">mdi-email-alert-outline</v-icon>
            
            <h2 class="mb-4">Wystąpił problem</h2>
            
            <p class="text-h6 mb-4 error-message">
              {{ errorMessage }}
            </p>
            
            <v-divider class="my-4"></v-divider>
            
            <div class="help-section">
              <h3 class="mb-3">Możliwe przyczyny:</h3>
              <ul class="text-left error-causes">
                <li>Link do wypisania wygasł lub jest nieprawidłowy</li>
                <li>Zostałeś już wcześniej wypisany z naszych list</li>
                <li>Wystąpił tymczasowy problem techniczny</li>
              </ul>
              
              <p class="mt-4 text-body-2">
                Jeśli problem się powtarza, skontaktuj się z nami bezpośrednio.
              </p>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="justify-center pb-4">
          <v-btn
            color="primary" 
            variant="outlined"
            @click="retryUnsubscribe"
            prepend-icon="mdi-refresh"
            class="mr-2"
          >
            Spróbuj ponownie
          </v-btn>
          <v-btn v-if="false"
            color="grey" 
            variant="outlined"
            @click="goHome"
            prepend-icon="mdi-home"
          >
            Strona główna
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- RODO Info Footer -->
    <div class="rodo-footer mt-8">
      <v-card flat class="bg-grey-lighten-4">
        <v-card-text class="text-center">
          <p class="text-body-2 text-grey-darken-2 mb-2">
            <v-icon size="16" class="mr-1">mdi-shield-check</v-icon>
            Przetwarzanie danych osobowych zgodnie z RODO
          </p>
          <p class="text-caption text-grey-darken-1">
            Twoje dane są przetwarzane zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).
            Masz prawo do dostępu, sprostowania, usunięcia oraz przenoszenia swoich danych osobowych.
          </p>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MailingService } from '../services/mailing'

// Router setup
const route = useRoute()
const router = useRouter()

// Reactive data
const loading = ref(true)
const unsubscribed = ref(false)
const error = ref(false)
const errorMessage = ref('')
const contactEmail = ref('')
const companyEmail = ref('')

// Get hash from route params
const contactHash = route.params.hash

// Main unsubscribe function
async function performUnsubscribe() {
  loading.value = true
  error.value = false
  
  try {
    const result = await MailingService.unsubscribeFromMailing(contactHash)
    
    if (result.response.success) {
      unsubscribed.value = true
      contactEmail.value = result.data?.contact?.mailAddress || 'Twój adres email'
      
      // Get company email if available
      if (result.data?.customer?.companyEmail) {
        companyEmail.value = result.data.customer.companyEmail
      }
    } else {
      throw new Error(result.message || 'Nieznany błąd podczas wypisywania')
    }
  } catch (err) {
    error.value = true
    errorMessage.value = err.message || 'Wystąpił nieoczekiwany błąd'
    console.error('Błąd podczas wypisywania z mailing:', err)
  } finally {
    loading.value = false
  }
}

// Retry unsubscribe
function retryUnsubscribe() {
  performUnsubscribe()
}

// Navigate to home
function goHome() {
  // Since this is public page, redirect to login or main site
  window.location.href = 'https://www.verx.pl'
}

// Initialize on mount
onMounted(() => {
  if (!contactHash) {
    error.value = true
    errorMessage.value = 'Brakuje identyfikatora kontaktu w linku'
    loading.value = false
    return
  }
  
  performUnsubscribe()
})

// Validate hash format (basic check)
if (contactHash && !/^[A-Za-z0-9_-]+$/.test(contactHash)) {
  error.value = true
  errorMessage.value = 'Nieprawidłowy format identyfikatora kontaktu'
  loading.value = false
}
</script>

<style scoped>
.unsubscribe-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.loading-container, 
.success-container, 
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 700px;
}

.success-header {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  border-radius: 8px 8px 0 0;
}

.error-header {
  background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
  color: white;
  border-radius: 8px 8px 0 0;
}

.unsubscribe-info, 
.error-causes {
  display: inline-block;
  text-align: left;
  margin: 0 auto;
}

.unsubscribe-info li, 
.error-causes li {
  margin-bottom: 8px;
  position: relative;
  padding-left: 24px;
}

.unsubscribe-info li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #4caf50;
  font-weight: bold;
}

.error-causes li::before {
  content: '⚠';
  position: absolute;
  left: 0;
  color: #ff9800;
}

.info-section, 
.help-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 16px 0;
}

.contact-info {
  background: #e3f2fd;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #2196f3;
}

.error-message {
  color: #d32f2f;
  background: #ffebee;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #f44336;
}

.rodo-footer {
  width: 100%;
  max-width: 700px;
}

/* Responsive design */
@media (max-width: 600px) {
  .unsubscribe-page {
    padding: 10px;
  }
  
  .v-card {
    margin: 0 !important;
  }
}

/* Loading animation */
.loading-container {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

/* Success animation */
.success-container {
  animation: slideIn 0.5s ease-out;
}

/* Error animation */
.error-container {
  animation: shakeIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes shakeIn {
  0% {
    transform: translateX(-10px);
    opacity: 0;
  }
  25% {
    transform: translateX(10px);
    opacity: 0.5;
  }
  50% {
    transform: translateX(-5px);
    opacity: 0.75;
  }
  75% {
    transform: translateX(5px);
    opacity: 0.9;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>