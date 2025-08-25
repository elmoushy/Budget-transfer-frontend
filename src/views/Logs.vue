<!-- UserManagement.vue -->
<template>
  <div
    class="unified-page user-management-page"
    :class="{ 'dark-theme': themeStore.darkMode }"
    :dir="isArabic ? 'rtl' : 'ltr'"
  >
    <!-- Background effects -->
    <div class="background-effects">
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
    </div>

    <!-- Page Header -->
  <div class="page-header glass-panel">
  <div class="header-left">
<h1 class="page-title">{{ isArabic ? 'سجلات التدقيق' : 'Audit Logs' }}</h1>
    <p class="page-subtitle">
      {{ isArabic ? 'متابعة الأحداث والعمليات داخل النظام' : 'Monitor system events and activities' }}
    </p>
  </div>
</div>




    <div  class="tab-content">
      <!-- Search and Filters -->
      <div class="search-section glass-panel">
        <div class="search-container">
          <div class="search-input-wrapper">
             <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        :placeholder="isArabic ? 'ابحث في المستخدم/الحقل/البيانات...' : 'Search user/field/data...'"
        @input="handleSearchInput"
        @focus="handleSearchFocus"
        @blur="handleSearchBlur"
      />
            <button v-if="searchQuery" class="clear-search" @click="clearSearch">
              <span>×</span>
            </button>
          </div>
          <div class="search-actions">
          <select v-model="requestFilter" class="filter-select">
        <option value="">{{ isArabic ? 'كل الطلبات' : 'All Requests' }}</option>
        <option value="get">{{ isArabic ? 'قراءة (GET)' : 'Get' }}</option>
        <option value="add">{{ isArabic ? 'إضافة (ADD)' : 'Add' }}</option>
        <option value="update">{{ isArabic ? 'تعديل (UPDATE)' : 'Update' }}</option>
        <option value="delete">{{ isArabic ? 'حذف (DELETE)' : 'Delete' }}</option>
      </select>

         <button class="btn-refresh" @click="refreshData" :disabled="loading">
        <span>{{ isArabic ? 'تحديث' : 'Refresh' }}</span>
        <span v-if="loading" class="loading-spinner"></span>
      </button>

          </div>
        </div>
      </div>

      <!-- Users Table -->
