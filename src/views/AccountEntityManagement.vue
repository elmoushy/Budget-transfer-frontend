<!-- AccountEntityManagement.vue -->
<template>
  <div class="account-entity-management" :class="{ 'dark-mode': isDarkMode }">
    <h1>{{ isArabic ? 'إدارة الحسابات والكيانات' : 'Account-Entity Management' }}</h1>

    <div class="filter-section">
      <div class="filter-container">
        <label for="cost-center">{{ isArabic ? 'مركز التكلفة:' : 'Cost Center:' }}</label>
        <div class="select-container">
          <select id="cost-center" v-model="selectedCostCenter" @change="onCostCenterChange">
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
        <div>
          {{
            isArabic
              ? `عرض ${(currentPage - 1) * 10 + 1} - ${Math.min(currentPage * 10, totalItems)} من ${totalItems}`
              : `Showing ${(currentPage - 1) * 10 + 1} - ${Math.min(currentPage * 10, totalItems)} of ${totalItems}`
          }}
        </div>
        <div v-if="searchTerm.trim()" class="search-status">
          {{ searchStatusText }}
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div v-if="selectedCostCenter" class="search-section">
      <div class="search-container">
        <label for="account-search">{{
          isArabic ? 'البحث في الحسابات:' : 'Search Accounts:'
        }}</label>
        <div class="search-input-container">
          <input
            id="account-search"
            v-model="searchTerm"
            type="text"
            :placeholder="
              isArabic ? 'ادخل رقم الحساب للبحث...' : 'Enter account number to search...'
            "
            @input="handleSearch"
          />
          <button v-if="searchTerm" @click="clearSearch" class="clear-search-btn">✕</button>
        </div>
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
            <!-- <div class="info-row">
              <span class="info-label">ID:</span>
              <span class="info-value">{{ editingLimit.id }}</span>
            </div> -->
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
            <button
              type="submit"
              class="submit-btn"
              style="background-color: #4caf50 !important; color: white !important"
            >
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
import apiService from '@/services/apiService'

const themeStore = useThemeStore()
const isArabic = computed(() => themeStore.language === 'ar')
const isDarkMode = computed(() => themeStore.darkMode)

// Data
const entities = ref<any[]>([])
const accountLimits = ref<any[]>([]) // All data from API
const allAccountLimits = ref<any[]>([]) // Store all original data for filtering
const selectedCostCenter = ref('')
const loading = ref(false)
const showEditModal = ref(false)
const editingLimit = ref<any>({})

// Search functionality
const searchTerm = ref('')

// Pagination
const currentPage = ref(1)
const totalPages = ref(0)
const totalItems = ref(0)
const itemsPerPage = 10

// Using centralized apiService instead of direct API calls

// Fetch entities on component mount
onMounted(async () => {
  await fetchEntities()
})

// Handle cost center change
function onCostCenterChange() {
  searchTerm.value = '' // Clear search when changing cost center
  currentPage.value = 1
  fetchAllLimits()
}

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

// Fetch ALL account limits for a specific cost center (no pagination from server)
async function fetchAllLimits() {
  if (!selectedCostCenter.value) return

  try {
    loading.value = true

    // If your API returns paginated data and you need to fetch all pages,
    // you might need to make multiple requests. For now, assuming first call gets all data:
    const response = await apiService.accountEntities.getAccountLimits(
      selectedCostCenter.value,
      1, // Start with page 1
    )

    // Store all original data for client-side filtering
    allAccountLimits.value = response.results

    // Apply search and pagination locally
    applySearchAndPagination()
  } catch (error) {
    console.error('Error fetching account limits:', error)
    // Reset data on error
    allAccountLimits.value = []
    accountLimits.value = []
    totalItems.value = 0
    totalPages.value = 0
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

    // Close modal and refresh data
    showEditModal.value = false
    await fetchAllLimits()
  } catch (error) {
    console.error('Error updating account limit:', error)
  }
}

// Pagination helpers
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    applySearchAndPagination()
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    applySearchAndPagination()
  }
}

