<!-- ControllerPage.vue -->
<template>
  <div
    class="unified-page controller-page"
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
        <h1 class="page-title">{{ isArabic ? 'لوحة التحكم' : 'Controller' }}</h1>
        <p class="page-subtitle">
          {{ isArabic ? 'إدارة العملات والمسارات' : 'Manage Currencies and Routes' }}
        </p>
      </div>
    </div>

    <!-- Feedback Message -->
    <div
      v-if="feedbackMessage"
      class="feedback-message glass-panel"
      :class="isSuccess ? 'success' : 'error'"
    >
      {{ feedbackMessage }}
    </div>

    <!-- Tab Navigation -->
    <div class="tabs-container glass-panel">
      <button
        :class="['tab-btn', { active: activeTab === 'currencies' }]"
        @click="activeTab = 'currencies'"
      >
        <i class="fas fa-coins"></i>
        {{ isArabic ? 'العملات' : 'Currencies' }}
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'routes' }]"
        @click="activeTab = 'routes'"
      >
        <i class="fas fa-route"></i>
        {{ isArabic ? 'المسارات' : 'Routes' }}
      </button>
    </div>

    <!-- Currencies Management Tab -->
    <div v-if="activeTab === 'currencies'" class="tab-content">
      <!-- Add Currency Section -->
      <div class="add-section glass-panel">
        <h3 class="section-title">
          <i class="fas fa-plus-circle"></i>
          {{ isArabic ? 'إضافة عملة جديدة' : 'Add New Currency' }}
        </h3>
        <form @submit.prevent="addCurrency" class="add-form">
          <div class="form-group">
            <label for="currency-name">{{ isArabic ? 'اسم العملة' : 'Currency Name' }}</label>
            <input
              id="currency-name"
              v-model="newCurrency.name"
              type="text"
              class="form-input"
              :placeholder="isArabic ? 'مثال: USD' : 'e.g., USD'"
              required
            />
          </div>
          <div class="form-group">
            <label for="currency-icon">{{ isArabic ? 'أيقونة العملة' : 'Currency Icon' }}</label>
            <input
              id="currency-icon"
              v-model="newCurrency.icon"
              type="text"
              class="form-input"
              :placeholder="isArabic ? 'مثال: fa-dollar-sign' : 'e.g., fa-dollar-sign'"
              required
            />
          </div>
          <button type="submit" class="btn-primary" :disabled="loadingCurrencies">
            <i class="fas fa-plus"></i>
            {{ isArabic ? 'إضافة' : 'Add' }}
          </button>
        </form>
      </div>

      <!-- Currencies List -->
      <div class="list-section glass-panel">
        <div class="section-header">
          <h3 class="section-title">
            <i class="fas fa-list"></i>
            {{ isArabic ? 'العملات المتاحة' : 'Available Currencies' }}
          </h3>
          <button class="btn-refresh" @click="loadCurrencies" :disabled="loadingCurrencies">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingCurrencies }"></i>
            {{ isArabic ? 'تحديث' : 'Refresh' }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loadingCurrencies" class="loading-state">
          <div class="loading-container">
            <div class="loading-spinner-enhanced">
              <div class="spinner-ring ring-1"></div>
              <div class="spinner-ring ring-2"></div>
              <div class="spinner-ring ring-3"></div>
            </div>
            <p class="loading-text">{{ isArabic ? 'جاري التحميل...' : 'Loading...' }}</p>
          </div>
        </div>

        <!-- Currencies Grid -->
        <div v-else-if="currencies.length > 0" class="items-grid">
          <div v-for="currency in currencies" :key="currency.id" class="item-card">
            <div class="item-header">
              <div class="item-icon">
                <i :class="currency.icon || 'fas fa-coins'"></i>
              </div>
              <div class="item-info">
                <h4 class="item-name">{{ currency.name }}</h4>
                <p class="item-meta">ID: {{ currency.id }}</p>
              </div>
            </div>
            <div class="item-actions">
              <button
                class="btn-edit"
                @click="editCurrency(currency)"
                :title="isArabic ? 'تعديل' : 'Edit'"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn-delete"
                @click="deleteCurrency(currency.id)"
                :title="isArabic ? 'حذف' : 'Delete'"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <i class="fas fa-coins"></i>
          <p>{{ isArabic ? 'لا توجد عملات متاحة' : 'No currencies available' }}</p>
        </div>
      </div>
    </div>

    <!-- Routes Management Tab -->
    <div v-if="activeTab === 'routes'" class="tab-content">
      <!-- Add Route Section -->
      <div class="add-section glass-panel">
        <h3 class="section-title">
          <i class="fas fa-plus-circle"></i>
          {{ isArabic ? 'إضافة مسار جديد' : 'Add New Route' }}
        </h3>
        <form @submit.prevent="addRoute" class="add-form">
          <div class="form-group">
            <label for="route-english">{{ isArabic ? 'الاسم بالإنجليزية' : 'English Name' }}</label>
            <input
              id="route-english"
              v-model="newRoute.english_name"
              type="text"
              class="form-input"
              :placeholder="
                isArabic ? 'مثال: Budget Transfer Route' : 'e.g., Budget Transfer Route'
              "
              required
            />
          </div>
          <div class="form-group">
            <label for="route-arabic">{{ isArabic ? 'الاسم بالعربية' : 'Arabic Name' }}</label>
            <input
              id="route-arabic"
              v-model="newRoute.arabic_name"
              type="text"
              class="form-input"
              :placeholder="isArabic ? 'مثال: مسار تحويل الميزانية' : 'e.g., مسار تحويل الميزانية'"
              required
            />
          </div>
          <button type="submit" class="btn-primary" :disabled="loadingRoutes">
            <i class="fas fa-plus"></i>
            {{ isArabic ? 'إضافة' : 'Add' }}
          </button>
        </form>
      </div>

      <!-- Routes List -->
      <div class="list-section glass-panel">
        <div class="section-header">
          <h3 class="section-title">
            <i class="fas fa-list"></i>
            {{ isArabic ? 'المسارات المتاحة' : 'Available Routes' }}
          </h3>
          <button class="btn-refresh" @click="loadRoutes" :disabled="loadingRoutes">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingRoutes }"></i>
            {{ isArabic ? 'تحديث' : 'Refresh' }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loadingRoutes" class="loading-state">
          <div class="loading-container">
            <div class="loading-spinner-enhanced">
              <div class="spinner-ring ring-1"></div>
              <div class="spinner-ring ring-2"></div>
              <div class="spinner-ring ring-3"></div>
            </div>
            <p class="loading-text">{{ isArabic ? 'جاري التحميل...' : 'Loading...' }}</p>
          </div>
        </div>

        <!-- Routes Grid -->
        <div v-else-if="routes.length > 0" class="items-grid">
          <div v-for="route in routes" :key="route.id" class="item-card route-card">
            <div class="item-header">
              <div class="item-icon">
                <i class="fas fa-route"></i>
              </div>
              <div class="item-info">
                <h4 class="item-name">{{ isArabic ? route.arabic_name : route.english_name }}</h4>
                <p class="item-meta">
                  {{ isArabic ? route.english_name : route.arabic_name }}
                </p>
                <p class="item-id">ID: {{ route.id }}</p>
              </div>
            </div>
            <div class="item-actions">
              <button
                class="btn-edit"
                @click="editRoute(route)"
                :title="isArabic ? 'تعديل' : 'Edit'"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn-delete"
                @click="deleteRoute(route.id)"
                :title="isArabic ? 'حذف' : 'Delete'"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <i class="fas fa-route"></i>
          <p>{{ isArabic ? 'لا توجد مسارات متاحة' : 'No routes available' }}</p>
        </div>
      </div>
    </div>

    <!-- Edit Currency Modal -->
    <div v-if="showEditCurrencyModal" class="modal-overlay" @click="closeEditCurrencyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isArabic ? 'تعديل العملة' : 'Edit Currency' }}</h3>
          <button class="modal-close" @click="closeEditCurrencyModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="updateCurrency" class="modal-form">
          <div class="form-group">
            <label>{{ isArabic ? 'اسم العملة' : 'Currency Name' }}</label>
            <input v-model="editingCurrency.name" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label>{{ isArabic ? 'أيقونة العملة' : 'Currency Icon' }}</label>
            <input v-model="editingCurrency.icon" type="text" class="form-input" required />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeEditCurrencyModal">
              {{ isArabic ? 'إلغاء' : 'Cancel' }}
            </button>
            <button type="submit" class="btn-primary">
              {{ isArabic ? 'حفظ' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Route Modal -->
    <div v-if="showEditRouteModal" class="modal-overlay" @click="closeEditRouteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isArabic ? 'تعديل المسار' : 'Edit Route' }}</h3>
          <button class="modal-close" @click="closeEditRouteModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="updateRoute" class="modal-form">
          <div class="form-group">
            <label>{{ isArabic ? 'الاسم بالإنجليزية' : 'English Name' }}</label>
            <input v-model="editingRoute.english_name" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label>{{ isArabic ? 'الاسم بالعربية' : 'Arabic Name' }}</label>
            <input v-model="editingRoute.arabic_name" type="text" class="form-input" required />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeEditRouteModal">
              {{ isArabic ? 'إلغاء' : 'Cancel' }}
            </button>
            <button type="submit" class="btn-primary">
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
import controllerService, {
  type Currency,
  type Route,
  type CreateCurrencyData,
  type CreateRouteData,
} from '@/services/controllerService'

// Stores
const themeStore = useThemeStore()

// Computed properties
const isArabic = computed(() => themeStore.language === 'ar')

// State
const activeTab = ref('currencies')
const feedbackMessage = ref('')
const isSuccess = ref(false)

// Currencies
const currencies = ref<Currency[]>([])
const loadingCurrencies = ref(false)
const newCurrency = ref<CreateCurrencyData>({
  name: '',
  icon: '',
})
const editingCurrency = ref<Partial<Currency>>({})
const showEditCurrencyModal = ref(false)

// Routes
const routes = ref<Route[]>([])
const loadingRoutes = ref(false)
const newRoute = ref<CreateRouteData>({
  english_name: '',
  arabic_name: '',
})
const editingRoute = ref<Partial<Route>>({})
const showEditRouteModal = ref(false)

// Methods
const showFeedback = (message: string, success = true) => {
  feedbackMessage.value = message
  isSuccess.value = success
  setTimeout(() => {
    feedbackMessage.value = ''
  }, 5000)
}

// Currency methods
const loadCurrencies = async () => {
  loadingCurrencies.value = true
  try {
    currencies.value = await controllerService.listCurrencies()
  } catch (error) {
    console.error('Error loading currencies:', error)
    showFeedback(isArabic.value ? 'فشل في تحميل العملات' : 'Failed to load currencies', false)
  } finally {
    loadingCurrencies.value = false
  }
}

const addCurrency = async () => {
  try {
    await controllerService.createCurrency(newCurrency.value)
    showFeedback(isArabic.value ? 'تم إضافة العملة بنجاح' : 'Currency added successfully')
    newCurrency.value = { name: '', icon: '' }
    loadCurrencies()
  } catch (error) {
    console.error('Error adding currency:', error)
    showFeedback(isArabic.value ? 'فشل في إضافة العملة' : 'Failed to add currency', false)
  }
}

const editCurrency = (currency: Currency) => {
  editingCurrency.value = { ...currency }
  showEditCurrencyModal.value = true
}

const updateCurrency = async () => {
  try {
    if (editingCurrency.value.id) {
      await controllerService.updateCurrency(editingCurrency.value.id, editingCurrency.value)
      showFeedback(isArabic.value ? 'تم تحديث العملة بنجاح' : 'Currency updated successfully')
      closeEditCurrencyModal()
      loadCurrencies()
    }
  } catch (error) {
    console.error('Error updating currency:', error)
    showFeedback(isArabic.value ? 'فشل في تحديث العملة' : 'Failed to update currency', false)
  }
}

const deleteCurrency = async (id: number) => {
  if (
    confirm(
      isArabic.value
        ? 'هل أنت متأكد من حذف هذه العملة؟'
        : 'Are you sure you want to delete this currency?',
    )
  ) {
    try {
      await controllerService.deleteCurrency(id)
      showFeedback(isArabic.value ? 'تم حذف العملة بنجاح' : 'Currency deleted successfully')
      loadCurrencies()
    } catch (error) {
      console.error('Error deleting currency:', error)
      showFeedback(isArabic.value ? 'فشل في حذف العملة' : 'Failed to delete currency', false)
    }
  }
}

const closeEditCurrencyModal = () => {
  showEditCurrencyModal.value = false
  editingCurrency.value = {}
}

// Route methods
const loadRoutes = async () => {
  loadingRoutes.value = true
  try {
    routes.value = await controllerService.listRoutes()
  } catch (error) {
    console.error('Error loading routes:', error)
    showFeedback(isArabic.value ? 'فشل في تحميل المسارات' : 'Failed to load routes', false)
  } finally {
    loadingRoutes.value = false
  }
}

const addRoute = async () => {
  try {
    await controllerService.createRoute(newRoute.value)
    showFeedback(isArabic.value ? 'تم إضافة المسار بنجاح' : 'Route added successfully')
    newRoute.value = { english_name: '', arabic_name: '' }
    loadRoutes()
  } catch (error) {
    console.error('Error adding route:', error)
    showFeedback(isArabic.value ? 'فشل في إضافة المسار' : 'Failed to add route', false)
  }
}

const editRoute = (route: Route) => {
  editingRoute.value = { ...route }
  showEditRouteModal.value = true
}

const updateRoute = async () => {
  try {
    if (editingRoute.value.id) {
      await controllerService.updateRoute(editingRoute.value.id, editingRoute.value)
      showFeedback(isArabic.value ? 'تم تحديث المسار بنجاح' : 'Route updated successfully')
      closeEditRouteModal()
      loadRoutes()
    }
  } catch (error) {
    console.error('Error updating route:', error)
    showFeedback(isArabic.value ? 'فشل في تحديث المسار' : 'Failed to update route', false)
  }
}

const deleteRoute = async (id: number) => {
  if (
    confirm(
      isArabic.value
        ? 'هل أنت متأكد من حذف هذا المسار؟'
        : 'Are you sure you want to delete this route?',
    )
  ) {
    try {
      await controllerService.deleteRoute(id)
      showFeedback(isArabic.value ? 'تم حذف المسار بنجاح' : 'Route deleted successfully')
      loadRoutes()
    } catch (error) {
      console.error('Error deleting route:', error)
      showFeedback(isArabic.value ? 'فشل في حذف المسار' : 'Failed to delete route', false)
    }
  }
}

const closeEditRouteModal = () => {
  showEditRouteModal.value = false
  editingRoute.value = {}
}

// Lifecycle
onMounted(() => {
  loadCurrencies()
  loadRoutes()
})
</script>

<style scoped>
/* Base Styles */
.controller-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f6f8 0%, #fff6fa 35%, #f0e6f0 70%, #e8d4e8 100%);
  padding: 1rem;
  position: relative;
  overflow-x: hidden;
}

.controller-page.dark-theme {
  background: linear-gradient(135deg, #1a1423 0%, #241726 35%, #2d1b30 70%, #3a2240 100%);
}

/* Background Effects */
.background-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.1), rgba(138, 42, 68, 0.05));
  animation: float 6s ease-in-out infinite;
  filter: blur(1px);
}