<!-- Logs Table -->
<div class="table-container glass-panel">
  <div v-if="loading" class="loading-state">
    <p class="loading-text">{{ isArabic ? 'جاري التحميل...' : 'Loading...' }}</p>
    <div class="loading-progress"><div class="progress-bar"></div></div>
  </div>

  <div v-else-if="filteredLogs.length === 0" class="empty-state">
    <div class="empty-icon">📜</div>
    <h3>{{ isArabic ? 'لا توجد سجلات' : 'No Logs Found' }}</h3>
    <p>{{ isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results found' }}</p>
  </div>

  <div v-else class="modern-table-wrapper">
    <div class="table-summary">
      <span class="user-count">
        {{
          isArabic
            ? `إجمالي: ${filteredLogs.length} من ${logs.length} سجل`
            : `Total: ${filteredLogs.length} of ${logs.length} logs`
        }}
      </span>
    </div>

    <table class="modern-table">
      <thead>
        <tr class="table-header">
          <th>{{ isArabic ? 'المستخدم' : 'User' }}</th>
          <th>{{ isArabic ? 'الطلب' : 'Request' }}</th>
          <th>{{ isArabic ? 'الحقل' : 'Field' }}</th>
          <th>{{ isArabic ? 'البيانات القديمة' : 'Old Data' }}</th>
          <th>{{ isArabic ? 'البيانات الجديدة' : 'New Data' }}</th>
          <th>{{ isArabic ? 'تاريخ التعديل' : 'Updated At' }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in filteredLogs" :key="log.id" class="table-row">
          <td>{{ log.user }}</td>
          <td>
            <span :class="['req-badge', requestClass(log.request)]">
              {{ requestLabel(log.request) }}
            </span>
          </td>
          <td>{{ log.field }}</td>
          <td>{{ log.oldData }}</td>
          <td>{{ log.newData }}</td>
          <td>{{ formatDate(log.updatedAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'


const themeStore = useThemeStore()
const isArabic = computed(() => themeStore.language === 'ar')
type RequestType = 'get' | 'add' | 'update' | 'delete'

interface LogItem {
  id: number
  user: string
  request: RequestType
  field: string
  oldData: string
  newData: string
  updatedAt: string // ISO string أو "YYYY-MM-DD HH:mm:ss"
}

const loading = ref(true)

// 🔒 داتا استاتك للّوجز
const logs = ref<LogItem[]>([
  // GET summary (admin22)
  { id: 1, user: 'admin22', request: 'get', field: 'summary', oldData: '-', newData: 'fetched full row (transaction_id=342, total_from=1000, total_to=1000, balanced=true)', updatedAt: '2025-08-25 14:00:00' },

  // ADD transfer 402 (Admin1)
  { id: 2, user: 'Admin1', request: 'add', field: 'transfers', oldData: '-', newData: 'row added (transfer_id=402, cc=2000000, from=1000.00 → to=0.00)', updatedAt: '2025-08-25 14:05:00' },

  // ADD transfer 401 (finance head)
  { id: 3, user: 'finance head', request: 'add', field: 'transfers', oldData: '-', newData: 'row added (transfer_id=401, cc=2100000, from=0.00 → to=1000.00)', updatedAt: '2025-08-25 14:06:00' },

  // GET transfer row (user1)
  { id: 4, user: 'user1', request: 'get', field: 'transfers[0]', oldData: '-', newData: 'fetched full row (transfer_id=402)', updatedAt: '2025-08-25 14:10:00' },

  // UPDATE status (planner)
  { id: 5, user: 'planner', request: 'update', field: 'summary.status', oldData: 'draft', newData: 'waiting for approval', updatedAt: '2025-08-25 14:12:00' },

  // UPDATE balanced (finance manager)
  { id: 6, user: 'finance manager', request: 'update', field: 'summary.balanced', oldData: 'false', newData: 'true', updatedAt: '2025-08-25 14:13:00' },

  // GET validation errors (admin3)
  { id: 7, user: 'admin3', request: 'get', field: 'transfers[0].validation_errors', oldData: '-', newData: 'fetched full row (2 items)', updatedAt: '2025-08-25 14:14:00' },

  // DELETE transfer row (admin4)
  { id: 8, user: 'admin4', request: 'delete', field: 'transfers', oldData: 'row deleted (transfer_id=401, cc=2100000)', newData: '-', updatedAt: '2025-08-25 14:20:00' },

  // ADD another transfer row (george - superadmin)
  { id: 9, user: 'george', request: 'add', field: 'transfers', oldData: '-', newData: 'row added (transfer_id=403, cc=2200000, from=500 → to=500)', updatedAt: '2025-08-25 14:22:00' },

  // GET all transfers (unithead)
  { id: 10, user: 'unithead', request: 'get', field: 'transfers', oldData: '-', newData: 'fetched full table (rows=2)', updatedAt: '2025-08-25 14:25:00' },
])


// بحث + فلترة
const searchQuery = ref('')
const requestFilter = ref<RequestType | ''>('')

// ترجمات وعرض البادچ
function requestLabel(req: RequestType) {
  const mapEn: Record<RequestType, string> = { get: 'GET', add: 'ADD', update: 'UPDATE', delete: 'DELETE' }
  const mapAr: Record<RequestType, string> = { get: 'قراءة', add: 'إضافة', update: 'تعديل', delete: 'حذف' }
  return isArabic.value ? mapAr[req] : mapEn[req]
}
function requestClass(req: RequestType) {
  return { get: 'req-get', add: 'req-add', update: 'req-update', delete: 'req-delete' }[req]
}

// فلترة نهائية
const filteredLogs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return logs.value.filter((log) => {
    const matchesRequest = requestFilter.value ? log.request === requestFilter.value : true
    const inText =
      q === '' ||
      log.user.toLowerCase().includes(q) ||
      log.field.toLowerCase().includes(q) ||
      log.oldData.toLowerCase().includes(q) ||
      log.newData.toLowerCase().includes(q) ||
      requestLabel(log.request).toLowerCase().includes(q)
    return matchesRequest && inText
  })
})

onMounted(() => {
  // محاكاة تحميل
  setTimeout(() => (loading.value = false), 600)
})

// Utilities
function clearSearch() {
  searchQuery.value = ''
}
function formatDate(s: string) {
  // لو عايز بنمط موحّد حسب اللغة
  try {
    const d = new Date(s.replace(' ', 'T'))
    return d.toLocaleString(isArabic.value ? 'ar-EG' : 'en-US')
  } catch {
    return s
  }
}

// Events (تقدر تسيبهم كما هم لو بتستعملهم في ستايل/فوكس)
function handleSearchInput() {}
function handleSearchFocus(e: Event) {(e.target as HTMLElement).classList.add('search-focused')}
function handleSearchBlur(e: Event) {(e.target as HTMLElement).classList.remove('search-focused')}

// تحديث (لو عايز ريفريش للداتا الاستاتك)
async function refreshData() {
  loading.value = true
  setTimeout(() => {
    // ممكن تبدّل/تزود عناصر هنا لو حابب
    loading.value = false
  }, 500)
}

</script>

<style scoped>
/* Import shared styles */
@import '@/assets/css/shared-page-styles.css';
/* Request Badges */
.req-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  display: inline-block;
  min-width: 70px;
  text-align: center;
}

/* GET */
.req-get {
  background: rgba(59, 130, 246, 0.12); /* blue */
  color: #2563eb;
}
.dark-theme .req-get {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

/* ADD */
.req-add {
  background: rgba(34, 197, 94, 0.12); /* green */
  color: #166534;
}
.dark-theme .req-add {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

/* UPDATE */
.req-update {
  background: rgba(234, 179, 8, 0.15); /* yellow */
  color: #a16207;
}
.dark-theme .req-update {
  background: rgba(234, 179, 8, 0.25);
  color: #facc15;
}

/* DELETE */
.req-delete {
  background: rgba(239, 68, 68, 0.15); /* red */
  color: #b91c1c;
}
.dark-theme .req-delete {
  background: rgba(239, 68, 68, 0.25);
  color: #f87171;
}

/* Main page styling - unified with UnifiedTransfers */
.unified-page {
  min-height: auto;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f6f8 0%, #fff6fa 50%, #f8f6f8 100%);
  color: #1a1423;
  transition: all 0.3s ease;
  direction: inherit;
}
/* التابلت (شاشات أقل من 1024px) */
@media (max-width: 1024px) {
  .modern-table th,
  .modern-table td {
    min-width: 220px; /* يخلي الأعمدة أوسع شوية للـScroll */
  }
}

/* الموبايل (شاشات أقل من 768px) */
@media (max-width: 768px) {
  .modern-table th,
  .modern-table td {
    min-width: 200px; /* ممكن تقلل الرقم شوية عشان يناسب الموبايل */
  }
}

[dir='rtl'] .unified-page {
  background: linear-gradient(225deg, #f8f6f8 0%, #fff6fa 50%, #f8f6f8 100%);
}

.unified-page.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8e9f0;
}

[dir='rtl'] .unified-page.dark-theme {
  background: linear-gradient(225deg, #18131a 0%, #241726 50%, #18131a 100%);
}

/* Glass panel effect */
.glass-panel {
  background: rgba(255, 246, 250, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(228, 201, 214, 0.4);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

[dir='rtl'] .glass-panel {
  direction: rtl;
}

.glass-panel:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(138, 42, 68, 0.15);
  border-color: rgba(225, 75, 106, 0.3);
}

.dark-theme .glass-panel {
  background: rgba(36, 23, 38, 0.9);
  border-color: rgba(81, 32, 60, 0.4);
  box-shadow: 0 4px 16px rgba(167, 56, 92, 0.15);
}

.dark-theme .glass-panel:hover {
  box-shadow: 0 6px 24px rgba(167, 56, 92, 0.2);
  border-color: rgba(225, 75, 106, 0.4);
}

/* Background effects */
.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(109, 26, 54, 0.05), rgba(138, 42, 68, 0.03));
  animation: float-simple 8s ease-in-out infinite;
}

.orb-1 {
  width: 150px;
  height: 150px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 100px;
  height: 100px;
  top: 60%;
  right: 15%;
  animation-delay: 4s;
}

@keyframes float-simple {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Page header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 2rem;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(138, 42, 68, 0.05) 0%,
    rgba(225, 75, 106, 0.03) 50%,
    rgba(109, 26, 54, 0.05) 100%
  );
  z-index: -1;
}

.page-title {
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #8a2a44 0%, #e14b6a 50%, #6d1a36 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(138, 42, 68, 0.1);
  position: relative;
}
.page-title {
  font-size: clamp(1.6rem, 2vw + 1.2rem, 2.5rem); /* موبايل → ديسكتوب */
  line-height: 1.15;
}
.page-subtitle {
  font-size: clamp(0.95rem, 0.6vw + 0.8rem, 1.1rem);
}
.page-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #e14b6a, transparent);
  opacity: 0.5;
}

.page-subtitle {
  margin: 0.5rem 0 0 0;
  color: #6d1a36a0;
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.8;
}

.dark-theme .page-title {
  color: #f8e9f0;
  text-shadow: 0 0 10px rgba(248, 233, 240, 0.3);
}

.dark-theme .page-subtitle {
  color: #d1c4d9;
}

/* RTL adjustments for page header */
[dir='rtl'] .page-title {
  text-align: right;
}

[dir='rtl'] .page-subtitle {
  text-align: right;
}

[dir='rtl'] .header-left {
  text-align: right;
}

/* Feedback message */
.feedback-message {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.feedback-message.success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(52, 211, 153, 0.05));
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #16a34a;
}

.feedback-message.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tab navigation */
.tabs-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 16px;
  align-items: center;
  /* نخليها مرنة لو العناوين طويلة */
  flex-wrap: wrap;
}
.tab-btn {
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: 2px solid rgba(138, 42, 68, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #8a2a44;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tab-btn:hover {
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.1), rgba(225, 75, 106, 0.05));
  border-color: rgba(138, 42, 68, 0.4);
  transform: translateY(-2px);
}