function goToPage(page: string | number) {
  const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page
  if (pageNumber !== currentPage.value && pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber
    applySearchAndPagination()
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

// Computed property for search status display
const searchStatusText = computed(() => {
  if (searchTerm.value.trim()) {
    return isArabic.value
      ? `البحث عن: "${searchTerm.value}"`
      : `Searching for: "${searchTerm.value}"`
  }
  return ''
})

// Helper for Yes/No translation
function translateYesNo(value: string): string {
  if (isArabic.value) {
    return value === 'Yes' ? 'نعم' : 'لا'
  }
  return value
}

// Search functionality
function handleSearch() {
  // Reset to first page when searching
  currentPage.value = 1
  applySearchAndPagination()
}

function clearSearch() {
  searchTerm.value = ''
  currentPage.value = 1
  applySearchAndPagination()
}

// Apply client-side search and pagination
function applySearchAndPagination() {
  let filteredData = [...allAccountLimits.value]

  // Apply search filter if search term exists
  if (searchTerm.value.trim()) {
    const searchLower = searchTerm.value.toLowerCase()
    filteredData = filteredData.filter((limit) => limit.account.toLowerCase().includes(searchLower))
  }

  // Update total items and pages based on filtered data
  totalItems.value = filteredData.length
  totalPages.value = Math.ceil(filteredData.length / itemsPerPage)

  // Apply pagination to filtered data
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  accountLimits.value = filteredData.slice(startIndex, endIndex)
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
  font-weight: 700;
  position: relative;
  display: inline-block;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-color-dark));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px var(--glow-color);
  font-family: 'Space Grotesk', sans-serif;
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
  box-shadow: 0 0 10px var(--glow-color);
}

