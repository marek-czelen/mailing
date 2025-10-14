import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/dashboard.vue')
  },
  {
    path: '/campaigns',
    name: 'Campaigns',
    component: () => import('../views/CampaignsView.vue')
  },
  {
    path: '/',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


import { Account } from '../services/account';

router.beforeEach((to, from, next) => {
  if (to.path !== '/login' && !Account.IsLoggedIn()) {
    next('/login');
  } else {
    next();
  }
});

export default router;
