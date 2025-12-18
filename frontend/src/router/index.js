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
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true // Wymaga uprawnień administratora
    }
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
    path: '/auth/callback/:provider',
    name: 'OAuthCallback',
    component: () => import('../views/OAuthCallbackView.vue'),
    meta: {
      requiresAuth: false // Publiczny endpoint dla OAuth callback
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
import { UsersService } from '../services/users';

router.beforeEach(async (to, from, next) => {
  // Dla strony unsubscribe - zawsze pozwól
  if (to.path.startsWith('/unsubscribe/')) {
    next();
    return;
  }
  
  // Dla callback OAuth - zawsze pozwól
  if (to.path.startsWith('/auth/callback/')) {
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
    return;
  }
  
  // Sprawdź czy strona wymaga uprawnień administratora
  if (to.meta?.requiresAdmin) {
    try {
      const isAdmin = await UsersService.isCurrentUserAdmin();
      if (!isAdmin) {
        // Użytkownik nie jest administratorem - przekieruj na dashboard
        next('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Błąd podczas sprawdzania uprawnień administratora:', error);
      next('/dashboard');
      return;
    }
  }
  
  next();
});

export default router;
