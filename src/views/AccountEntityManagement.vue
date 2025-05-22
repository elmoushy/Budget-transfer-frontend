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
  margin-bottom: 2.5rem;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.2rem 1.5rem;
  box-shadow: 
    0 8px 20px var(--shadow-color),
    0 0 0 1px var(--border-color);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.filter-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-color), transparent);
  opacity: 0.7;
}

[dir='rtl'] .filter-section::before {
  background: linear-gradient(90deg, transparent, var(--accent-color));
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.filter-container label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 1rem;
  letter-spacing: 0.01em;
}

.select-container {
  position: relative;
  width: 300px;
  overflow: hidden;
}

.select-container select {
  width: 100%;
  padding: 0.85rem 1.2rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  appearance: none;
  background-color: var(--card-bg);
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px var(--shadow-color);
}

.select-container select:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 
    0 0 0 3px rgba(var(--accent-color-rgb), 0.15),
    0 2px 8px var(--shadow-color);
}

.select-container::after {
  content: '▼';
  position: absolute;
  right: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
  transition: all 0.3s ease;
}

.select-container:hover::after {
  color: var(--accent-color);
}

[dir='rtl'] .select-container::after {
  right: auto;
  left: 1.2rem;
}

.pagination-info {
  color: var(--text-color);
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  background: rgba(var(--accent-color-rgb), 0.08);
  border-radius: 10px;
  display: inline-block;
  font-weight: 500;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.account-limits-container {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 
    0 8px 30px var(--shadow-color),
    0 0 0 1px var(--border-color);
  overflow: hidden;
  padding-bottom: 1rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
}

.account-limits-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30%;
  height: 3px;
  background: linear-gradient(90deg, 
    transparent, var(--accent-color), transparent);
  opacity: 0.3;
  border-radius: 3px;
}

.limits-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.limits-table th,
.limits-table td {
  padding: 1.2rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.limits-table th {
  background: rgba(var(--accent-color-rgb), 0.08);
  font-weight: 600;
  color: var(--heading-color);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.03em;
}

.limits-table th::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-color), transparent);
  opacity: 0.3;
}

[dir='rtl'] .limits-table th::after {
  background: linear-gradient(90deg, transparent, var(--accent-color));
}

.limits-table tr:last-child td {
  border-bottom: none;
}

.limits-table tr {
  transition: all 0.2s ease;
  position: relative;
}

.limits-table tbody tr:hover td {
  background: var(--hover-bg);
}

.limits-table tbody tr::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent-color);
  opacity: 0;
  transition: opacity 0.2s ease;
}

[dir='rtl'] .limits-table tbody tr::before {
  left: auto;
  right: 0;
}

.limits-table tbody tr:hover::before {
  opacity: 1;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.8rem 0 0.8rem;
  gap: 0.8rem;
}

.pagination-btn {
  background: rgba(var(--text-color-rgb), 0.08);
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--text-color);
  font-weight: 500;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 5px var(--shadow-color);
}

.pagination-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(var(--accent-color-rgb), 0), 
    rgba(var(--accent-color-rgb), 0.1), 
    rgba(var(--accent-color-rgb), 0));
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination-btn:not(:disabled):hover {
  background: rgba(var(--accent-color-rgb), 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px var(--shadow-color);
  color: var(--accent-color);
}

.pagination-btn:not(:disabled):hover::before {
  transform: translateX(100%);
}

.pagination-btn:not(:disabled):active {
  transform: translateY(-1px);
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  min-width: 2.8rem;
  height: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: var(--text-color);
  position: relative;
  overflow: hidden;
}

.page-number.active {
  background: rgba(var(--accent-color-rgb), 0.15);
  color: var(--accent-color);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(var(--accent-color-rgb), 0.2);
}

.page-number:not(.active):hover {
  background: rgba(var(--text-color-rgb), 0.08);
  transform: translateY(-1px);
}

.page-number::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 60%;
  height: 2px;
  background: var(--accent-color);
  transition: transform 0.3s ease;
  border-radius: 2px;
}

.page-number:not(.active):hover::before {
  transform: translateX(-50%) scaleX(1);
}

.edit-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  background: rgba(0, 120, 212, 0.1);
  color: #0078d4;
}

.dark-theme .edit-btn {
  background: rgba(0, 120, 212, 0.2);
  color: #4db5ff;
}

