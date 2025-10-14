import axios from 'axios';
import router from './router/index.js';
import { Account } from './services/account.js';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    delete config.headers['Authorization'];
  }
  return config;
});

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      Account.logout();
      alert(error.response.data?.message || 'Sesja wygasła. Zaloguj się ponownie.');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import WebFont from 'webfontloader';

import '@mdi/font/css/materialdesignicons.css';

WebFont.load({
	google: {
		families: ['Roboto:100,300,400,500,700,900']
	}
});
createApp(App)
	.use(router)
	.use(vuetify)
	.mount('#app')