.controller-page.dark-theme .floating-orb {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.15), rgba(167, 56, 92, 0.08));
}

.orb-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 15%;
  animation-delay: 3s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Glass Panel */
.glass-panel {
  background: rgba(255, 246, 250, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(228, 201, 214, 0.3);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(138, 42, 68, 0.1),
    0 2px 8px rgba(138, 42, 68, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
  margin-bottom: 1.5rem;
}

.controller-page.dark-theme .glass-panel {
  background: rgba(36, 23, 38, 0.8);
  border: 1px solid rgba(81, 32, 60, 0.4);
  box-shadow:
    0 8px 32px rgba(167, 56, 92, 0.15),
    0 2px 8px rgba(167, 56, 92, 0.08),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

/* Page Header */
.page-header {
  padding: 2rem;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #6d1a36;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.controller-page.dark-theme .page-title {
  background: linear-gradient(135deg, #e14b6a, #f8e9f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6d1a36;
  opacity: 0.8;
  margin: 0;
}

.controller-page.dark-theme .page-subtitle {
  color: #f8e9f0;
}

/* Feedback Message */
.feedback-message {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  text-align: center;
  animation: slideIn 0.3s ease-out;
}

.feedback-message.success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.feedback-message.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Tabs */
.tabs-container {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: rgba(255, 246, 250, 0.6);
  color: #6d1a36;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(228, 201, 214, 0.3);
}

.controller-page.dark-theme .tab-btn {
  background: rgba(36, 23, 38, 0.6);
  color: #f8e9f0;
  border: 1px solid rgba(81, 32, 60, 0.4);
}

.tab-btn:hover {
  background: rgba(225, 75, 106, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(138, 42, 68, 0.2);
}

.tab-btn.active {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  color: white;
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.3);
}

/* Tab Content */
.tab-content {
  animation: fadeIn 0.3s ease-out;
}

/* Add Section */
.add-section {
  padding: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6d1a36;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.controller-page.dark-theme .section-title {
  color: #f8e9f0;
}

.add-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #6d1a36;
}

.controller-page.dark-theme .form-group label {
  color: #f8e9f0;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid rgba(228, 201, 214, 0.5);
  border-radius: 8px;
  background: rgba(255, 246, 250, 0.8);
  color: #1a1423;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.controller-page.dark-theme .form-input {
  background: rgba(36, 23, 38, 0.8);
  border: 1px solid rgba(81, 32, 60, 0.5);
  color: #f8e9f0;
}

.form-input:focus {
  outline: none;
  border-color: #e14b6a;
  box-shadow: 0 0 0 2px rgba(225, 75, 106, 0.2);
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.3);
}

.btn-secondary {
  background: rgba(255, 246, 250, 0.8);
  color: #6d1a36;
  border: 1px solid rgba(228, 201, 214, 0.5);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.controller-page.dark-theme .btn-secondary {
  background: rgba(36, 23, 38, 0.8);
  color: #f8e9f0;
  border: 1px solid rgba(81, 32, 60, 0.5);
}

.btn-refresh {
  background: rgba(255, 246, 250, 0.8);
  color: #6d1a36;
  border: 1px solid rgba(228, 201, 214, 0.5);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.controller-page.dark-theme .btn-refresh {
  background: rgba(36, 23, 38, 0.8);
  color: #f8e9f0;
  border: 1px solid rgba(81, 32, 60, 0.5);
}

/* List Section */
.list-section {
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
}

.loading-container {
  text-align: center;
}

.loading-spinner-enhanced {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
}

.spinner-ring {
  position: absolute;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.ring-1 {
  width: 80px;
  height: 80px;
  border-top-color: #e14b6a;
  animation-duration: 1.5s;
}

.ring-2 {
  width: 60px;
  height: 60px;
  top: 10px;
  left: 10px;
  border-top-color: #8a2a44;
  animation-duration: 2s;
  animation-direction: reverse;
}

.ring-3 {
  width: 40px;
  height: 40px;
  top: 20px;
  left: 20px;
  border-top-color: #e14b6a;
  animation-duration: 1s;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #6d1a36;
  font-weight: 600;
}

.controller-page.dark-theme .loading-text {
  color: #f8e9f0;
}

/* Items Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background: rgba(255, 246, 250, 0.6);
  border: 1px solid rgba(228, 201, 214, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.controller-page.dark-theme .item-card {
  background: rgba(36, 23, 38, 0.6);
  border: 1px solid rgba(81, 32, 60, 0.4);
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(138, 42, 68, 0.15);
  border-color: #e14b6a;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.item-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #6d1a36;
  margin: 0 0 0.25rem 0;
}

.controller-page.dark-theme .item-name {
  color: #f8e9f0;
}

.item-meta {
  font-size: 0.9rem;
  color: #6d1a36;
  opacity: 0.7;
  margin: 0 0 0.25rem 0;
}

.controller-page.dark-theme .item-meta {
  color: #f8e9f0;
}

.item-id {
  font-size: 0.8rem;
  color: #6d1a36;
  opacity: 0.5;
  margin: 0;
}

.controller-page.dark-theme .item-id {
  color: #f8e9f0;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-edit,
.btn-delete {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: white;
}

.btn-edit:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-delete:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Route Card Specific */
.route-card .item-info .item-name {
  font-size: 1.1rem;
}

.route-card .item-info .item-meta {
  font-size: 0.95rem;
  font-style: italic;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6d1a36;
  opacity: 0.6;
}

.controller-page.dark-theme .empty-state {
  color: #f8e9f0;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
}

.empty-state p {
  font-size: 1.1rem;
  font-weight: 600;
}

/* Modal */
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
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.modal-content {
  background: rgba(255, 246, 250, 0.95);
  border: 1px solid rgba(228, 201, 214, 0.3);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px rgba(138, 42, 68, 0.2);
}

.controller-page.dark-theme .modal-content {
  background: rgba(36, 23, 38, 0.95);
  border: 1px solid rgba(81, 32, 60, 0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(228, 201, 214, 0.3);
}

.controller-page.dark-theme .modal-header {
  border-bottom: 1px solid rgba(81, 32, 60, 0.4);
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6d1a36;
  margin: 0;
}

.controller-page.dark-theme .modal-header h3 {
  color: #f8e9f0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* Animations */
@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .tabs-container {
    flex-direction: column;
    align-items: center;
  }

  .tab-btn {
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }

  .add-form {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;
  }
}

/* RTL Support */
[dir='rtl'] .item-header {
  flex-direction: row-reverse;
}

[dir='rtl'] .section-header {
  flex-direction: row-reverse;
}

[dir='rtl'] .modal-header {
  flex-direction: row-reverse;
}

[dir='rtl'] .modal-actions {
  flex-direction: row-reverse;
}

[dir='rtl'] .add-form {
  direction: rtl;
}
</style>
