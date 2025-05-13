import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import SettlementsPendingApproval from '@/views/SettlementsPendingApproval.vue'
import EnhancementsPendingApproval from '@/views/EnhancementsPendingApproval.vue'
import ContractsPendingApproval from '@/views/ContractsPendingApproval.vue'
import Dashboard from '@/views/Dashboard.vue'
import Enhancements from '@/views/Enhancements.vue'
import Contracts from '@/views/Contracts.vue'
import CostCenterTransferRequest from '@/views/CostCenterTransferRequest.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/settlements-pending-approval',
    name: 'SettlementsPendingApproval',
    component: SettlementsPendingApproval,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/enhancements-pending-approval',
    name: 'EnhancementsPendingApproval',
    component: EnhancementsPendingApproval,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/contracts-pending-approval',
    name: 'ContractsPendingApproval',
    component: ContractsPendingApproval,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/enhancements',
    name: 'Enhancements',
    component: Enhancements,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/contracts',
    name: 'Contracts',
    component: Contracts,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/cost-center-transfer/:id',
    name: 'CostCenterTransferRequest',
    component: CostCenterTransferRequest,
    meta: {
      requiresAuth: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
