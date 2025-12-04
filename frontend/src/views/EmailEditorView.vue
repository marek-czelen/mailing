<template>
  <div class="email-editor-view">
    <v-app>
      <v-main>
        <EmailEditor 
          @send-test-email="handleSendTestEmail"
          @error="showErrorMessage"
          @success="showSuccessMessage"
        />
        
        <!-- Snackbar for notifications -->
        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          :timeout="4000"
          location="top"
        >
          {{ snackbar.message }}
          <template v-slot:actions>
            <v-btn
              color="white"
              variant="text"
              @click="snackbar.show = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-snackbar>
      </v-main>
    </v-app>
  </div>
</template>

<script>
import EmailEditor from '../components/EmailEditor.vue';

export default {
  name: 'EmailEditorView',
  components: {
    EmailEditor
  },
  data() {
    return {
      snackbar: {
        show: false,
        message: '',
        color: 'success'
      }
    };
  },
  methods: {
    async handleSendTestEmail(emailData) {
      try {
          console.log('Przygotowanie do wysłania testowego e-maila:', emailData);
        
        // Tutaj można dodać wywołanie API do wysyłania e-maili
        // const response = await this.$http.post('/api/emails/send-test', emailData);
        
        // Symulacja wysyłania
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.showSuccessMessage(this.$t('emailEditor.testSent'));
      } catch (error) {
        console.error('Błąd wysyłania e-maila:', error);
        this.showErrorMessage(this.$t('emailEditor.testFailed'));
      }
    },
    
    showErrorMessage(message) {
      this.snackbar = {
        show: true,
        message,
        color: 'error'
      };
    },
    
    showSuccessMessage(message) {
      this.snackbar = {
        show: true,
        message,
        color: 'success'
      };
    }
  }
};
</script>

<style scoped>
.email-editor-view {
  height: 100vh;
  width: 100vw;
}
</style>
