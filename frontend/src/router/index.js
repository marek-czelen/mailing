import EmailEditorView from '../views/EmailEditorView.vue';
import EmailEditorDemo from '../views/EmailEditorDemo.vue';
import BlockEditorView from '../views/BlockEditorView.vue';

import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';

const routes = [
  {
    path: '/email-editor',
    name: 'EmailEditor',
    component: EmailEditorView
  },
  {
    path: '/email-editor-demo',
    name: 'EmailEditorDemo',
    component: EmailEditorDemo
  },
  {
    path: '/block-email-editor',
    name: 'BlockEmailEditor',
    component: BlockEditorView
  },
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
    path: '/databases',
    name: 'Databases',
    component: () => import('../views/DatabasesView.vue')
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