[dir='rtl'] h1::after {
  left: auto;
  right: 0;
  background: linear-gradient(90deg, transparent 0%, var(--accent-color, #8a2a44) 100%);
}

/* Theme Variables - Pink/Rose Gradient Scheme */
:root {
  --accent-color: #8a2a44;
  --accent-color-dark: #6d1a36;
  --accent-color-light: #e14b6a;
  --accent-color-rgb: 138, 42, 68;
  --accent-gradient: linear-gradient(135deg, #8a2a44, #e14b6a);
  --accent-gradient-hover: linear-gradient(135deg, #a7385c, #e14b6a);
  --heading-color: #333;
  --text-color: #444;
  --text-color-rgb: 68, 68, 68;
  --bg-color: #fff;
  --card-bg: #fff;
  --border-color: rgba(0, 0, 0, 0.05);
  --hover-bg: rgba(138, 42, 68, 0.03);
  --shadow-color: rgba(0, 0, 0, 0.08);
  --btn-text: #fff;
  --success-color: #8a2a44;
  --error-color: #ef4444;
  --glow-color: rgba(138, 42, 68, 0.2);
}

.dark-theme {
  --accent-color: #e14b6a;
  --accent-color-dark: #a7385c;
  --accent-color-light: #f472b6;
  --accent-color-rgb: 225, 75, 106;
  --accent-gradient: linear-gradient(135deg, #e14b6a, #a7385c);
  --accent-gradient-hover: linear-gradient(135deg, #f472b6, #e14b6a);
  --heading-color: #f0f0f0;
  --text-color: #ddd;
  --text-color-rgb: 221, 221, 221;
  --bg-color: #0f172a;
  --card-bg: #1e293b;
  --border-color: rgba(255, 255, 255, 0.07);
  --hover-bg: rgba(225, 75, 106, 0.15);
  --shadow-color: rgba(0, 0, 0, 0.3);
  --btn-text: #fff;
  --success-color: #e14b6a;
  --error-color: #f87171;
  --glow-color: rgba(225, 75, 106, 0.3);
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background: rgba(255, 246, 250, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(138, 42, 68, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow:
    0 8px 25px var(--shadow-color),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.filter-section::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0.5;
}

.filter-section:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 35px var(--shadow-color),
    0 0 20px var(--glow-color);
}

.dark-mode .filter-section {
  background: rgba(30, 30, 46, 0.9);
  border: 1px solid rgba(225, 75, 106, 0.2);
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
  border: 2px solid var(--border-color);
  border-radius: 8px;
  appearance: none;
  background-color: var(--card-bg);
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.select-container select:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow:
    0 0 0 3px var(--glow-color),
    0 4px 12px rgba(138, 42, 68, 0.15);
  transform: translateY(-1px);
  background: linear-gradient(135deg, var(--card-bg), rgba(138, 42, 68, 0.02));
}

.select-container select:hover {
  border-color: rgba(138, 42, 68, 0.5);
  background: linear-gradient(135deg, var(--card-bg), rgba(138, 42, 68, 0.02));
  transform: translateY(-1px);
}

.dark-mode .select-container select:focus {
  background: linear-gradient(135deg, var(--card-bg), rgba(225, 75, 106, 0.03));
  box-shadow:
    0 0 0 3px var(--glow-color),
    0 4px 12px rgba(225, 75, 106, 0.2);
}

.dark-mode .select-container select:hover {
  background: linear-gradient(135deg, var(--card-bg), rgba(225, 75, 106, 0.03));
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-status {
  font-style: italic;
  color: var(--accent-color);
  font-weight: 500;
}

/* Search Section Styles */
.search-section {
  margin-bottom: 1.5rem;
  background: rgba(255, 246, 250, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(138, 42, 68, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow:
    0 8px 25px var(--shadow-color),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.search-section::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0.5;
}

.search-section:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 35px var(--shadow-color),
    0 0 20px var(--glow-color);
}

.dark-mode .search-section {
  background: rgba(30, 30, 46, 0.9);
  border: 1px solid rgba(225, 75, 106, 0.2);
}

.search-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-container label {
  font-weight: 600;
  color: var(--text-color);
  min-width: fit-content;
}

.search-input-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input-container input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--card-bg);
  color: var(--text-color);
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

[dir='rtl'] .search-input-container input {
  padding-left: 2.5rem;
  padding-right: 1rem;
}

.search-input-container input:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow:
    0 0 0 3px var(--glow-color),
    0 4px 12px rgba(138, 42, 68, 0.15);
  transform: translateY(-1px);
  background: linear-gradient(135deg, var(--card-bg), rgba(138, 42, 68, 0.02));
}

.search-input-container input:hover {
  border-color: rgba(138, 42, 68, 0.5);
  background: linear-gradient(135deg, var(--card-bg), rgba(138, 42, 68, 0.02));
  transform: translateY(-1px);
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: all 0.3s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

[dir='rtl'] .clear-search-btn {
  right: auto;
  left: 0.75rem;
}

.clear-search-btn:hover {
  opacity: 1;
  background: rgba(138, 42, 68, 0.1);
  color: var(--accent-color);
}

.dark-mode .search-input-container input:focus {
  background: linear-gradient(135deg, var(--card-bg), rgba(225, 75, 106, 0.03));
  box-shadow:
    0 0 0 3px var(--glow-color),
    0 4px 12px rgba(225, 75, 106, 0.2);
}

.dark-mode .search-input-container input:hover {
  background: linear-gradient(135deg, var(--card-bg), rgba(225, 75, 106, 0.03));
}

.dark-mode .clear-search-btn:hover {
  background: rgba(225, 75, 106, 0.15);
  color: var(--accent-color);
}

/* Enhanced table container */
.account-limits-container {
  background: rgba(255, 246, 250, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(138, 42, 68, 0.1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 8px 25px var(--shadow-color),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
}

.account-limits-container::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0.3;
  z-index: 0;
}

.account-limits-container:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 35px var(--shadow-color),
    0 0 20px var(--glow-color);
}

.dark-mode .account-limits-container {
  background: rgba(30, 30, 46, 0.9);
  border: 1px solid rgba(225, 75, 106, 0.2);
}

.limits-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  text-align: left;
  position: relative;
  z-index: 1;
}

.limits-table th,
.limits-table td {
  padding: 1rem 1.2rem;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.limits-table th {
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.05), rgba(109, 26, 54, 0.05));
  font-weight: 700;
  color: var(--heading-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
  position: relative;
}

.limits-table th::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  opacity: 0.3;
}

.dark-mode .limits-table th {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.1), rgba(167, 56, 92, 0.1));
}

.limits-table tr:last-child td {
  border-bottom: none;
}

.limits-table tbody tr:hover td {
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.03), rgba(109, 26, 54, 0.03));
  box-shadow: inset 0 0 0 1px rgba(138, 42, 68, 0.1);
  transition: all 0.3s ease;
}

.dark-mode .limits-table tbody tr:hover td {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.05), rgba(167, 56, 92, 0.05));
  box-shadow: inset 0 0 0 1px rgba(225, 75, 106, 0.15);
}