.tab-btn.active {
  background: linear-gradient(135deg, #8a2a44 0%, #e14b6a 100%);
  color: white;
  border-color: #8a2a44;
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.3);
}

.dark-theme .tab-btn {
  border-color: rgba(225, 75, 106, 0.3);
  color: #e14b6a;
}

.dark-theme .tab-btn:hover {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.15), rgba(138, 42, 68, 0.1));
  border-color: rgba(225, 75, 106, 0.5);
}

.dark-theme .tab-btn.active {
  background: linear-gradient(135deg, #a7385c 0%, #e14b6a 100%);
  color: white;
}

/* Search section */
.search-section {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

[dir='rtl'] .search-input {
  padding: 0.875rem 3rem 0.875rem 1rem;
}

.search-input:focus {
  border-color: #6d1a36;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.1);
  transform: translateY(-1px);
}

.dark-theme .search-input {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e2e2;
}

.dark-theme .search-input:focus {
  border-color: #8a2a44;
  box-shadow: 0 0 0 3px rgba(138, 42, 68, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

[dir='rtl'] .clear-search {
  right: auto;
  left: 0.75rem;
}

.clear-search:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.search-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.filter-select:focus {
  border-color: #6d1a36;
  outline: none;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.1);
}

.btn-refresh,
.btn-primary {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-refresh {
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.1), rgba(225, 75, 106, 0.05));
  color: #8a2a44;
  border: 2px solid rgba(138, 42, 68, 0.3);
}

.btn-refresh:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.15), rgba(225, 75, 106, 0.1));
  border-color: rgba(138, 42, 68, 0.5);
  transform: translateY(-2px);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #8a2a44 0%, #e14b6a 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 6px 24px rgba(138, 42, 68, 0.3);
  background: linear-gradient(135deg, #a7385c 0%, #e14b6a 100%);
}

