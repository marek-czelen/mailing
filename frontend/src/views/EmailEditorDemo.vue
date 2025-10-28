<template>
  <div class="email-editor-demo">
    <v-app>
      <v-main>
        <EmailEditor 
          @send-test-email="handleSendTestEmail"
          @error="handleError"
          @success="handleSuccess"
        />
        
        <!-- Snackbar for notifications -->
        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          :timeout="3000"
        >
          {{ snackbar.message }}
          <template v-slot:actions>
            <v-btn
              color="white"
              variant="text"
              @click="snackbar.show = false"
            >
              Zamknij
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
  name: 'EmailEditorDemo',
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
    handleSendTestEmail(emailData) {
      console.log('Wysyłanie testowego e-maila:', emailData);
      this.showNotification('Testowy e-mail zostałby wysłany (funkcjonalność demo)', 'info');
    },
    
    handleError(message) {
      this.showNotification(message, 'error');
    },
    
    handleSuccess(message) {
      this.showNotification(message, 'success');
    },
    
    showNotification(message, color = 'success') {
      this.snackbar = {
        show: true,
        message,
        color
      };
    }
  }
};
</script>

<style scoped>
.email-editor-demo {
  height: 100vh;
}
</style>