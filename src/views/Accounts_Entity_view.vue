<template>
  <main class="accounts-entity-view" :class="{ 'dark-mode': isDarkMode }">
    <div class="container">
      <div class="tabs-container">
        <div class="tabs">
          <button :class="{ active: activeTab === 'accounts' }" @click="activeTab = 'accounts'">
            {{ isArabic ? 'الحسابات' : 'Accounts' }}
          </button>
          <button :class="{ active: activeTab === 'entities' }" @click="activeTab = 'entities'">
            {{ isArabic ? 'الكيانات' : 'Entities' }}
          </button>
        </div>
      </div>

      <!-- Accounts Tab -->
      <div v-if="activeTab === 'accounts'" class="accounts-tab">
        <div class="header-actions">
          <h2>{{ isArabic ? 'إدارة الحسابات' : 'Accounts Management' }}</h2>
          <div class="actions">
            <div class="search-box">
              <input
                type="text"
                v-model="accountSearchQuery"
                :placeholder="isArabic ? 'بحث في الحسابات...' : 'Search accounts...'"
                @input="filterAccounts"
              />
              <i class="fas fa-search"></i>
            </div>
            <button class="btn-add" @click="showAccountModal = true">
              <i class="fas fa-plus"></i>
              {{ isArabic ? 'إضافة حساب' : 'Add Account' }}
            </button>
          </div>
        </div>

        <div class="data-table-container">
          <div v-if="accountsLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>{{ isArabic ? 'جاري تحميل البيانات...' : 'Loading accounts...' }}</p>
          </div>

          <div v-else>
            <div class="table-info-bar">
              <span class="item-count">
                {{
                  isArabic
                    ? `إجمالي الحسابات: ${filteredAccounts.length}`
                    : `Total Accounts: ${filteredAccounts.length}`
                }}
              </span>
              <span v-if="filteredAccounts.length !== accounts.length" class="filtered-info">
                {{
                  isArabic ? `(تصفية من ${accounts.length})` : `(Filtered from ${accounts.length})`
                }}
              </span>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <!-- <th>{{ isArabic ? 'الرقم التعريفي' : 'ID' }}</th> -->
                  <th>{{ isArabic ? 'الحساب' : 'Account' }}</th>
                  <th>{{ isArabic ? 'الأصل' : 'Parent' }}</th>
                  <th>{{ isArabic ? 'الاسم المختصر' : 'Alias' }}</th>
                  <th class="actions-column">{{ isArabic ? 'الإجراءات' : 'Actions' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredAccounts.length === 0">
                  <td colspan="5" class="no-data">
                    {{ isArabic ? 'لا توجد بيانات للعرض' : 'No accounts data to display' }}
                  </td>
                </tr>
                <tr v-for="account in paginatedAccounts" :key="account.id">
                  <!-- <td>{{ account.id }}</td> -->
                  <td>{{ account.account }}</td>
                  <td>{{ account.parent }}</td>
                  <td>{{ account.alias_default }}</td>
                  <td class="actions">
                    <button @click="editAccount(account)" class="btn-edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDeleteAccount(account)" class="btn-delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Accounts Pagination -->
            <div class="pagination" v-if="filteredAccounts.length > 0">
              <button
                class="pagination-btn"
                :disabled="currentAccountPage === 1"
                @click="currentAccountPage = 1"
              >
                <i class="fas fa-angle-double-left"></i>
              </button>
              <button
                class="pagination-btn"
                :disabled="currentAccountPage === 1"
                @click="currentAccountPage--"
              >
                <i class="fas fa-angle-left"></i>
              </button>
              <div class="pagination-info">
                {{
                  isArabic
                    ? `صفحة ${currentAccountPage} من ${totalAccountPages}`
                    : `Page ${currentAccountPage} of ${totalAccountPages}`
                }}
              </div>
              <button
                class="pagination-btn"
                :disabled="currentAccountPage >= totalAccountPages"
                @click="currentAccountPage++"
              >
                <i class="fas fa-angle-right"></i>
              </button>
              <button
                class="pagination-btn"
                :disabled="currentAccountPage >= totalAccountPages"
                @click="currentAccountPage = totalAccountPages"
              >
                <i class="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Entities Tab -->
      <div v-if="activeTab === 'entities'" class="entities-tab">
        <div class="header-actions">
          <h2>{{ isArabic ? 'إدارة الكيانات' : 'Entities Management' }}</h2>
          <div class="actions">
            <div class="search-box">
              <input
                type="text"
                v-model="entitySearchQuery"
                :placeholder="isArabic ? 'بحث في الكيانات...' : 'Search entities...'"
                @input="filterEntities"
              />
              <i class="fas fa-search"></i>
            </div>
            <button class="btn-add" @click="showEntityModal = true">
              <i class="fas fa-plus"></i>
              {{ isArabic ? 'إضافة كيان' : 'Add Entity' }}
            </button>
          </div>
        </div>

        <div class="data-table-container">
          <div v-if="entitiesLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>{{ isArabic ? 'جاري تحميل البيانات...' : 'Loading entities...' }}</p>
          </div>

          <div v-else>
            <div class="table-info-bar">
              <span class="item-count">
                {{
                  isArabic
                    ? `إجمالي الكيانات: ${filteredEntities.length}`
                    : `Total Entities: ${filteredEntities.length}`
                }}
              </span>
              <span v-if="filteredEntities.length !== entities.length" class="filtered-info">
                {{
                  isArabic ? `(تصفية من ${entities.length})` : `(Filtered from ${entities.length})`
                }}
              </span>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <!-- <th>{{ isArabic ? 'الرقم التعريفي' : 'ID' }}</th> -->
                  <th>{{ isArabic ? 'الكيان' : 'Entity' }}</th>
                  <th>{{ isArabic ? 'الأصل' : 'Parent' }}</th>
                  <th>{{ isArabic ? 'الاسم المختصر' : 'Alias' }}</th>
                  <th class="actions-column">{{ isArabic ? 'الإجراءات' : 'Actions' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredEntities.length === 0">
                  <td colspan="5" class="no-data">
                    {{ isArabic ? 'لا توجد بيانات للعرض' : 'No entities data to display' }}
                  </td>
                </tr>
                <tr v-for="entity in paginatedEntities" :key="entity.id">
                  <!-- <td>{{ entity.id }}</td> -->
                  <td>{{ entity.entity }}</td>
                  <td>{{ entity.parent }}</td>
                  <td>{{ entity.alias_default }}</td>
                  <td class="actions">
                    <button @click="editEntity(entity)" class="btn-edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDeleteEntity(entity)" class="btn-delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Entities Pagination -->
            <div class="pagination" v-if="filteredEntities.length > 0">
              <button
                class="pagination-btn"
                :disabled="currentEntityPage === 1"
                @click="currentEntityPage = 1"
              >
                <i class="fas fa-angle-double-left"></i>
              </button>
              <button
                class="pagination-btn"
                :disabled="currentEntityPage === 1"
                @click="currentEntityPage--"
              >
                <i class="fas fa-angle-left"></i>
              </button>
              <div class="pagination-info">
                {{
                  isArabic
                    ? `صفحة ${currentEntityPage} من ${totalEntityPages}`
                    : `Page ${currentEntityPage} of ${totalEntityPages}`
                }}
              </div>
              <button
                class="pagination-btn"
                :disabled="currentEntityPage >= totalAccountPages"
                @click="currentEntityPage++"
              >
                <i class="fas fa-angle-right"></i>
              </button>
              <button
                class="pagination-btn"
                :disabled="currentEntityPage >= totalAccountPages"
                @click="currentEntityPage = totalAccountPages"
              >
                <i class="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Modal -->
    <div v-if="showAccountModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            {{
              isEditMode
                ? isArabic
                  ? 'تعديل الحساب'
                  : 'Edit Account'
                : isArabic
                  ? 'إضافة حساب جديد'
                  : 'Add New Account'
            }}
          </h3>
          <button @click="closeAccountModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitAccountForm">
            <div class="form-group">
              <label for="account-code">{{ isArabic ? 'رمز الحساب' : 'Account Code' }}</label>
              <input
                id="account-code"
                v-model="accountForm.account"
                type="text"
                required
                :disabled="isEditMode"
                :placeholder="isArabic ? 'أدخل رمز الحساب' : 'Enter account code'"
              />
            </div>
            <div class="form-group">
              <label for="account-parent">{{ isArabic ? 'الأصل' : 'Parent' }}</label>
              <input
                id="account-parent"
                v-model="accountForm.parent"
                type="text"
                required
                :placeholder="isArabic ? 'أدخل الأصل' : 'Enter parent'"
              />
            </div>
            <div class="form-group">
              <label for="account-alias">{{ isArabic ? 'الاسم المختصر' : 'Alias' }}</label>
              <input
                id="account-alias"
                v-model="accountForm.alias_default"
                type="text"
                :placeholder="isArabic ? 'أدخل الاسم المختصر' : 'Enter alias'"
              />
            </div>
            <div class="form-actions">
              <button type="button" @click="closeAccountModal" class="btn-cancel">
                {{ isArabic ? 'إلغاء' : 'Cancel' }}
              </button>
              <button type="submit" class="btn-save">
                {{ isArabic ? 'حفظ' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Entity Modal -->
    <div v-if="showEntityModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            {{
              isEditMode
                ? isArabic
                  ? 'تعديل الكيان'
                  : 'Edit Entity'
                : isArabic
                  ? 'إضافة كيان جديد'
                  : 'Add New Entity'
            }}
          </h3>
          <button @click="closeEntityModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEntityForm">
            <div class="form-group">
              <label for="entity-code">{{ isArabic ? 'رمز الكيان' : 'Entity Code' }}</label>
              <input
                id="entity-code"
                v-model="entityForm.entity"
                type="text"
                required
                :disabled="isEditMode"
                :placeholder="isArabic ? 'أدخل رمز الكيان' : 'Enter entity code'"
              />
            </div>
            <div class="form-group">
              <label for="entity-parent">{{ isArabic ? 'الأصل' : 'Parent' }}</label>
              <input
                id="entity-parent"
                v-model="entityForm.parent"
                type="text"
                required
                :placeholder="isArabic ? 'أدخل الأصل' : 'Enter parent'"
              />
            </div>
            <div class="form-group">
              <label for="entity-alias">{{ isArabic ? 'الاسم المختصر' : 'Alias' }}</label>
              <input
                id="entity-alias"
                v-model="entityForm.alias_default"
                type="text"
                :placeholder="isArabic ? 'أدخل الاسم المختصر' : 'Enter alias'"
              />
            </div>
            <div class="form-actions">
              <button type="button" @click="closeEntityModal" class="btn-cancel">
                {{ isArabic ? 'إلغاء' : 'Cancel' }}
              </button>
              <button type="submit" class="btn-save">
                {{ isArabic ? 'حفظ' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="modal confirmation-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isArabic ? 'تأكيد الحذف' : 'Confirm Delete' }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ confirmMessage }}</p>
          <div class="form-actions">
            <button @click="cancelDelete" class="btn-cancel">
              {{ isArabic ? 'إلغاء' : 'Cancel' }}
            </button>
            <button @click="confirmDelete" class="btn-delete">
              {{ isArabic ? 'حذف' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { ref, computed, onMounted, watch, reactive, defineComponent } from 'vue'
import apiService from '@/services/apiService'
import { useThemeStore } from '@/stores/themeStore'

// Define TypeScript interfaces for our data structures
interface Account {
  id: number
  account: string
  parent: string
  alias_default: string
}

interface Entity {
  id: number
  entity: string
  parent: string
  alias_default: string
}

export default defineComponent({
  name: 'Accounts_Entity_view',
  setup() {
    // Theme and language
    const themeStore = useThemeStore()
    const isArabic = computed(() => themeStore.language === 'ar')
    const isDarkMode = ref(false)

    // Initialize theme values from store
    onMounted(() => {
      isDarkMode.value = themeStore.darkMode
    })

    // Watch for theme changes
    watch(
      () => themeStore.darkMode,
      (darkMode) => {
        isDarkMode.value = darkMode
      },
    )

    // Toast notifications
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      // Using the type parameter in a conditional to avoid the unused variable warning
      if (type === 'error') {
        console.error(message)
      } else {
        console.log(message)
      }
      alert(message) // Simple fallback, replace with your app's toast system
    }

    // Tab state
    const activeTab = ref<'accounts' | 'entities'>('accounts')

    // Data collections
    const accounts = ref<Account[]>([])
    const entities = ref<Entity[]>([])
    const filteredAccounts = ref<Account[]>([])
    const filteredEntities = ref<Entity[]>([])

    // Loading states
    const accountsLoading = ref<boolean>(false)
    const entitiesLoading = ref<boolean>(false)

    // Pagination
    const itemsPerPage = 8
    const currentAccountPage = ref<number>(1)
    const currentEntityPage = ref<number>(1)

    // Computed properties for pagination
    const totalAccountPages = computed(() =>
      Math.ceil(filteredAccounts.value.length / itemsPerPage),
    )
    const totalEntityPages = computed(() => Math.ceil(filteredEntities.value.length / itemsPerPage))

    const paginatedAccounts = computed(() => {
      const startIndex = (currentAccountPage.value - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return filteredAccounts.value.slice(startIndex, endIndex)
    })

    const paginatedEntities = computed(() => {
      const startIndex = (currentEntityPage.value - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return filteredEntities.value.slice(startIndex, endIndex)
    })

    // Search queries
    const accountSearchQuery = ref('')
    const entitySearchQuery = ref('')

    // Modal states
    const showAccountModal = ref<boolean>(false)
    const showEntityModal = ref<boolean>(false)
    const showConfirmDialog = ref<boolean>(false)
    const isEditMode = ref<boolean>(false)

    // Selected items for editing or deleting
    const selectedAccount = ref<Account | null>(null)
    const selectedEntity = ref<Entity | null>(null)

    // Confirmation dialog
    const confirmMessage = ref<string>('')
    const deleteItemType = ref<'account' | 'entity' | ''>('') // 'account' or 'entity'

    // Form data
    const accountForm = reactive<{
      account: string
      parent: string
      alias_default: string
    }>({
      account: '',
      parent: '',
      alias_default: '',
    })

    const entityForm = reactive<{
      entity: string
      parent: string
      alias_default: string
    }>({
      entity: '',
      parent: '',
      alias_default: '',
    })

    // Fetch data from the API
    const fetchAccounts = async () => {
      accountsLoading.value = true
      try {
        const response = await apiService.accountEntities.getAccounts()
        accounts.value = response.data || []
        filteredAccounts.value = [...accounts.value]
        // Reset pagination when new data is loaded
        currentAccountPage.value = 1
      } catch (error) {
        console.error('Error fetching accounts:', error)
        showToast(
          isArabic.value ? 'حدث خطأ أثناء جلب بيانات الحسابات' : 'Error fetching accounts data',
          'error',
        )
      } finally {
        accountsLoading.value = false
      }
    }

    const fetchEntities = async () => {
      entitiesLoading.value = true
      try {
        const response = await apiService.accountEntities.getEntities()
        entities.value = response.data || []
        filteredEntities.value = [...entities.value]
        // Reset pagination when new data is loaded
        currentEntityPage.value = 1
      } catch (error) {
        console.error('Error fetching entities:', error)
        showToast(
          isArabic.value ? 'حدث خطأ أثناء جلب بيانات الكيانات' : 'Error fetching entities data',
          'error',
        )
      } finally {
        entitiesLoading.value = false
      }
    }

    // Filter functions
    const filterAccounts = () => {
      if (!accountSearchQuery.value.trim()) {
        filteredAccounts.value = [...accounts.value]
      } else {
        const query = accountSearchQuery.value.toLowerCase()
        filteredAccounts.value = accounts.value.filter(
          (account) =>
            account.account.toLowerCase().includes(query) ||
            account.parent.toLowerCase().includes(query) ||
            (account.alias_default && account.alias_default.toLowerCase().includes(query)),
        )
      }
      // Reset to first page when filter changes
      currentAccountPage.value = 1
    }

    const filterEntities = () => {
      if (!entitySearchQuery.value.trim()) {
        filteredEntities.value = [...entities.value]
      } else {
        const query = entitySearchQuery.value.toLowerCase()
        filteredEntities.value = entities.value.filter(
          (entity) =>
            entity.entity.toLowerCase().includes(query) ||
            entity.parent.toLowerCase().includes(query) ||
            (entity.alias_default && entity.alias_default.toLowerCase().includes(query)),
        )
      }
      // Reset to first page when filter changes
      currentEntityPage.value = 1
    }

    // Account CRUD operations
    const resetAccountForm = () => {
      accountForm.account = ''
      accountForm.parent = ''
      accountForm.alias_default = ''
    }

    const editAccount = (account: Account) => {
      isEditMode.value = true
      selectedAccount.value = account
      accountForm.account = account.account
      accountForm.parent = account.parent
      accountForm.alias_default = account.alias_default
      showAccountModal.value = true
    }

    const confirmDeleteAccount = (account: Account) => {
      selectedAccount.value = account
      confirmMessage.value = isArabic.value
        ? `هل أنت متأكد من رغبتك في حذف الحساب: ${account.account}؟`
        : `Are you sure you want to delete account: ${account.account}?`
      deleteItemType.value = 'account'
      showConfirmDialog.value = true
    }

    const submitAccountForm = async () => {
      try {
        if (isEditMode.value && selectedAccount.value) {
          // Update existing account
          await apiService.accountEntities.updateAccount(selectedAccount.value.id, {
            account: accountForm.account,
            parent: accountForm.parent,
            alias_default: accountForm.alias_default,
          })

          showToast(isArabic.value ? 'تم تحديث الحساب بنجاح' : 'Account updated successfully')
        } else {
          // Create new account
          await apiService.accountEntities.createAccount({
            account: accountForm.account,
            parent: accountForm.parent,
            alias_default: accountForm.alias_default,
          })

          showToast(isArabic.value ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully')
        }

        // Refresh accounts data and close modal
        await fetchAccounts()
        closeAccountModal()
      } catch (error) {
        console.error('Error saving account:', error)
        showToast(isArabic.value ? 'حدث خطأ أثناء حفظ الحساب' : 'Error saving account', 'error')
      }
    }

    const deleteAccount = async () => {
      try {
        if (selectedAccount.value) {
          await apiService.accountEntities.deleteAccount(selectedAccount.value.id)
          showToast(isArabic.value ? 'تم حذف الحساب بنجاح' : 'Account deleted successfully')
          await fetchAccounts()
        }
      } catch (error) {
        console.error('Error deleting account:', error)
        showToast(isArabic.value ? 'حدث خطأ أثناء حذف الحساب' : 'Error deleting account', 'error')
      }
    }

    const closeAccountModal = () => {
      showAccountModal.value = false
      isEditMode.value = false
      selectedAccount.value = null
      resetAccountForm()
    }

    // Entity CRUD operations
    const resetEntityForm = () => {
      entityForm.entity = ''
      entityForm.parent = ''
      entityForm.alias_default = ''
    }

    const editEntity = (entity: Entity) => {
      isEditMode.value = true
      selectedEntity.value = entity
      entityForm.entity = entity.entity
      entityForm.parent = entity.parent
      entityForm.alias_default = entity.alias_default
      showEntityModal.value = true
    }

    const confirmDeleteEntity = (entity: Entity) => {
      selectedEntity.value = entity
      confirmMessage.value = isArabic.value
        ? `هل أنت متأكد من رغبتك في حذف الكيان: ${entity.entity}؟`
        : `Are you sure you want to delete entity: ${entity.entity}?`
      deleteItemType.value = 'entity'
      showConfirmDialog.value = true
    }

    const submitEntityForm = async () => {
      try {
        if (isEditMode.value && selectedEntity.value) {
          // Update existing entity
          await apiService.accountEntities.updateEntity(selectedEntity.value.id, {
            entity: entityForm.entity,
            parent: entityForm.parent,
            alias_default: entityForm.alias_default,
          })

          showToast(isArabic.value ? 'تم تحديث الكيان بنجاح' : 'Entity updated successfully')
        } else {
          // Create new entity
          await apiService.accountEntities.createEntity({
            entity: entityForm.entity,
            parent: entityForm.parent,
            alias_default: entityForm.alias_default,
          })

          showToast(isArabic.value ? 'تم إنشاء الكيان بنجاح' : 'Entity created successfully')
        }

        // Refresh entities data and close modal
        await fetchEntities()
        closeEntityModal()
      } catch (error) {
        console.error('Error saving entity:', error)
        showToast(isArabic.value ? 'حدث خطأ أثناء حفظ الكيان' : 'Error saving entity', 'error')
      }
    }

    const deleteEntity = async () => {
      try {
        if (selectedEntity.value) {
          await apiService.accountEntities.deleteEntity(selectedEntity.value.id)
          showToast(isArabic.value ? 'تم حذف الكيان بنجاح' : 'Entity deleted successfully')
          await fetchEntities()
        }
      } catch (error) {
        console.error('Error deleting entity:', error)
        showToast(isArabic.value ? 'حدث خطأ أثناء حذف الكيان' : 'Error deleting entity', 'error')
      }
    }

    const closeEntityModal = () => {
      showEntityModal.value = false
      isEditMode.value = false
      selectedEntity.value = null
      resetEntityForm()
    }

    // Confirmation dialog functions
    const confirmDelete = async () => {
      if (deleteItemType.value === 'account') {
        await deleteAccount()
      } else {
        await deleteEntity()
      }

      showConfirmDialog.value = false
    }

    const cancelDelete = () => {
      showConfirmDialog.value = false
      selectedAccount.value = null
      selectedEntity.value = null
    }

    // Initialize data
    onMounted(() => {
      fetchAccounts()
      fetchEntities()
    })

    return {
      // State
      activeTab,
      accounts,
      entities,
      filteredAccounts,
      filteredEntities,
      accountSearchQuery,
      entitySearchQuery,
      showAccountModal,
      showEntityModal,
      showConfirmDialog,
      isEditMode,
      confirmMessage,

      // Loading states
      accountsLoading,
      entitiesLoading,

      // Pagination
      currentAccountPage,
      currentEntityPage,
      totalAccountPages,
      totalEntityPages,
      paginatedAccounts,
      paginatedEntities,

      // Form data
      accountForm,
      entityForm,

      // Theme and language
      isArabic,
      isDarkMode,

      // Methods
      filterAccounts,
      filterEntities,
      editAccount,
      editEntity,
      confirmDeleteAccount,
      confirmDeleteEntity,
      submitAccountForm,
      submitEntityForm,
      closeAccountModal,
      closeEntityModal,
      confirmDelete,
      cancelDelete,
    }
  },
})
</script>

<style scoped>
.accounts-entity-view {
  min-height: 100vh;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.accounts-entity-view.dark-mode {
  background: linear-gradient(135deg, #1a1a2e 0%, #111122 100%);
  color: #e2e8f0;
}

/* Background animation elements */
.accounts-entity-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(109, 26, 54, 0.05) 0%, transparent 50%);
  animation: backgroundFloat 20s ease-in-out infinite;
}

@keyframes backgroundFloat {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    opacity: 0.5;
  }
}

.container {
  width: 100%;
  max-width: 2500px;
  margin: 0 auto;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.dark-mode .container {
  background: rgba(17, 17, 34, 0.8);
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Container glow effect */
.container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.05) 0%,
    transparent 30%,
    transparent 70%,
    rgba(16, 185, 129, 0.05) 100%
  );
  border-radius: 24px;
  pointer-events: none;
}

/* Tabs */
.tabs-container {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  position: relative;
}

.tabs-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
}

.tabs {
  display: flex;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  width: fit-content;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.dark-mode .tabs {
  background: rgba(30, 30, 50, 0.8);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tabs button {
  padding: 1.25rem 3rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  min-width: 200px;
  position: relative;
  overflow: hidden;
}

.tabs button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tabs button.active {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  color: #ffffff;
  box-shadow:
    0 8px 25px rgba(59, 130, 246, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.tabs button.active::before {
  opacity: 1;
}

.tabs button:hover:not(.active) {
  background: rgba(59, 130, 246, 0.1);
  color: #334155;
}

.dark-mode .tabs button {
  color: #94a3b8;
}

.dark-mode .tabs button:hover:not(.active) {
  background: rgba(59, 130, 246, 0.15);
  color: #e2e8f0;
}

/* Header and actions */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.dark-mode .header-actions {
  background: rgba(30, 30, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.header-actions h2 {
  color: #1e293b;
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .header-actions h2 {
  background: linear-gradient(135deg, #f1f5f9 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.search-box {
  position: relative;
  width: 350px;
}

.search-box input {
  width: 100%;
  padding: 1rem 1.25rem 1rem 3.5rem;
  border: 2px solid rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  color: #334155;
  outline: none;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  font-size: 0.95rem;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.search-box input:focus {
  border-color: #3b82f6;
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.1),
    0 8px 25px rgba(59, 130, 246, 0.15);
}

.search-box input::placeholder {
  color: #94a3b8;
}

.dark-mode .search-box input {
  background: rgba(30, 30, 50, 0.8);
  border-color: rgba(59, 130, 246, 0.2);
  color: #e2e8f0;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark-mode .search-box input:focus {
  border-color: #3b82f6;
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.15),
    0 8px 25px rgba(59, 130, 246, 0.1);
}

.dark-mode .search-box input::placeholder {
  color: #64748b;
}

.search-box i {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.search-box input:focus + i {
  color: #3b82f6;
}

.dark-mode .search-box input {
  background: rgba(30, 30, 50, 0.8);
  border-color: rgba(59, 130, 246, 0.2);
  color: #e2e8f0;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark-mode .search-box input:focus {
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.2),
    0 8px 25px rgba(59, 130, 246, 0.3);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow:
    0 8px 25px rgba(16, 185, 129, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;
}

.btn-add:hover {
  transform: translateY(-3px);
  box-shadow:
    0 12px 35px rgba(16, 185, 129, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

/* Data table - simplified design */
.data-table-container {
  overflow-x: auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.dark-mode .data-table-container {
  background: rgba(30, 30, 50, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead th {
  background: #1e293b;
  color: #ffffff;
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
}

.data-table tbody td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: #374151;
  font-size: 0.875rem;
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background: rgba(59, 130, 246, 0.05);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.dark-mode .data-table tbody td {
  color: #cbd5e1;
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.dark-mode .data-table tbody tr:hover {
  background: rgba(59, 130, 246, 0.1);
}

.actions-column {
  width: 120px;
  text-align: center;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.btn-edit,
.btn-delete {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.btn-edit {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.btn-edit:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #1d4ed8;
}

.btn-delete {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.no-data {
  text-align: center;
  padding: 3rem !important;
  color: #64748b;
  font-size: 1rem;
  font-style: italic;
}

.dark-mode .no-data {
  color: #94a3b8;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(25px);
  border-radius: 16px;
  width: 500px;
  max-width: 95%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark-mode .modal-content {
  background: rgba(30, 30, 50, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark-mode .modal-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.dark-mode .modal-header h3 {
  color: #f1f5f9;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

/* Form */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
}

.dark-mode .form-group label {
  color: #cbd5e1;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #374151;
  outline: none;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.form-group input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f9fafb;
}

.form-group input::placeholder {
  color: #9ca3af;
}

.dark-mode .form-group input {
  background: rgba(55, 65, 81, 0.5);
  border-color: rgba(75, 85, 99, 0.5);
  color: #e5e7eb;
}

.dark-mode .form-group input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.dark-mode .form-actions {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  border: 1px solid transparent;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.btn-cancel:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.btn-save {
  background: #3b82f6;
  color: #ffffff;
}

.btn-save:hover {
  background: #2563eb;
}

.dark-mode .btn-cancel {
  background: rgba(55, 65, 81, 0.5);
  color: #d1d5db;
  border-color: rgba(75, 85, 99, 0.5);
}

.dark-mode .btn-cancel:hover {
  background: rgba(75, 85, 99, 0.5);
}

/* Confirmation Dialog */
.confirmation-dialog .modal-content {
  width: 400px;
}

.confirmation-dialog p {
  margin: 1rem 0 2rem;
  color: #374151;
  text-align: center;
  line-height: 1.5;
}

.dark-mode .confirmation-dialog p {
  color: #d1d5db;
}

.confirmation-dialog .btn-delete {
  background: #ef4444;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
}

.confirmation-dialog .btn-delete:hover {
  background: #dc2626;
}

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Table info bar */
.table-info-bar {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.dark-mode .table-info-bar {
  background: rgba(55, 65, 81, 0.3);
  border-color: rgba(75, 85, 99, 0.3);
}

.item-count {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.dark-mode .item-count {
  color: #d1d5db;
}

.filtered-info {
  margin-left: 0.75rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.dark-mode .filtered-info {
  color: #9ca3ab;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.dark-mode .pagination {
  background: rgba(55, 65, 81, 0.3);
  border-color: rgba(75, 85, 99, 0.3);
}

.pagination-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.pagination-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  padding: 0 1rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

.dark-mode .pagination-info {
  color: #d1d5db;
}

.dark-mode .pagination-btn {
  background: rgba(55, 65, 81, 0.5);
  border-color: rgba(75, 85, 99, 0.5);
  color: #9ca3ab;
}

.dark-mode .pagination-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

/* RTL Support */
[dir='rtl'] .search-box i {
  left: auto;
  right: 1.25rem;
}

[dir='rtl'] .data-table thead th {
  text-align: right;
}

[dir='rtl'] .search-box input {
  padding: 1rem 3.5rem 1rem 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .accounts-entity-view {
    padding: 1rem;
  }

  .container {
    padding: 1rem;
    border-radius: 16px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }

  .actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .tabs button {
    padding: 0.75rem 1rem;
    min-width: 120px;
    font-size: 0.875rem;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .pagination-btn {
    width: 32px;
    height: 32px;
  }

  .modal-content {
    width: 100%;
    margin: 1rem;
  }

  .data-table {
    font-size: 0.75rem;
  }

  .data-table thead th,
  .data-table tbody td {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .tabs {
    width: 100%;
  }

  .tabs button {
    flex: 1;
    min-width: auto;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}
</style>