/* Loading states */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
  position: relative;
  min-height: 300px;
  overflow: hidden;
}

.loading-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.loading-spinner-enhanced {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 1.5rem;
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  animation: spin-simple 2s linear infinite;
}

.ring-1 {
  width: 60px;
  height: 60px;
  border-top: 2px solid #8a2a44;
  border-right: 2px solid #8a2a44;
  animation-duration: 1.5s;
}

.ring-2 {
  width: 40px;
  height: 40px;
  top: 10px;
  left: 10px;
  border-bottom: 2px solid #e14b6a;
  border-left: 2px solid #e14b6a;
  animation-duration: 2s;
  animation-direction: reverse;
}

.loading-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
}

.core-dot {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #8a2a44, #e14b6a);
  border-radius: 50%;
  animation: pulse-simple 1.5s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(138, 42, 68, 0.3);
}

.loading-dots {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
}

.dot {
  width: 6px;
  height: 6px;
  background: #8a2a44;
  border-radius: 50%;
  animation: bounce-simple 1.4s ease-in-out infinite;
}

.dot-1 {
  animation-delay: 0s;
}
.dot-2 {
  animation-delay: 0.2s;
}
.dot-3 {
  animation-delay: 0.4s;
}

.loading-text {
  font-size: 1rem;
  font-weight: 600;
  color: #8a2a44;
  margin-bottom: 1.5rem;
}