.edit-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 70px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #8a2a44, #6d1a36);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.edit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  transition: left 0.5s ease;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
  transform: translateY(-1px);
  box-shadow:
    0 4px 12px rgba(138, 42, 68, 0.3),
    0 0 0 1px rgba(138, 42, 68, 0.2);
}

.edit-btn:hover::before {
  left: 100%;
}

.edit-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.dark-mode .edit-btn {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-mode .edit-btn:hover {
  background: linear-gradient(135deg, #f472b6, #e14b6a);
  box-shadow:
    0 4px 12px rgba(225, 75, 106, 0.4),
    0 0 0 1px rgba(225, 75, 106, 0.3);
}

/* Enhanced pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 0;
  gap: 0.75rem;
}

.pagination-btn {
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.1), rgba(109, 26, 54, 0.1));
  border: 2px solid var(--accent-color);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--accent-color);
  font-weight: 600;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.pagination-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(138, 42, 68, 0.1) 50%, transparent 100%);
  transition: left 0.6s ease;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.2);
  color: rgba(0, 0, 0, 0.4);
}

.pagination-btn:not(:disabled):hover {
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.15), rgba(109, 26, 54, 0.15));
  border-color: var(--accent-color-dark);
  color: var(--accent-color-dark);
  transform: translateY(-1px);
  box-shadow:
    0 4px 12px rgba(138, 42, 68, 0.2),
    0 0 0 1px rgba(138, 42, 68, 0.1);
}

.pagination-btn:not(:disabled):hover::before {
  left: 100%;
}

.dark-mode .pagination-btn {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.1), rgba(167, 56, 92, 0.1));
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.dark-mode .pagination-btn:not(:disabled):hover {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), rgba(167, 56, 92, 0.2));
  border-color: var(--accent-color-light);
  color: var(--accent-color-light);
}

.dark-mode .pagination-btn:disabled {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--text-color);
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.page-number::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(138, 42, 68, 0.1) 50%, transparent 100%);
  transition: left 0.5s ease;
}

.page-number.active {
  background: var(--accent-gradient);
  color: rgb(0, 0, 0);
  border-color: var(--accent-color);
  box-shadow:
    0 4px 12px rgba(138, 42, 68, 0.3),
    0 0 0 1px rgba(138, 42, 68, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.page-number:not(.active):hover {
  /* a solid coral‑pink background */
  background: #e14b6a;
  /* matching darker border */
  border-color: #8a2a44;
  /* always show white text */
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(138, 42, 68, 0.3);
}

.page-number.active:hover {
  /* a slightly darker pink so it still stands out */
  background: #a7385c;
  color: #fff;
}

.page-number:not(.active):hover::before {
  left: 100%;
}

.dark-mode .page-number.active {
  background: var(--accent-gradient);
  box-shadow:
    0 4px 12px rgba(225, 75, 106, 0.4),
    0 0 0 1px rgba(225, 75, 106, 0.3);
}

.dark-mode .page-number:not(.active):hover {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.1), rgba(167, 56, 92, 0.1));
  border-color: rgba(225, 75, 106, 0.4);
  color: var(--accent-color);
}

.no-selection {
  background: linear-gradient(135deg, rgba(255, 246, 250, 0.9), rgba(138, 42, 68, 0.02));
  border: 2px solid rgba(138, 42, 68, 0.1);
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--text-color);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow:
    0 8px 25px var(--shadow-color),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-size: 1.1rem;
  font-weight: 500;
}

.no-selection::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0.3;
}

