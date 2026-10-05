<template>
  <main class="password-reset-view">
    <div class="password-reset-orbit orbit-one"></div>
    <div class="password-reset-orbit orbit-two"></div>

    <section class="password-reset-card" aria-labelledby="password-reset-title">
      <div class="password-reset-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path fill="currentColor" d="M17,7H16V6A4,4 0 0,0 12,2A4,4 0 0,0 8,6V7H7A2,2 0 0,0 5,9V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V9A2,2 0 0,0 17,7M10,6A2,2 0 0,1 14,6V7H10V6M17,19H7V9H17V19M12,17A2,2 0 1,0 12,13A2,2 0 0,0 12,17Z" />
        </svg>
      </div>

      <template v-if="isRequestMode">
        <p class="eyebrow">{{ $t('passwordRecovery.eyebrow') }}</p>
        <h1 id="password-reset-title">{{ $t('passwordRecovery.requestTitle') }}</h1>
        <p class="password-reset-description">{{ $t('passwordRecovery.requestDescription') }}</p>

        <form v-if="!submitted" class="password-reset-form" @submit.prevent="handleRequest">
          <label for="reset-email">{{ $t('passwordRecovery.emailLabel') }}</label>
          <input id="reset-email" v-model="email" type="email" autocomplete="email" required :placeholder="$t('login.emailPlaceholder')" />
          <button type="submit" :disabled="loading">
            {{ loading ? $t('passwordRecovery.sending') : $t('passwordRecovery.sendButton') }}
          </button>
        </form>

        <p v-if="submitted" class="feedback success">{{ $t('passwordRecovery.requestSuccess') }}</p>
      </template>

      <template v-else-if="hasToken">
        <p class="eyebrow">{{ $t('passwordRecovery.eyebrow') }}</p>
        <h1 id="password-reset-title">{{ $t('passwordRecovery.resetTitle') }}</h1>
        <p class="password-reset-description">{{ $t('passwordRecovery.resetDescription') }}</p>

        <form v-if="!submitted" class="password-reset-form" @submit.prevent="handleReset">
          <label for="new-password">{{ $t('passwordRecovery.newPasswordLabel') }}</label>
          <input id="new-password" v-model="password" type="password" autocomplete="new-password" required minlength="8" :placeholder="$t('login.passwordPlaceholder')" />
          <label for="confirm-password">{{ $t('passwordRecovery.confirmPasswordLabel') }}</label>
          <input id="confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" required minlength="8" :placeholder="$t('passwordRecovery.confirmPasswordPlaceholder')" />
          <button type="submit" :disabled="loading">
            {{ loading ? $t('passwordRecovery.saving') : $t('passwordRecovery.resetButton') }}
          </button>
        </form>

        <p v-if="submitted" class="feedback success">{{ $t('passwordRecovery.resetSuccess') }}</p>
      </template>

      <template v-else>
        <p class="eyebrow">{{ $t('passwordRecovery.eyebrow') }}</p>
        <h1 id="password-reset-title">{{ $t('passwordRecovery.invalidTitle') }}</h1>
        <p class="password-reset-description">{{ $t('passwordRecovery.invalidDescription') }}</p>
      </template>

      <p v-if="error" class="feedback error">{{ error }}</p>
      <router-link to="/login" class="back-to-login">{{ $t('passwordRecovery.backToLogin') }}</router-link>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Account } from '../services/account';

const route = useRoute();
const { t } = useI18n();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const submitted = ref(false);
const error = ref('');

const hasToken = computed(() => typeof route.query.token === 'string' && route.query.token.length > 0);
const isRequestMode = computed(() => route.name === 'ForgotPassword');

async function handleRequest() {
  loading.value = true;
  error.value = '';
  try {
    await Account.requestPasswordReset(email.value);
    submitted.value = true;
  } catch {
    error.value = t('passwordRecovery.requestError');
  } finally {
    loading.value = false;
  }
}

async function handleReset() {
  error.value = '';
  if (password.value !== confirmPassword.value) {
    error.value = t('passwordRecovery.passwordMismatch');
    return;
  }

  loading.value = true;
  try {
    await Account.resetPassword(route.query.token, password.value);
    submitted.value = true;
  } catch (requestError) {
    error.value = requestError.response?.data?.response?.message || t('passwordRecovery.resetError');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.password-reset-view {
  min-height: 100vh;
  width: 100%;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
  background: linear-gradient(135deg, #16120d 0%, #26324a 52%, #3c6970 100%);
}

.password-reset-orbit {
  position: absolute;
  border: 1px solid rgba(255, 219, 167, 0.2);
  border-radius: 50%;
  transform: rotate(-18deg);
}

.orbit-one {
  width: 520px;
  height: 220px;
  top: 10%;
  left: -120px;
}

.orbit-two {
  width: 420px;
  height: 170px;
  right: -90px;
  bottom: 12%;
  transform: rotate(22deg);
}

.password-reset-card {
  position: relative;
  z-index: 1;
  width: min(100%, 470px);
  padding: 42px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  background: rgba(250, 248, 242, 0.97);
  box-shadow: 0 24px 70px rgba(8, 16, 27, 0.3);
  color: #1f2937;
}

.password-reset-mark {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  margin-bottom: 24px;
  border-radius: 16px;
  background: #c96f4a;
  color: #fffaf2;
}

.eyebrow {
  margin: 0 0 10px;
  color: #b2573b;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #172333;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 6vw, 2.7rem);
  font-weight: 500;
  line-height: 1.05;
}

.password-reset-description {
  margin: 16px 0 28px;
  color: #657080;
  line-height: 1.6;
}

.password-reset-form {
  display: grid;
  gap: 10px;
}

.password-reset-form label {
  margin-top: 6px;
  color: #344152;
  font-size: 0.86rem;
  font-weight: 700;
}

.password-reset-form input {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #d7d9d4;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  font: inherit;
  outline: none;
}

.password-reset-form input:focus {
  border-color: #c96f4a;
  box-shadow: 0 0 0 3px rgba(201, 111, 74, 0.14);
}

.password-reset-form button {
  margin-top: 14px;
  padding: 13px 18px;
  border: 0;
  border-radius: 8px;
  background: #1c5360;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.password-reset-form button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.feedback {
  margin: 20px 0;
  padding: 13px 14px;
  border-radius: 8px;
  line-height: 1.5;
}

.feedback.success {
  background: #e7f3ed;
  color: #17603d;
}

.feedback.error {
  background: #fce9e6;
  color: #a33e32;
}

.back-to-login {
  display: inline-block;
  margin-top: 24px;
  color: #1c5360;
  font-size: 0.92rem;
  font-weight: 800;
}

@media (max-width: 560px) {
  .password-reset-card {
    padding: 30px 24px;
  }
}
</style>