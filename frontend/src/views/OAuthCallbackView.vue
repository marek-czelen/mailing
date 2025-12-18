<template>
  <div class="oauth-callback">
    <div class="callback-container">
      <div class="spinner"></div>
      <h2>{{ $t('auth.processing') }}</h2>
      <p v-if="error" class="error-text">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AuthService } from '../services/auth';

const route = useRoute();
const router = useRouter();
const error = ref('');

onMounted(async () => {
  const provider = route.params.provider;
  const code = route.query.code;
  const state = route.query.state;

  if (!code) {
    error.value = 'Missing authorization code';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
    return;
  }

  try {
    const result = await AuthService.handleOAuthCallback(provider, code, state);

    if (result.success) {
      const returnUrl = AuthService.getReturnUrl();
      router.push(returnUrl);
    } else {
      error.value = result.error;
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  } catch (err) {
    error.value = 'Authentication failed';
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  }
});
</script>

<style scoped>
.oauth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #140f07 0%, #202950 50%, #515bad 100%);
}

.callback-container {
  text-align: center;
  color: white;
  padding: 40px;
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 24px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.error-text {
  color: #ff6b6b;
  margin-top: 16px;
}
</style>
