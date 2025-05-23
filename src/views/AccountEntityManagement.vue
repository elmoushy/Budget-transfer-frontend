<!-- AccountEntityManagement.vue -->
<template>
  <div class="account-entity-management" :class="{ 'dark-mode': isDarkMode }">
    <h1>{{ isArabic ? 'إدارة الحسابات والكيانات' : 'Account-Entity Management' }}</h1>

    <div class="filter-section">
      <div class="filter-container">
        <label for="cost-center">{{ isArabic ? 'مركز التكلفة:' : 'Cost Center:' }}</label>
        <div class="select-container">
          <select id="cost-center" v-model="selectedCostCenter" @change="fetchLimits(1)">
            <option value="" disabled>
              {{ isArabic ? '-- اختر مركز التكلفة --' : '-- Select Cost Center --' }}
            </option>
            <option v-for="entity in entities" :key="entity.id" :value="entity.entity">
              {{ entity.alias_default }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="selectedCostCenter" class="pagination-info">
        {{
          isArabic
            ? `عرض ${(currentPage - 1) * 10 + 1} - ${Math.min(currentPage * 10, totalItems)} من ${totalItems}`
            : `Showing ${(currentPage - 1) * 10 + 1} - ${Math.min(currentPage * 10, totalItems)} of ${totalItems}`
        }}
      </div>
    </div>

    <div v-if="selectedCostCenter" class="account-limits-container">
      <div v-if="loading" class="loading-indicator">
        {{ isArabic ? 'جاري التحميل...' : 'Loading...' }}
      </div>

      <table v-else class="limits-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>{{ isArabic ? 'رقم الحساب' : 'Account' }}</th>
            <th>{{ isArabic ? 'مسموح للمصدر' : 'Source Allowed' }}</th>
            <th>{{ isArabic ? 'مسموح للهدف' : 'Target Allowed' }}</th>
            <th>{{ isArabic ? 'مسموح للنقل' : 'Transfer Allowed' }}</th>
            <th>{{ isArabic ? 'الإجراءات' : 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="limit in accountLimits" :key="limit.id">
            <td>{{ limit.id }}</td>
            <td>{{ limit.account }}</td>
            <td>{{ translateYesNo(limit.is_transer_allowed_for_source) }}</td>
            <td>{{ translateYesNo(limit.is_transer_allowed_for_target) }}</td>
            <td>{{ translateYesNo(limit.is_transer_allowed) }}</td>
            <td>
              <button @click="editLimit(limit)" class="edit-btn">
                {{ isArabic ? 'تعديل' : 'Edit' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination controls -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1" class="pagination-btn">
          {{ isArabic ? 'السابق' : 'Previous' }}
        </button>

        <div class="page-numbers">
          <button
            v-for="page in visiblePageNumbers"
            :key="page"
            @click="goToPage(page)"
            :class="['page-number', { active: currentPage === page }]"
          >
            {{ page }}
          </button>
        </div>

        <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
          {{ isArabic ? 'التالي' : 'Next' }}
        </button>
      </div>
    </div>

    <div v-if="!selectedCostCenter && !loading" class="no-selection">
      <p>
        {{
          isArabic
            ? 'الرجاء اختيار مركز تكلفة لعرض حدود الحسابات.'
            : 'Please select a cost center to view account limits.'
        }}
      </p>
    </div>

    <!-- Edit Limit Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isArabic ? 'تعديل حدود الحساب' : 'Edit Account Limit' }}</h2>
        <form @submit.prevent="updateLimit">
          <div class="limit-info">
            <div class="info-row">
              <span class="info-label">ID:</span>
              <span class="info-value">{{ editingLimit.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ isArabic ? 'رقم الحساب:' : 'Account:' }}</span>
              <span class="info-value">{{ editingLimit.account }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ isArabic ? 'الكيان:' : 'Entity:' }}</span>
              <span class="info-value">{{ selectedCostCenter }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="source-allowed">{{ isArabic ? 'مسموح للمصدر:' : 'Source Allowed:' }}</label>
            <select id="source-allowed" v-model="editingLimit.is_transer_allowed_for_source">
              <option value="Yes">{{ isArabic ? 'نعم' : 'Yes' }}</option>
              <option value="No">{{ isArabic ? 'لا' : 'No' }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="target-allowed">{{ isArabic ? 'مسموح للهدف:' : 'Target Allowed:' }}</label>
            <select id="target-allowed" v-model="editingLimit.is_transer_allowed_for_target">
              <option value="Yes">{{ isArabic ? 'نعم' : 'Yes' }}</option>
              <option value="No">{{ isArabic ? 'لا' : 'No' }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="transfer-allowed">{{
              isArabic ? 'مسموح للنقل:' : 'Transfer Allowed:'
            }}</label>
            <select id="transfer-allowed" v-model="editingLimit.is_transer_allowed">
              <option value="Yes">{{ isArabic ? 'نعم' : 'Yes' }}</option>
              <option value="No">{{ isArabic ? 'لا' : 'No' }}</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showEditModal = false" class="cancel-btn">
              {{ isArabic ? 'إلغاء' : 'Cancel' }}
            </button>
            <button type="submit" class="submit-btn">
              {{ isArabic ? 'حفظ' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import apiService from '@/services/apiService'

const themeStore = useThemeStore()
const isArabic = computed(() => themeStore.language === 'ar')
const isDarkMode = computed(() => themeStore.darkMode)

// Data
const entities = ref<any[]>([])
const accountLimits = ref<any[]>([])
const selectedCostCenter = ref('')
const loading = ref(false)
const showEditModal = ref(false)
const editingLimit = ref<any>({})

// Pagination
const currentPage = ref(1)
const totalPages = ref(0)
const totalItems = ref(0)

// Using centralized apiService instead of direct API calls

// Fetch entities on component mount
onMounted(async () => {
  await fetchEntities()
})

// Fetch all cost center entities
async function fetchEntities() {
  try {
    loading.value = true
    const response = await apiService.accountEntities.getEntities()
    entities.value = response.data
  } catch (error) {
    console.error('Error fetching entities:', error)
  } finally {
    loading.value = false
  }
}

// Fetch account limits for a specific cost center
async function fetchLimits(page: number = 1) {
  if (!selectedCostCenter.value) return

  try {
    loading.value = true
    const response = await apiService.accountEntities.getAccountLimits(
      selectedCostCenter.value,
      page,
    )

    accountLimits.value = response.results
    totalItems.value = response.count
    totalPages.value = Math.ceil(response.count / 10)
    currentPage.value = page
  } catch (error) {
    console.error('Error fetching account limits:', error)
  } finally {
    loading.value = false
  }
}

// Edit limit
function editLimit(limit: {
  id: number
  account: string
  is_transer_allowed_for_source: string
  is_transer_allowed_for_target: string
  is_transer_allowed: string
  source_count: number
  target_count: number
}) {
  editingLimit.value = { ...limit }
  showEditModal.value = true
}

// Update limit
async function updateLimit() {
  try {
    await apiService.accountEntities.updateAccountLimit(editingLimit.value.id, {
      is_transer_allowed_for_source: editingLimit.value.is_transer_allowed_for_source,
      is_transer_allowed_for_target: editingLimit.value.is_transer_allowed_for_target,
      is_transer_allowed: editingLimit.value.is_transer_allowed,
      account_id: editingLimit.value.account,
      entity_id: selectedCostCenter.value,
      source_count: editingLimit.value.source_count,
      target_count: editingLimit.value.target_count,
    })

    // Close modal and refresh
    showEditModal.value = false
    await fetchLimits(currentPage.value)
  } catch (error) {
    console.error('Error updating account limit:', error)
  }
}

// Pagination helpers
function nextPage() {
  if (currentPage.value < totalPages.value) {
    fetchLimits(currentPage.value + 1)
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    fetchLimits(currentPage.value - 1)
  }
}

function goToPage(page: number) {
  if (page !== currentPage.value) {
    fetchLimits(page)
  }
}

// Computed property for visible page numbers
const visiblePageNumbers = computed(() => {
  const pages = []
  const maxVisiblePages = 5

  if (totalPages.value <= maxVisiblePages) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    let startPage = Math.max(2, currentPage.value - 1)
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1)

    // Adjust if at the beginning or end
    if (currentPage.value <= 2) {
      endPage = Math.min(totalPages.value - 1, maxVisiblePages - 1)
    } else if (currentPage.value >= totalPages.value - 1) {
      startPage = Math.max(2, totalPages.value - maxVisiblePages + 2)
    }

    // Add ellipsis if needed
    if (startPage > 2) {
      pages.push('...')
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add ellipsis if needed
    if (endPage < totalPages.value - 1) {
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages.value)
  }

  return pages
})

// Helper for Yes/No translation
function translateYesNo(value: string): string {
  if (isArabic.value) {
    return value === 'Yes' ? 'نعم' : 'لا'
  }
  return value
}
</script>

<style scoped>
.account-entity-management {
  padding: 2rem;
  max-width: auto;
  margin: 0 auto;
  transition: all 0.3s ease-in-out;
}

h1 {
  color: var(--heading-color, #333);
  margin-bottom: 2rem;
  font-size: 2.2rem;
  font-weight: 600;
  position: relative;
  display: inline-block;
}

h1::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  height: 4px;
  width: 60%;
  background: linear-gradient(90deg, var(--accent-color, #8a2a44) 0%, transparent 100%);
  border-radius: 2px;
}

[dir='rtl'] h1::after {
  left: auto;
  right: 0;
  background: linear-gradient(90deg, transparent 0%, var(--accent-color, #8a2a44) 100%);
}

:root {
  --accent-color: #8a2a44;
  --accent-color-rgb: 138, 42, 68;
  --accent-color-dark: #5a1c2e;
  --heading-color: #333;
  --text-color: #444;
  --text-color-rgb: 68, 68, 68;
  --bg-color: #fff;
  --card-bg: #fff;
  --border-color: rgba(0, 0, 0, 0.05);
  --hover-bg: rgba(138, 42, 68, 0.03);
  --shadow-color: rgba(0, 0, 0, 0.08);
  --btn-text: #fff;
}

.dark-theme {
  --accent-color: #a83353;
  --accent-color-rgb: 168, 51, 83;
  --accent-color-dark: #7a293d;
  --heading-color: #f0f0f0;
  --text-color: #ddd;
  --text-color-rgb: 221, 221, 221;
  --bg-color: #1a1a1a;
  --card-bg: #252525;
  --border-color: rgba(255, 255, 255, 0.07);
  --hover-bg: rgba(168, 51, 83, 0.15);
  --shadow-color: rgba(0, 0, 0, 0.3);
  --btn-text: #fff;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1rem;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-container label {
  font-weight: 600;
  color: var(--text-color);
}

.select-container {
  position: relative;
  width: 250px;
}

.select-container select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  appearance: none;
  background-color: var(--card-bg);
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
}

.select-container select:focus {
  border-color: var(--accent-color);
  outline: none;
}

.select-container::after {
  content: '▼';
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
}

[dir='rtl'] .select-container::after {
  right: auto;
  left: 1rem;
}

.pagination-info {
  color: var(--text-color);
  font-size: 0.9rem;
}

/* Simplified table styles */
.account-limits-container {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  overflow-x: auto;
}

.limits-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  text-align: left;
}

.limits-table th,
.limits-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.limits-table th {
  background-color: rgba(0, 0, 0, 0.03);
  font-weight: 600;
  color: var(--heading-color);
}

.dark-theme .limits-table th {
  background-color: rgba(255, 255, 255, 0.05);
}

.limits-table tr:last-child td {
  border-bottom: none;
}

.limits-table tbody tr:hover td {
  background-color: rgba(0, 0, 0, 0.02);
}

.dark-theme .limits-table tbody tr:hover td {
  background-color: rgba(255, 255, 255, 0.02);
}

.edit-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  background-color: #e0f0ff;
  color: #0078d4;
}

.edit-btn:hover {
  background-color: #cce5ff;
}

.dark-theme .edit-btn {
  background-color: rgba(0, 120, 212, 0.2);
  color: #4db5ff;
}

.dark-theme .edit-btn:hover {
  background-color: rgba(0, 120, 212, 0.3);
}

/* Simplified pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
  gap: 0.5rem;
}

.pagination-btn {
  background-color: #f0f0f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: var(--text-color);
  font-weight: 500;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background-color: #e0e0e0;
}

.dark-theme .pagination-btn {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .pagination-btn:not(:disabled):hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.page-numbers {
  display: flex;
  gap: 0.3rem;
}

.page-number {
  min-width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: var(--text-color);
}

.page-number.active {
  background-color: rgba(var(--accent-color-rgb), 0.15);
  color: var(--accent-color);
  font-weight: 600;
}

.page-number:not(.active):hover {
  background-color: rgba(var(--text-color-rgb), 0.08);
}

.no-selection {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 2rem;
  text-align: center;
  color: var(--text-color);
}

.loading-indicator {
  padding: 2rem;
  text-align: center;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-indicator::before {
  content: '';
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--accent-color);
  border-left-color: var(--accent-color);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--heading-color);
  font-size: 1.5rem;
}

.limit-info {
  background-color: rgba(var(--accent-color-rgb), 0.06);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(var(--accent-color-rgb), 0.1);
}

.info-row {
  display: flex;
  margin-bottom: 0.5rem;
  align-items: center;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  width: 120px;
  color: var(--accent-color);
  opacity: 0.9;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--card-bg);
  color: var(--text-color);
  appearance: none;
}

.form-group select:focus {
  border-color: var(--accent-color);
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

[dir='rtl'] .modal-actions {
  justify-content: flex-start;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: var(--text-color);
}

.submit-btn {
  background-color: var(--accent-color);
  color: white;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.submit-btn:hover {
  background-color: var (--accent-color-dark);
}

.dark-theme .cancel-btn {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .cancel-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

/* Dark mode adjustments */
.dark-mode.account-entity-management {
  background-color: var(--bg-color);
  color: var(--text-color);
}
.dark-mode.account-entity-management h1 {
  color: var(--heading-color);
}
.dark-mode.account-entity-management .limits-table th {
  background-color: rgba(255, 255, 255, 0.05);
}
.dark-mode.account-entity-management .limits-table tbody tr:hover td {
  background-color: rgba(255, 255, 255, 0.02);
}
.dark-mode.account-entity-management .filter-container select,
.dark-mode.account-entity-management .select-container select {
  background-color: var(--card-bg);
  color: var(--text-color);
  border-color: var(--border-color);
}
.dark-mode.account-entity-management .pagination-btn,
.dark-mode.account-entity-management .page-number {
  background-color: var(--card-bg);
  color: var(--text-color);
  border-color: var(--border-color);
}
.dark-mode.account-entity-management .edit-btn,
.dark-mode.account-entity-management .submit-btn,
.dark-mode.account-entity-management .cancel-btn {
  background-color: #444;
  color: #fff;
}

/* RTL adjustments */
[dir='rtl'] .limits-table th,
[dir='rtl'] .limits-table td {
  text-align: right;
}
</style>
