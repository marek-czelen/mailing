import router from './router/index.js';
import axios from 'axios';
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
      // Nie przekierowuj na login jeśli jesteśmy na stronie unsubscribe
      const currentPath = window.location.pathname;
      
        Account.logout();
        console.error(error.response.data?.message || 'Sesja wygasła. Zaloguj się ponownie.');
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

// Montuj aplikację dopiero gdy router jest gotowy, aby uniknąć migotania layoutu
const app = createApp(App)
  .use(router)
  .use(vuetify)

router.isReady().then(() => {
  app.mount('#app')
})
