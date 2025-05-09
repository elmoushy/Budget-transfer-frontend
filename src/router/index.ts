import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Define routes
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/enhancements',
    name: 'Enhancements',
    component: () => import('@/views/Enhancements.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settlements',
    name: 'Settlements',
    component: () => import('@/views/Contracts.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/enhancements-pending',
    name: 'EnhancementsPendingApproval',
    component: () => import('@/views/EnhancementsPendingApproval.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settlements-pending',
    name: 'SettlementsPendingApproval',
    component: () => import('@/views/SettlementsPendingApproval.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/contracts-pending',
    name: 'ContractsPendingApproval',
    component: () => import('@/views/ContractsPendingApproval.vue'),
    meta: { requiresAuth: true },
  },
  // Catch-all route for 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

// Create the router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false

  // Check if route requires authentication and user is not authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  }
  // If user is authenticated and trying to access login page, redirect to dashboard
  else if (authStore.isAuthenticated && to.name === 'Login') {
    next({ name: 'Dashboard' })
  }
  // Otherwise, allow navigation
  else {
    next()
  }
})

export default router
