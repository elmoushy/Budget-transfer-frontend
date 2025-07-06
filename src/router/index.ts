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
    component: () => import('@/views/UnifiedTransfers.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/enhancements',
    name: 'Enhancements',
    component: () => import('@/views/UnifiedTransfers.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settlements',
    name: 'Settlements', // This must match the name used in NavigationMenu.vue
    component: () => import('@/views/UnifiedTransfers.vue'), // Now uses the unified component
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
    component: () => import('@/views/UnifiedPendingApproval.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settlements-pending-approval',
    name: 'SettlementsPendingApproval',
    component: () => import('@/views/UnifiedPendingApproval.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/transfers-pending-approval',
    name: 'EnhancementsPendingApproval',
    component: () => import('@/views/UnifiedPendingApproval.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cost-center-transfer/:id',
    name: 'CostCenterTransferRequest',
    component: () => import('@/views/CostCenterTransferRequest.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/notifications',
    name: 'NotificationsPage',
    component: () => import('@/views/NotificationsPage.vue'),
    meta: { requiresAuth: true },
  },
  // Admin routes
  {
    path: '/admin/user-management',
    name: 'UserManagement',
    component: () => import('@/views/UserManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/account-entity-management',
    name: 'AccountEntityManagement',
    component: () => import('@/views/AccountEntityManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/accounts-entity-view',
    name: 'AccountsEntityView',
    component: () => import('@/views/Accounts_Entity_view.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
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
router.beforeEach(async (to, from, next) => {
  try {
    const authStore = useAuthStore()
    const requiresAuth = to.meta.requiresAuth !== false
    const requiresAdmin = to.meta.requiresAdmin === true

    // Check if route requires authentication and user is not authenticated
    if (requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'Login' })
    }
    // Check if route requires admin role and user is not an admin
    else if (requiresAdmin && authStore.user?.role !== 'admin') {
      // Redirect to dashboard if trying to access admin route without admin privileges
      next({ name: 'Dashboard' })
    }
    // If user is authenticated and trying to access login page, redirect to dashboard
    else if (authStore.isAuthenticated && to.name === 'Login') {
      next({ name: 'Dashboard' })
    }
    // Otherwise, allow navigation
    else {
      next()
    }
  } catch (error) {
    console.error('Navigation guard error:', error)
    // Fallback navigation to prevent infinite loops
    if (to.name !== 'Login') {
      next({ name: 'Login' })
    } else {
      next()
    }
  }
})

// Add error handler for router errors
router.onError((error) => {
  console.error('Router error:', error)
})

export default router