.loading-progress {
  width: 150px;
  height: 3px;
  background: rgba(138, 42, 68, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #8a2a44, #e14b6a, #8a2a44);
  background-size: 200% 100%;
  border-radius: 2px;
  animation: progress-simple 2s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(138, 42, 68, 0.3);
}

@keyframes spin-simple {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse-simple {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes bounce-simple {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
}

@keyframes progress-simple {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Dark mode adjustments for loading */
.dark-theme .loading-text {
  color: #e14b6a;
}

.dark-theme .ring-1 {
  border-top-color: #e14b6a;
  border-right-color: #e14b6a;
}

.dark-theme .ring-2 {
  border-bottom-color: #a7385c;
  border-left-color: #a7385c;
}

.dark-theme .core-dot {
  background: linear-gradient(45deg, #e14b6a, #a7385c);
  box-shadow: 0 0 6px rgba(225, 75, 106, 0.3);
}

.dark-theme .dot {
  background: #e14b6a;
}

.dark-theme .loading-progress {
  background: rgba(225, 75, 106, 0.1);
}

.dark-theme .progress-bar {
  background: linear-gradient(90deg, #e14b6a, #a7385c, #e14b6a);
  box-shadow: 0 0 6px rgba(225, 75, 106, 0.3);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Table styles */
.table-container {
  margin-bottom: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.table-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(138, 42, 68, 0.1);
}

.dark-theme .table-summary {
  background: rgba(36, 23, 38, 0.7);
}

.user-count {
  font-size: 0.9rem;
  color: #8a2a44;
  font-weight: 500;
}

.dark-theme .user-count {
  color: #e14b6a;
}

.modern-table-wrapper {
  width: 100%;
  overflow-x: auto;       /* Scroll أفقي */
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch; /* سلاسة على الموبايل */
}

.modern-table {
  min-width: 100%;       /* أو أكبر شوية حسب الأعمدة */
  width: max-content;     /* يخلي الجدول يتمدد */
  border-collapse: collapse;
  background: white;
  font-size: 0.875rem;
}

.dark-theme .modern-table {
  background: #1e1e2e;
}

.table-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.dark-theme .table-header {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
}

.modern-table th {
  padding: 1rem 0.75rem;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
  font-size: 0.875rem;
}

.dark-theme .modern-table th {
  color: #e2e2e2;
  border-bottom-color: #4a5568;
}

.modern-table td {
  padding: 1rem 0.75rem;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.dark-theme .modern-table td {
  border-bottom-color: #374151;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dark-theme .table-row:hover {
  background: #2d3748;
}

/* Action buttons */
.action-buttons-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-btn:hover:not(.disabled) {
  background: #8a2a44;
  color: white;
}

.delete-btn:hover:not(.disabled) {
  background: #ef4444;
  color: white;
}

/* Role badge */
.role-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-admin {
  background: linear-gradient(135deg, #8a2a44, #6d1a36);
  color: white;
  box-shadow: 0 2px 8px rgba(138, 42, 68, 0.3);
}

.status-user {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: white;
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
}

.role-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Enhanced Table Styles for Levels */
.level-name {
  font-weight: 600;
  color: #8a2a44;
  font-size: 0.95rem;
}

.dark-theme .level-name {
  color: #e14b6a;
}

.level-description {
  color: #6b7280;
  font-size: 0.85rem;
  max-width: 200px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark-theme .level-description {
  color: #9ca3af;
}

.order-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #8a2a44, #6d1a36);
  color: white;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  min-width: 40px;
  height: 28px;
  box-shadow: 0 2px 8px rgba(138, 42, 68, 0.2);
}

.dark-theme .order-badge {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
}

.action-btn .btn-text {
  margin-left: 0.5rem;
  font-size: 0.875rem;
}

[dir='rtl'] .action-btn .btn-text {
  margin-left: 0;
  margin-right: 0.5rem;
}

/* Enhanced Assignment Layout */
.assignments-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .assignments-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

/* Assignment Form Card */
.assignment-form-card {
  padding: 2rem;
  border-radius: 16px;
  position: relative;
  background: rgba(255, 246, 250, 0.95);
}

.dark-theme .assignment-form-card {
  background: rgba(36, 23, 38, 0.95);
}

.card-header {
  margin-bottom: 2rem;
  text-align: center;
}

.card-title {
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.5rem;
  font-weight: 700;
}

.card-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
  opacity: 0.8;
}

.dark-theme .card-subtitle {
  color: #9ca3af;
}

/* Enhanced Form Styles */
.assignment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #8a2a44;
  font-weight: 600;
  font-size: 0.95rem;
}

.dark-theme .form-label {
  color: #e14b6a;
}

.form-select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #374151;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.form-select:focus {
  border-color: #8a2a44;
  outline: none;
  box-shadow: 0 0 0 3px rgba(138, 42, 68, 0.1);
  transform: translateY(-1px);
}

.form-select:hover {
  border-color: rgba(138, 42, 68, 0.4);
}

.dark-theme .form-select {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e2e2;
}

.dark-theme .form-select:focus {
  border-color: #e14b6a;
  box-shadow: 0 0 0 3px rgba(225, 75, 106, 0.1);
}

.dark-theme .form-select:hover {
  border-color: rgba(225, 75, 106, 0.4);
}

.assignment-submit-btn {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 1rem;
  position: relative;
  overflow: hidden;
}

.assignment-submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.assignment-submit-btn:hover::before {
  left: 100%;
}

/* Levels Overview Card */
.levels-overview-card {
  padding: 2rem;
  border-radius: 16px;
  background: rgba(255, 246, 250, 0.95);
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dark-theme .levels-overview-card {
  background: rgba(36, 23, 38, 0.95);
}

.levels-overview-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-top: 1rem;
}

[dir='rtl'] .levels-overview-content {
  padding-right: 0;
  padding-left: 0.5rem;
}

/* Custom scrollbar */
.levels-overview-content::-webkit-scrollbar {
  width: 6px;
}

.levels-overview-content::-webkit-scrollbar-track {
  background: rgba(138, 42, 68, 0.1);
  border-radius: 3px;
}

.levels-overview-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  border-radius: 3px;
}

.levels-overview-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #a7385c, #e14b6a);
}

/* Level Overview Items */
.level-overview-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(138, 42, 68, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.level-overview-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
}

[dir='rtl'] .level-overview-item::before {
  left: auto;
  right: 0;
}

.level-overview-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(138, 42, 68, 0.15);
  border-color: rgba(138, 42, 68, 0.2);
}

.dark-theme .level-overview-item {
  background: rgba(30, 30, 46, 0.6);
  border-color: rgba(225, 75, 106, 0.2);
}

.dark-theme .level-overview-item:hover {
  box-shadow: 0 4px 20px rgba(225, 75, 106, 0.2);
  border-color: rgba(225, 75, 106, 0.3);
}

.level-overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.level-title {
  margin: 0;
  color: #8a2a44;
  font-size: 1.1rem;
  font-weight: 700;
}

.dark-theme .level-title {
  color: #e14b6a;
}

.level-order-indicator {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.dark-theme .level-order-indicator {
  color: #9ca3af;
}

.level-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-count-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.1), rgba(225, 75, 106, 0.05));
  border: 1px solid rgba(138, 42, 68, 0.2);
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.2rem;
  color: #8a2a44;
  min-width: 60px;
}

.dark-theme .user-count-badge {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), rgba(138, 42, 68, 0.1));
  border-color: rgba(225, 75, 106, 0.3);
  color: #e14b6a;
}

