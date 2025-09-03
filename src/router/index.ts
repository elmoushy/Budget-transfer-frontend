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
    path: '/enhancement',
    name: 'Enhancements',
    component: () => import('@/views/UnifiedTransfers.vue'),
    meta: { requiresAuth: true , requiresBudgetPrivilege: true },
  },
  {
    path: '/settlements',
    name: 'Settlements',
    component: () => import('@/views/UnifiedTransfers.vue'),
    meta: { requiresAuth: true },
    alias: '/contracts',
  },
  {
    path: '/contracts/:id',
    name: 'ContractDetails',
    component: () => import('@/views/CostCenterTransferRequest.vue'),
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
    path: '/settlements/:id',
    name: 'SettlementDetails',
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
    path: '/admin/account-Project-management',
    name: 'AccountProjectManagement',
    component: () => import('@/views/AccountEntityManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/accounts-Project-view',
    name: 'AccountsProjectView',
    component: () => import('@/views/Accounts_Entity_view.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  // {
  //   path: '/admin/controller',
  //   name: 'Controller',
  //   component: () => import('@/views/ControllerPage.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true },
  // },
  {
    path: '/admin/user-abilities',
    name: 'UserAbilities',
    component: () => import('@/views/UserAbilities.vue'),
    meta: { requiresAuth: true, requiresSuperAdmin: true },
  },
  {
  path: '/admin/logs',
  name: 'Logs',
  component: () => import('@/views/Logs.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }, // يسمح لـ admin & superadmin
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
    const requiresSuperAdmin = to.meta.requiresSuperAdmin === true

    // --- سياسات الوصول الإضافية ---
    const isBasicUser = authStore.user?.role === 'user' && authStore.userLevel === 1
    const noBudgetPrivilege = authStore.user?.role === 'user' && authStore.userLevel === 1 // أو استخدم !authStore.user?.can_transfer_budget لو هتعتمد على الصلاحية دي

    // أسماء الراوتس الممنوعة على الـ basic user level=1
    const blockedForBasicUser = new Set([
      'EnhancementsPendingApproval',  // /transfers-pending-approval
      'ContractsPendingApproval',     // /contracts-pending-approval
      'SettlementsPendingApproval',   // /settlements-pending-approval
    ])

    // منع التعزيزات لو مفيش صلاحية نقل ميزانية (اختياري حسب سياستك)
    const blockedIfNoBudgetPrivilege = new Set(['Enhancements'])

    // --- حراسة المصادقة والأدوار الافتراضية ---
    if (requiresAuth && !authStore.isAuthenticated) {
      return next({ name: 'Login' })
    } else if (requiresSuperAdmin && authStore.user?.role !== 'superadmin') {
      return next({ name: 'Dashboard' })
    } else if (requiresAdmin && !['admin', 'superadmin'].includes(authStore.user?.role || '')) {
      return next({ name: 'Dashboard' })
    } else if (authStore.isAuthenticated && to.name === 'Login') {
      return next({ name: 'Dashboard' })
    }

    // --- سياسات المنع المخصّصة ---
    // 1) منع صفحات معينة عن الـ basic user
    if (isBasicUser && blockedForBasicUser.has(String(to.name))) {
      return next({ name: 'Dashboard' })
    }

    // // 2) منع صفحة التعزيزات لو مفيش صلاحية نقل ميزانية
    // if (noBudgetPrivilege && blockedIfNoBudgetPrivilege.has(String(to.name))) {
    //   return next({ name: 'Dashboard' })
    // }

    // المرور بشكل طبيعي
    return next()
  } catch (error) {
    console.error('Navigation guard error:', error)
    if (to.name !== 'Login') return next({ name: 'Login' })
    return next()
  }
})

// Add error handler for router errors
router.onError((error) => {
  console.error('Router error:', error)
})

export default router