.no-selection::after {
  content: '';
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(138, 42, 68, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.dark-mode .no-selection {
  background: linear-gradient(135deg, rgba(30, 30, 46, 0.9), rgba(225, 75, 106, 0.03));
  border: 2px solid rgba(225, 75, 106, 0.2);
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 0 20px var(--glow-color);
}

.loading-indicator {
  padding: 3rem;
  text-align: center;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  font-weight: 500;
}

.loading-indicator::before {
  content: '';
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 4px solid transparent;
  border-top: 4px solid var(--accent-color);
  border-right: 4px solid var(--accent-color);
  animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  box-shadow:
    0 0 20px var(--glow-color),
    inset 0 0 20px rgba(138, 42, 68, 0.1);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
    box-shadow: 0 0 5px var(--glow-color);
  }
  50% {
    box-shadow: 0 0 25px var(--glow-color);
  }
  100% {
    transform: rotate(360deg);
    box-shadow: 0 0 5px var(--glow-color);
  }
}

.dark-mode .loading-indicator::before {
  border-top-color: var(--accent-color);
  border-right-color: var(--accent-color);
  box-shadow:
    0 0 25px var(--glow-color),
    inset 0 0 25px rgba(225, 75, 106, 0.15);
}

/* Enhanced modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(138, 42, 68, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: rgba(255, 246, 250, 0.9);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(138, 42, 68, 0.2);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2),
    0 0 20px var(--glow-color);
  animation: scaleIn 0.3s ease;
  position: relative;
  overflow: hidden;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-color-dark));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px var(--glow-color);
  font-weight: 700;
  font-size: 1.5rem;
}

.dark-mode .modal-content {
  background: rgba(30, 30, 46, 0.95);
  border: 1px solid rgba(225, 75, 106, 0.3);
}

.limit-info {
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.08), rgba(109, 26, 54, 0.05));
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(138, 42, 68, 0.15);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  box-shadow:
    0 4px 12px rgba(138, 42, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.limit-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-gradient);
  border-radius: 12px 12px 0 0;
}

.dark-mode .limit-info {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.1), rgba(167, 56, 92, 0.08));
  border: 1px solid rgba(225, 75, 106, 0.2);
  box-shadow:
    0 4px 12px rgba(225, 75, 106, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
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
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.95rem;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-color-dark));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px var(--glow-color);
}

.form-group select {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-color);
  appearance: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.form-group select:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow:
    0 0 0 3px var(--glow-color),
    0 4px 12px rgba(138, 42, 68, 0.15);
  transform: translateY(-1px);
  background: linear-gradient(135deg, var(--card-bg), rgba(138, 42, 68, 0.02));
}

.form-group select:hover {
  border-color: rgba(138, 42, 68, 0.5);
  background: linear-gradient(135deg, var(--card-bg), rgba(138, 42, 68, 0.02));
  transform: translateY(-1px);
}

.dark-mode .form-group select:focus {
  background: linear-gradient(135deg, var(--card-bg), rgba(225, 75, 106, 0.03));
  box-shadow:
    0 0 0 3px var(--glow-color),
    0 4px 12px rgba(225, 75, 106, 0.2);
}

.dark-mode .form-group select:hover {
  background: linear-gradient(135deg, var(--card-bg), rgba(225, 75, 106, 0.03));
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
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 120px;
  text-align: center;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.cancel-btn::before,
.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  transition: left 0.5s ease;
}

.cancel-btn {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1));
  color: var(--text-color);
  border: 2px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  background: var(--accent-gradient);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  box-shadow:
    0 4px 12px rgba(138, 42, 68, 0.3),
    0 0 0 1px rgba(138, 42, 68, 0.2);
}

.cancel-btn:hover {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.12));
  border-color: rgba(138, 42, 68, 0.3);
  color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.submit-btn:hover {
  background: var(--accent-gradient-hover);
  transform: translateY(-1px);
  box-shadow:
    0 6px 16px rgba(138, 42, 68, 0.4),
    0 0 0 1px rgba(138, 42, 68, 0.3);
}

.cancel-btn:hover::before,
.submit-btn:hover::before {
  left: 100%;
}

.cancel-btn:active,
.submit-btn:active {
  transform: translateY(0);
}

.dark-mode .cancel-btn {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.12));
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-mode .cancel-btn:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.16));
  border-color: rgba(225, 75, 106, 0.4);
  color: var(--accent-color);
}

.dark-mode .submit-btn {
  background: var(--accent-gradient);
  box-shadow:
    0 4px 12px rgba(225, 75, 106, 0.4),
    0 0 0 1px rgba(225, 75, 106, 0.3);
}

.dark-mode .submit-btn:hover {
  background: var(--accent-gradient-hover);
  box-shadow:
    0 6px 16px rgba(225, 75, 106, 0.5),
    0 0 0 1px rgba(225, 75, 106, 0.4);
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
