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
    path: '/unsubscribe/:hash',
    name: 'Unsubscribe',
    component: () => import('../views/UnsubscribeView.vue'),
    meta: { 
      requiresAuth: false, // Publiczny endpoint - nie wymaga logowania
      layout: 'public' // Specjalny layout bez menu/toolbar
    }
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
  // Dla strony unsubscribe - zawsze pozwól
  if (to.path.startsWith('/unsubscribe/')) {
    next();
    return;
  }
  
  // Dla strony login - zawsze pozwól
  if (to.path === '/login') {
    next();
    return;
  }
  
  // Sprawdź czy strona wymaga autoryzacji (domyślnie tak, chyba że meta.requiresAuth === false)
  const requiresAuth = to.meta?.requiresAuth !== false;
  
  if (requiresAuth && !Account.IsLoggedIn()) {
    next('/login');
  } else {
    next();
  }
});

export default router;
