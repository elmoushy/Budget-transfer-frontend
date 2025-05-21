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
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
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
    name: 'Settlements', // This must match the name used in NavigationMenu.vue
    component: () => import('@/views/Contracts.vue'), // Loads the Contracts component
    meta: { requiresAuth: true },
    // Add alias for better consistency with component name
    alias: '/contracts',
  },
  {
    path: '/contracts/:id',
    name: 'ContractDetails',
    component: () => import('@/views/ContractDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/contracts-pending-approval',
    name: 'ContractsPendingApproval',
    component: () => import('@/views/ContractsPendingApproval.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settlements-pending-approval',
    name: 'SettlementsPendingApproval',
    component: () => import('@/views/SettlementsPendingApproval.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/transfers-pending-approval',
    name: 'EnhancementsPendingApproval',
    component: () => import('@/views/TransfersPendingApproval.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cost-center-transfer/:id',
    name: 'CostCenterTransferRequest',
    component: () => import('@/views/CostCenterTransferRequest.vue'),
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
  history: createWebHistory(import.meta.env.BASE_URL || ''),
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