.count-label {
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Users Grid */
.users-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: white;
  border: 1px solid rgba(138, 42, 68, 0.15);
  border-radius: 20px;
  transition: all 0.2s ease;
  cursor: default;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(138, 42, 68, 0.15);
  border-color: rgba(138, 42, 68, 0.25);
}

.dark-theme .user-chip {
  background: #2d3748;
  border-color: rgba(225, 75, 106, 0.2);
  color: #e2e2e2;
}

.dark-theme .user-chip:hover {
  box-shadow: 0 4px 12px rgba(225, 75, 106, 0.2);
  border-color: rgba(225, 75, 106, 0.3);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.dark-theme .user-name {
  color: #e2e2e2;
}

/* No Users Message */
.no-users-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
  width: 100%;
  border: 2px dashed rgba(138, 42, 68, 0.2);
  border-radius: 12px;
  background: rgba(138, 42, 68, 0.03);
}

.dark-theme .no-users-message {
  color: #9ca3af;
  border-color: rgba(225, 75, 106, 0.2);
  background: rgba(225, 75, 106, 0.05);
}

.no-users-message .empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Empty Levels State */
.empty-levels-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}

.dark-theme .empty-levels-state {
  color: #9ca3af;
}

.empty-levels-state .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-levels-state h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.empty-levels-state p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* RTL Support for Assignment Layout */
[dir='rtl'] .level-overview-header {
  direction: rtl;
}

