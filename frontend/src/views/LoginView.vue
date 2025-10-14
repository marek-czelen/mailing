<template>
<div class="login-view">
  <div class="login-card">
    <h2 class="login-title">Logowanie</h2>
    <form class="login-form" @submit="handleLogin">
      <input type="email" v-model="email" placeholder="Email" class="login-input" />
      <input type="password" v-model="password" placeholder="Hasło" class="login-input" />
      <button type="submit" class="login-btn">Zaloguj</button>
      <div v-if="error" style="color: #d32f2f; font-size: 0.95rem; margin-top: 8px; text-align: center;">{{ error }}</div>
    </form>
  </div>
</div>

</template>

<script setup>
import { ref } from 'vue';
import { Account } from '../services/account';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');

async function handleLogin(event) {
  event.preventDefault();
  error.value = '';
  const result = await Account.login(email.value, password.value);
  if (result) {
    router.push('/campaigns');
  } else {
    error.value = 'Błąd autoryzacji';
    email.value = '';
    password.value = '';
  }
}
</script>

<style scoped>
  .login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  }
  .login-card {
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 6px 32px rgba(60,60,120,0.10);
    padding: 32px 24px;
    width: 100%;
    max-width: 350px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .login-title {
    margin-bottom: 24px;
    color: #1976D2;
    font-size: 1.6rem;
    font-weight: 600;
    letter-spacing: 1px;
  }
  .login-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .login-input {
    padding: 10px 14px;
    border: none;
    border-bottom: 2px solid #1976D2;
    background: #f5f8ff;
    border-radius: 6px 6px 0 0;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
  }
  .login-input:focus {
    border-bottom: 2px solid #FF9800;
  }
  .login-btn {
    background: #1976D2;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 0;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  .login-btn:hover {
    background: #1565c0;
  }
</style>