.edit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: currentColor;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  color: white;
}

.edit-btn:hover::before {
  opacity: 1;
  background: #0078d4;
}

.dark-theme .edit-btn:hover::before {
  background: #1890ff;
}

.edit-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.edit-btn > * {
  position: relative;
  z-index: 1;
}

.no-selection {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 
    0 8px 30px var(--shadow-color),
    0 0 0 1px var(--border-color);
  padding: 4rem 3rem;
  text-align: center;
  color: var(--text-color);
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
}

.no-selection::before {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, 
    rgba(var(--accent-color-rgb), 0.05) 0%, 
    transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.8;
}

.no-selection p {
  font-size: 1.1rem;
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.6;
}

.loading-indicator {
  padding: 4rem 3rem;
  text-align: center;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  position: relative;
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px var(--border-color),
    0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: center;
  overflow: hidden;
  position: relative;
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-color), var(--accent-color-dark));
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 2rem;
  color: var(--heading-color);
  font-size: 1.6rem;
  position: relative;
  padding-bottom: 0.8rem;
}

.modal-content h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: var(--accent-color);
  border-radius: 3px;
  opacity: 0.6;
}

[dir='rtl'] .modal-content h2::after {
  left: auto;
  right: 0;
}

.limit-info {
  background: rgba(var(--accent-color-rgb), 0.06);
  padding: 1.2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid rgba(var(--accent-color-rgb), 0.1);
  position: relative;
  overflow: hidden;
}

.limit-info::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, 
    rgba(var(--accent-color-rgb), 0.1) 0%, 
    transparent 70%);
  border-radius: 50%;
}

.info-row {
  display: flex;
  margin-bottom: 0.8rem;
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
  margin-bottom: 1.8rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.7rem;
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.95rem;
  transition: all 0.2s ease;
  opacity: 0.85;
}

.form-group select {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background: var(--card-bg);
  color: var(--text-color);
  box-shadow: 0 2px 5px rgba(0,0,0,0.02) inset;
  appearance: none;
}

.dark-theme .form-group select {
  background: rgba(0,0,0,0.2);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2) inset;
}

.form-group select:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 
    0 0 0 3px rgba(var(--accent-color-rgb), 0.15),
    0 1px 2px rgba(0,0,0,0.05) inset;
}

.form-group::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent-color);
  transition: width 0.3s ease;
}

.form-group:focus-within::after {
  width: 100%;
}

/* Add a custom dropdown arrow */
.form-group::before {
  content: '▼';
  position: absolute;
  right: 1rem;
  bottom: 1.1rem;
  font-size: 0.8rem;
  color: var(--accent-color);
  pointer-events: none;
  opacity: 0.7;
  transition: all 0.2s ease;
}

[dir='rtl'] .form-group::before {
  right: auto;
  left: 1rem;
}

.form-group:focus-within::before {
  transform: translateY(2px);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 2.5rem;
}

[dir='rtl'] .modal-actions {
  justify-content: flex-start;
}

.cancel-btn,
.submit-btn {
  padding: 0.85rem 1.7rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.cancel-btn {
  background: rgba(var(--text-color-rgb), 0.08);
  color: var(--text-color);
}

.dark-theme .cancel-btn {
  background: rgba(255, 255, 255, 0.1);
}

.submit-btn {
  background: linear-gradient(135deg, var(--accent-color), var(--accent-color-dark));
  color: white;
  box-shadow: 
    0 4px 15px rgba(var(--accent-color-rgb), 0.25),
    0 0 0 1px rgba(var(--accent-color-rgb), 0.3);
}

.cancel-btn::before,
.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0), 
    rgba(255,255,255,0.2), 
    rgba(255,255,255,0));
  transform: translateX(-100%);
  transition: transform 0.8s ease;
}

.cancel-btn:hover,
.submit-btn:hover {
  transform: translateY(-3px);
}

.cancel-btn:hover {
  background: rgba(var(--text-color-rgb), 0.12);
}

.dark-theme .cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.submit-btn:hover {
  box-shadow: 
    0 8px 25px rgba(var(--accent-color-rgb), 0.35),
    0 0 0 1px rgba(var(--accent-color-rgb), 0.4);
}

.cancel-btn:hover::before,
.submit-btn:hover::before {
  transform: translateX(100%);
}

.cancel-btn:active,
.submit-btn:active {
  transform: translateY(-1px);
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