[dir='rtl'] .level-info {
  text-align: right;
}

[dir='rtl'] .users-grid {
  direction: rtl;
}

[dir='rtl'] .user-chip {
  direction: rtl;
}

[dir='rtl'] .assignment-form {
  direction: rtl;
}

[dir='rtl'] .form-label {
  text-align: right;
}

/* Responsive Design for Assignment Layout */
@media (max-width: 768px) {
  .assignments-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .assignment-form-card,
  .levels-overview-card {
    padding: 1.5rem;
  }

  .level-overview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .users-grid {
    gap: 0.5rem;
  }

  .user-chip {
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }

  .user-avatar {
    width: 20px;
    height: 20px;
    font-size: 0.6rem;
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .level-overview-item,
  .user-chip,
  .form-select,
  .assignment-submit-btn {
    transition: none;
  }

  .assignment-submit-btn::before {
    display: none;
  }
}

/* Modern Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  animation: modalOverlayFadeIn 0.3s ease-out;
}

.modal-container.modern-modal {
  background: transparent;
  border-radius: 20px;
  box-shadow: none;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-backdrop-blur {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 246, 250, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(225, 75, 106, 0.2);
  box-shadow:
    0 25px 50px rgba(138, 42, 68, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.dark-theme .modal-backdrop-blur {
  background: rgba(30, 30, 46, 0.95);
  border-color: rgba(225, 75, 106, 0.3);
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(225, 75, 106, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.modal-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid rgba(225, 75, 106, 0.1);
}

.dark-theme .modal-header {
  border-bottom-color: rgba(225, 75, 106, 0.2);
}

.modal-title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.1), rgba(225, 75, 106, 0.05));
  border: 1px solid rgba(138, 42, 68, 0.2);
  color: #8a2a44;
}

.modal-icon.edit-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
  border-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.modal-icon.danger-icon {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.dark-theme .modal-icon {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), rgba(138, 42, 68, 0.1));
  border-color: rgba(225, 75, 106, 0.3);
  color: #e14b6a;
}

.dark-theme .modal-icon.edit-icon {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.1));
  border-color: rgba(96, 165, 250, 0.3);
  color: #60a5fa;
}

.dark-theme .modal-icon.danger-icon {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.2), rgba(239, 68, 68, 0.1));
  border-color: rgba(248, 113, 113, 0.3);
  color: #f87171;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-theme .modal-title {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(138, 42, 68, 0.05);
  border: 1px solid rgba(138, 42, 68, 0.1);
  color: #8a2a44;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  transform: scale(1.05);
}

.dark-theme .modal-close-btn {
  background: rgba(225, 75, 106, 0.1);
  border-color: rgba(225, 75, 106, 0.2);
  color: #e14b6a;
}

.dark-theme .modal-close-btn:hover {
  background: rgba(248, 113, 113, 0.2);
  border-color: rgba(248, 113, 113, 0.3);
  color: #f87171;
}

/* Modal Body */
.modal-body {
  flex: 1;
  padding: 1rem 2rem;
  overflow-y: auto;
}

/* Modern Form Styles */
.modern-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #8a2a44;
}

