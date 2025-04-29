import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Dashboard', component: () => import('@/views/Dashboard.vue') },
  { path: '/home', name: 'Home', component: () => import('@/views/Home.vue') }, // الصفحة الرئيسية
  { path: '/settlements', name: 'Settlements', component: () => import('@/views/Contracts.vue') }, // التسوية
  {
    path: '/enhancements',
    name: 'Enhancements',
    component: () => import('@/views/Enhancements.vue'),
  }, // التعزيزات
  {
    path: '/contracts-pending-approval',
    name: 'ContractsPendingApproval',
    component: () => import('@/views/ContractsPendingApproval.vue'),
  }, // المناقصات قيد الاعتماد
  {
    path: '/enhancements-pending-approval',
    name: 'EnhancementsPendingApproval',
    component: () => import('@/views/EnhancementsPendingApproval.vue'),
  }, // التعزيزات قيد الاعتماد
  {
    path: '/settlements-pending-approval',
    name: 'SettlementsPendingApproval',
    component: () => import('@/views/SettlementsPendingApproval.vue'),
  }, // التسويات قيد الاعتماد
  {
    path: '/access-control',
    name: 'AccessControl',
    component: () => import('@/views/Dashboard.vue'),
  }, // Access Control
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
