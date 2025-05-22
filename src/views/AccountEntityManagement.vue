<!-- AccountEntityManagement.vue -->
<template>
  <div class="account-entity-management">
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
        {{ isArabic 
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
        <button 
          @click="previousPage" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
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
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          {{ isArabic ? 'التالي' : 'Next' }}
        </button>
      </div>
    </div>
    
    <div v-if="!selectedCostCenter && !loading" class="no-selection">
      <p>{{ isArabic ? 'الرجاء اختيار مركز تكلفة لعرض حدود الحسابات.' : 'Please select a cost center to view account limits.' }}</p>
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
            <label for="transfer-allowed">{{ isArabic ? 'مسموح للنقل:' : 'Transfer Allowed:' }}</label>
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
import axios from 'axios'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const isArabic = computed(() => themeStore.language === 'ar')

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

const BASE_URL = 'http://localhost:8000'

// Fetch entities on component mount
onMounted(async () => {
  await fetchEntities()
})

// Fetch all cost center entities
async function fetchEntities() {
  try {
    loading.value = true
    const response = await axios.get(`${BASE_URL}/api/accounts-entities/entities/`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    entities.value = response.data.data
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
    const response = await axios.get(`${BASE_URL}/api/accounts-entities/account-entity-limit/list`, {
      params: {
        cost_center: selectedCostCenter.value,
        page: page
      },
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    accountLimits.value = response.data.results
    totalItems.value = response.data.count
    totalPages.value = Math.ceil(response.data.count / 10)
    currentPage.value = page
  } catch (error) {
    console.error('Error fetching account limits:', error)
  } finally {
    loading.value = false
  }
}

// Edit limit
function editLimit(limit: any) {
  editingLimit.value = { ...limit }
  showEditModal.value = true
}

// Update limit
async function updateLimit() {
  try {
    await axios.put(`${BASE_URL}/api/accounts-entities/account-entity-limit/update/?pk=${editingLimit.value.id}`, {
      is_transer_allowed_for_source: editingLimit.value.is_transer_allowed_for_source,
      is_transer_allowed_for_target: editingLimit.value.is_transer_allowed_for_target,
      is_transer_allowed: editingLimit.value.is_transer_allowed,
      account_id: editingLimit.value.account,
      entity_id: selectedCostCenter.value,
      source_count: editingLimit.value.source_count,
      target_count: editingLimit.value.target_count
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
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
}

h1 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-container label {
  font-weight: 500;
  color: #555;
}

.select-container {
  position: relative;
  width: 300px;
}

.select-container select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  appearance: none;
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
}

.select-container::after {
  content: '▼';
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 0.8rem;
  color: #666;
}

[dir='rtl'] .select-container::after {
  right: auto;
  left: 1rem;
}

.pagination-info {
  color: #666;
  font-size: 0.9rem;
}

.account-limits-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding-bottom: 1rem;
}

.limits-table {
  width: 100%;
  border-collapse: collapse;
}

.limits-table th,
.limits-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.limits-table th {
  background: rgba(138, 42, 68, 0.05);
  font-weight: 600;
  color: #333;
}

.limits-table tr:last-child td {
  border-bottom: none;
}

.limits-table tr:hover td {
  background: rgba(138, 42, 68, 0.03);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 0 0.5rem;
  gap: 0.5rem;
}

.pagination-btn {
  background: #f0f0f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #555;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background: #e0e0e0;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-number.active {
  background: rgba(138, 42, 68, 0.1);
  color: #8a2a44;
  font-weight: 600;
}

.page-number:not(.active):hover {
  background: #f0f0f0;
}

.edit-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  background: rgba(0, 120, 212, 0.1);
  color: #0078d4;
}

.edit-btn:hover {
  background: rgba(0, 120, 212, 0.2);
}

.no-selection {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 3rem;
  text-align: center;
  color: #666;
  font-style: italic;
}

.loading-indicator {
  padding: 3rem;
  text-align: center;
  color: #666;
  font-style: italic;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.limit-info {
  background: rgba(138, 42, 68, 0.03);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  width: 100px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group select:focus {
  border-color: #8a2a44;
  outline: none;
  box-shadow: 0 0 0 2px rgba(138, 42, 68, 0.2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f0f0f0;
  color: #555;
}

.submit-btn {
  background: linear-gradient(135deg, #8a2a44, #5a1c2e);
  color: white;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #9b3050, #6b2237);
}

/* RTL adjustments */
[dir='rtl'] .limits-table th,
[dir='rtl'] .limits-table td {
  text-align: right;
}

[dir='rtl'] .info-label {
  margin-right: 0;
  margin-left: 1rem;
}

[dir='rtl'] .modal-actions {
  justify-content: flex-start;
}
</style>