.dark-theme .form-label {
  color: #e14b6a;
}

.label-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.7;
}

.input-wrapper,
.select-wrapper,
.textarea-wrapper {
  position: relative;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #374151;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  outline: none;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #8a2a44;
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(138, 42, 68, 0.1);
}

.form-input:focus + .input-focus-border,
.form-select:focus + .select-arrow + .input-focus-border,
.form-textarea:focus + .input-focus-border {
  transform: scaleX(1);
}

.dark-theme .form-input,
.dark-theme .form-select,
.dark-theme .form-textarea {
  background: rgba(45, 55, 72, 0.8);
  border-color: #4a5568;
  color: #e2e2e2;
}

.dark-theme .form-input:focus,
.dark-theme .form-select:focus,
.dark-theme .form-textarea:focus {
  border-color: #e14b6a;
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 4px 20px rgba(225, 75, 106, 0.15);
}

.input-focus-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #8a2a44, #e14b6a);
  border-radius: 1px;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease;
}

.select-wrapper {
  position: relative;
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
  transition: all 0.2s ease;
}

[dir='rtl'] .select-arrow {
  right: auto;
  left: 1rem;
}

.form-select:focus + .select-arrow {
  color: #8a2a44;
}

.dark-theme .select-arrow {
  color: #9ca3af;
}

.dark-theme .form-select:focus + .select-arrow {
  color: #e14b6a;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 2rem 2rem 2rem;
  border-top: 1px solid rgba(225, 75, 106, 0.1);
}

.dark-theme .modal-footer {
  border-top-color: rgba(225, 75, 106, 0.2);
}

/* Modern Button Styles */
.modern-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  min-width: 120px;
}

.btn-secondary.modern-btn {
  background: rgba(138, 42, 68, 0.05);
  border: 2px solid rgba(138, 42, 68, 0.2);
  color: #8a2a44;
}

.btn-secondary.modern-btn:hover {
  background: rgba(138, 42, 68, 0.1);
  border-color: rgba(138, 42, 68, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.15);
}

.btn-primary.modern-btn {
  background: linear-gradient(135deg, #8a2a44 0%, #e14b6a 100%);
  border: 2px solid transparent;
  color: white;
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.25);
}

.btn-primary.modern-btn:hover {
  background: linear-gradient(135deg, #a7385c 0%, #e14b6a 100%);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(138, 42, 68, 0.4);
}

.btn-danger.modern-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 2px solid transparent;
  color: white;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25);
}

.btn-danger.modern-btn:hover {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dark theme button adjustments */
.dark-theme .btn-secondary.modern-btn {
  background: rgba(225, 75, 106, 0.1);
  border-color: rgba(225, 75, 106, 0.3);
  color: #e14b6a;
}

.dark-theme .btn-secondary.modern-btn:hover {
  background: rgba(225, 75, 106, 0.2);
  border-color: rgba(225, 75, 106, 0.4);
  box-shadow: 0 4px 16px rgba(225, 75, 106, 0.2);
}

/* Delete confirmation specific styles */
.delete-modal .modal-content {
  max-width: 450px;
}

.delete-confirmation-content {
  text-align: center;
  padding: 1rem 0;
}

.delete-message {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.delete-warning {
  font-size: 0.9rem;
  color: #ef4444;
  margin: 0;
  opacity: 0.8;
}

.dark-theme .delete-message {
  color: #e2e2e2;
}

.dark-theme .delete-warning {
  color: #f87171;
}

/* RTL Support for Modals */
[dir='rtl'] .modal-header {
  direction: rtl;
}

[dir='rtl'] .modal-footer {
  direction: rtl;
  justify-content: flex-start;
}

[dir='rtl'] .modal-body {
  direction: rtl;
}

[dir='rtl'] .modern-form {
  direction: rtl;
}

[dir='rtl'] .form-label {
  text-align: right;
}

[dir='rtl'] .modal-title-container {
  flex-direction: row-reverse;
}

/* Animation Keyframes */
@keyframes modalOverlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive Design for Modals */
@media (max-width: 768px) {
  .modal-container.modern-modal {
    max-width: 95vw;
    margin: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .modern-btn {
    width: 100%;
    justify-content: center;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .modal-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
