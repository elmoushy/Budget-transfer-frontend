<template>
  <main class="accounts-entity-view">
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
                  <th>{{ isArabic ? 'الرقم التعريفي' : 'ID' }}</th>
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
                  <td>{{ account.id }}</td>
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
                  <th>{{ isArabic ? 'الرقم التعريفي' : 'ID' }}</th>
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
                  <td>{{ entity.id }}</td>
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
                :disabled="currentEntityPage >= totalEntityPages"
                @click="currentEntityPage++"
              >
                <i class="fas fa-angle-right"></i>
              </button>
              <button
                class="pagination-btn"
                :disabled="currentEntityPage >= totalEntityPages"
                @click="currentEntityPage = totalEntityPages"
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
import { ref, computed, onMounted, reactive, defineComponent } from 'vue'
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
  padding: 2rem 0;
  min-height: calc(100vh - 120px);
  background: var(--app-background);
}

.container {
  width: 96%;
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 2rem;
}

/* Tabs */
.tabs-container {
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: fit-content;
  margin: 0 auto;
}

.tabs button {
  padding: 0.8rem 2rem;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 160px;
}

.tabs button.active {
  background: var(--primary-color);
  color: white;
}

.tabs button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.2);
}

/* Header and actions */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-actions h2 {
  color: var(--text-color);
  margin: 0;
  font-size: 1.5rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-box input {
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-color);
  outline: none;
  transition: all 0.3s ease;
}

.search-box input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.search-box i {
  position: absolute;
  left: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  background: var(--primary-color);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add:hover {
  background: var(--primary-color-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Data table */
.data-table-container {
  overflow-x: auto;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
}

.data-table thead th {
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-color);
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  position: relative;
}

.data-table tbody td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.data-table tbody tr:hover td {
  background: rgba(255, 255, 255, 0.05);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.actions-column {
  width: 120px;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  border: none;
  background: none;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 4px;
}

.btn-edit {
  background: rgba(0, 150, 255, 0.15);
}

.btn-edit:hover {
  background: rgba(0, 150, 255, 0.3);
  color: #0096ff;
}

.btn-delete {
  background: rgba(255, 50, 50, 0.15);
}

.btn-delete:hover {
  background: rgba(255, 50, 50, 0.3);
  color: #ff3232;
}

.no-data {
  text-align: center;
  padding: 2rem !important;
  color: rgba(255, 255, 255, 0.5);
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: var(--card-background);
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: var(--text-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-color);
  cursor: pointer;
  padding: 0;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #ff3232;
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
  color: var(--text-color);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-color);
  outline: none;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.form-group input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel,
.btn-save {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-save {
  background: var(--primary-color);
  color: white;
  border: none;
}

.btn-save:hover {
  background: var(--primary-color-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Confirmation Dialog */
.confirmation-dialog .modal-content {
  width: 400px;
}

.confirmation-dialog p {
  margin: 1rem 0 2rem;
  color: var(--text-color);
  text-align: center;
}

/* RTL Support */
[dir='rtl'] .search-box i {
  left: auto;
  right: 0.8rem;
}

[dir='rtl'] .data-table thead th {
  text-align: right;
}

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: var(--text-color);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
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
  padding: 0.5rem 0;
  color: var(--text-color);
}

.item-count {
  font-weight: 500;
}

.filtered-info {
  margin-left: 0.5rem;
  opacity: 0.7;
  font-size: 0.9rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
}

.pagination-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  padding: 0 1rem;
  color: var(--text-color);
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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
    padding: 0.7rem 1rem;
    min-width: 100px;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>
