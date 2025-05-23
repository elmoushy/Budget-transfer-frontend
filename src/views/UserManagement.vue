<!-- UserManagement.vue -->
<template>
  <div class="user-management" :class="{ 'dark-mode': isDarkMode }">
    <h1>{{ isArabic ? 'إدارة المستخدمين' : 'User Management' }}</h1>

    <!-- Feedback Message -->
    <div v-if="feedbackMessage" :class="['feedback-message', isSuccess ? 'success' : 'error']">
      {{ feedbackMessage }}
    </div>

    <!-- Tab Navigation -->
    <div class="tabs-container">
      <button :class="['tab-btn', { active: activeTab === 'users' }]" @click="activeTab = 'users'">
        {{ isArabic ? 'المستخدمين' : 'Users' }}
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'levels' }]"
        @click="activeTab = 'levels'"
      >
        {{ isArabic ? 'المستويات' : 'User Levels' }}
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'assignments' }]"
        @click="activeTab = 'assignments'"
      >
        {{ isArabic ? 'التعيينات' : 'Level Assignments' }}
      </button>
    </div>

    <!-- Users Management Tab -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <div class="actions">
        <div class="search-filters">
          <div class="search-container">
            <input
              type="text"
              v-model="userSearchQuery"
              :placeholder="isArabic ? 'بحث عن مستخدم...' : 'Search users...'"
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
          <div class="filter-container">
            <select v-model="userRoleFilter" class="filter-select">
              <option value="">{{ isArabic ? 'جميع الأدوار' : 'All Roles' }}</option>
              <option value="admin">{{ isArabic ? 'مدير' : 'Admin' }}</option>
              <option value="user">{{ isArabic ? 'مستخدم' : 'User' }}</option>
            </select>
            <select v-model="userLevelFilter" class="filter-select">
              <option value="">{{ isArabic ? 'جميع المستويات' : 'All Levels' }}</option>
              <option value="None">{{ isArabic ? 'بدون مستوى' : 'No Level' }}</option>
              <option v-for="level in userLevels" :key="level.id" :value="level.name">
                {{ level.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="action-buttons">
          <button @click="refreshData" class="refresh-btn" :disabled="loading || loadingLevels">
            {{ isArabic ? 'تحديث' : 'Refresh' }}
            <span v-if="loading || loadingLevels" class="loading-spinner"></span>
          </button>
          <button @click="showAddUserModal = true" class="add-user-btn">
            {{ isArabic ? 'إضافة مستخدم جديد' : 'Add New User' }}
          </button>
        </div>
      </div>

      <div class="user-list-container">
        <div v-if="loading" class="loading-indicator">
          {{ isArabic ? 'جاري التحميل...' : 'Loading...' }}
        </div>
        <div v-else class="table-container">
          <div class="table-summary">
            <span class="user-count">
              {{
                isArabic
                  ? `إجمالي: ${filteredUsers.length} من ${users.length} مستخدم`
                  : `Total: ${filteredUsers.length} of ${users.length} users`
              }}
            </span>
          </div>
          <table class="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{{ isArabic ? 'اسم المستخدم' : 'Username' }}</th>
                <th>{{ isArabic ? 'الدور' : 'Role' }}</th>
                <th>{{ isArabic ? 'المستوى' : 'User Level' }}</th>
                <th>{{ isArabic ? 'الإجراءات' : 'Actions' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.username }}</td>
                <td>
                  <span :class="['role-badge', user.role]">
                    {{ user.role }}
                  </span>
                </td>
                <td>{{ user.user_level !== 'None' ? user.user_level : '-' }}</td>
                <td class="actions-cell">
                  <button @click="editUser(user)" class="edit-btn">
                    {{ isArabic ? 'تعديل' : 'Edit' }}
                  </button>
                  <button @click="confirmDeleteUser(user)" class="delete-btn">
                    {{ isArabic ? 'حذف' : 'Delete' }}
                  </button>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="5" class="no-results">
                  {{ isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results found' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- User Levels Management Tab -->
    <div v-if="activeTab === 'levels'" class="tab-content">
      <div class="user-list-container">
        <div v-if="loadingLevels" class="loading-indicator">
          {{ isArabic ? 'جاري التحميل...' : 'Loading...' }}
        </div>
        <div v-else class="table-container">
          <table class="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{{ isArabic ? 'الاسم' : 'Name' }}</th>
                <th>{{ isArabic ? 'الوصف' : 'Description' }}</th>
                <th>{{ isArabic ? 'الترتيب' : 'Order' }}</th>
                <th>{{ isArabic ? 'الإجراءات' : 'Actions' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="level in userLevels" :key="level.id">
                <td>{{ level.id }}</td>
                <td>{{ level.name }}</td>
                <td>{{ level.description }}</td>
                <td>{{ level.level_order }}</td>
                <td class="actions-cell">
                  <button @click="editLevel(level)" class="edit-btn">
                    {{ isArabic ? 'تعديل' : 'Edit' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Level Assignments Tab -->
    <div v-if="activeTab === 'assignments'" class="tab-content">
      <div class="assignment-container">
        <div class="card">
          <h3>{{ isArabic ? 'تعيين مستوى للمستخدم' : 'Assign User Level' }}</h3>
          <form @submit.prevent="assignLevel">
            <div class="form-group">
              <label for="user-select">{{ isArabic ? 'المستخدم' : 'User' }}</label>
              <select id="user-select" v-model="selectedUserId" required>
                <option value="" disabled>
                  {{ isArabic ? 'اختر مستخدمًا' : 'Select a user' }}
                </option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.username }} ({{
                    user.user_level !== 'None'
                      ? user.user_level
                      : isArabic
                        ? 'غير معين'
                        : 'Not assigned'
                  }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="level-select">{{ isArabic ? 'المستوى' : 'Level' }}</label>
              <select id="level-select" v-model="selectedLevelId" required>
                <option value="" disabled>{{ isArabic ? 'اختر مستوى' : 'Select a level' }}</option>
                <option v-for="level in userLevels" :key="level.id" :value="level.level_order">
                  {{ level.name }} ({{ isArabic ? 'الترتيب' : 'Order' }}: {{ level.level_order }})
                </option>
              </select>
            </div>
            <button type="submit" class="submit-btn assign-btn">
              {{ isArabic ? 'تعيين' : 'Assign' }}
            </button>
          </form>
        </div>

        <div class="card users-by-level">
          <h3>{{ isArabic ? 'المستخدمين حسب المستوى' : 'Users by Level' }}</h3>

          <div v-for="level in userLevels" :key="level.id" class="level-group">
            <div class="level-header">
              <h4>{{ level.name }}</h4>
              <span class="level-count">
                {{ getUsersByLevel(level.name).length }} {{ isArabic ? 'مستخدم' : 'users' }}
              </span>
            </div>
            <ul class="users-list">
              <li v-for="user in getUsersByLevel(level.name)" :key="user.id">
                {{ user.username }}
              </li>
              <li v-if="getUsersByLevel(level.name).length === 0" class="no-users">
                {{ isArabic ? 'لا يوجد مستخدمين' : 'No users' }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isArabic ? 'إضافة مستخدم جديد' : 'Add New User' }}</h2>
        <form @submit.prevent="addUser">
          <div class="form-group">
            <label for="username">{{ isArabic ? 'اسم المستخدم' : 'Username' }}</label>
            <input type="text" id="username" v-model="newUser.username" required />
          </div>
          <div class="form-group">
            <label for="password">{{ isArabic ? 'كلمة المرور' : 'Password' }}</label>
            <input type="password" id="password" v-model="newUser.password" required />
          </div>
          <div class="form-group">
            <label for="role">{{ isArabic ? 'الدور' : 'Role' }}</label>
            <select id="role" v-model="newUser.role" required>
              <option value="admin">{{ isArabic ? 'مدير' : 'Admin' }}</option>
              <option value="user">{{ isArabic ? 'مستخدم' : 'User' }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddUserModal = false" class="cancel-btn">
              {{ isArabic ? 'إلغاء' : 'Cancel' }}
            </button>
            <button type="submit" class="submit-btn">
              {{ isArabic ? 'إضافة' : 'Add' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditUserModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isArabic ? 'تعديل المستخدم' : 'Edit User' }}</h2>
        <form @submit.prevent="updateUser">
          <div class="form-group">
            <label for="edit-username">{{ isArabic ? 'اسم المستخدم' : 'Username' }}</label>
            <input type="text" id="edit-username" v-model="editingUser.username" required />
          </div>
          <div class="form-group">
            <label for="edit-role">{{ isArabic ? 'الدور' : 'Role' }}</label>
            <select id="edit-role" v-model="editingUser.role" required>
              <option value="admin">{{ isArabic ? 'مدير' : 'Admin' }}</option>
              <option value="user">{{ isArabic ? 'مستخدم' : 'User' }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showEditUserModal = false" class="cancel-btn">
              {{ isArabic ? 'إلغاء' : 'Cancel' }}
            </button>
            <button type="submit" class="submit-btn">
              {{ isArabic ? 'حفظ' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Level Modal -->
    <div v-if="showEditLevelModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isArabic ? 'تعديل المستوى' : 'Edit Level' }}</h2>
        <form @submit.prevent="updateLevel">
          <div class="form-group">
            <label for="edit-level-name">{{ isArabic ? 'الاسم' : 'Name' }}</label>
            <input type="text" id="edit-level-name" v-model="editingLevel.name" required />
          </div>
          <div class="form-group">
            <label for="edit-level-description">{{ isArabic ? 'الوصف' : 'Description' }}</label>
            <textarea
              id="edit-level-description"
              v-model="editingLevel.description"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="edit-level-order">{{ isArabic ? 'الترتيب' : 'Order' }}</label>
            <input
              type="number"
              id="edit-level-order"
              v-model="editingLevel.level_order"
              readonly
              disabled
            />
            <small>{{ isArabic ? 'الترتيب لا يمكن تغييره' : 'Order cannot be changed' }}</small>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showEditLevelModal = false" class="cancel-btn">
              {{ isArabic ? 'إلغاء' : 'Cancel' }}
            </button>
            <button type="submit" class="submit-btn">
              {{ isArabic ? 'حفظ' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isArabic ? 'تأكيد الحذف' : 'Confirm Delete' }}</h2>
        <p>
          {{
            isArabic
              ? `هل أنت متأكد من أنك تريد حذف المستخدم "${userToDelete?.username}"؟`
              : `Are you sure you want to delete user "${userToDelete?.username}"?`
          }}
        </p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">
            {{ isArabic ? 'إلغاء' : 'Cancel' }}
          </button>
          <button @click="deleteUser" class="delete-confirm-btn">
            {{ isArabic ? 'حذف' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import apiService from '@/services/apiService'

// TypeScript interfaces
interface User {
  id: number
  username: string
  role: string
  user_level: string
}

interface UserLevel {
  id: number
  name: string
  description: string
  level_order: number
}

const themeStore = useThemeStore()
const isArabic = computed(() => themeStore.language === 'ar')
const isDarkMode = computed(() => themeStore.darkMode)

// Active tab
type TabType = 'users' | 'levels' | 'assignments'
const activeTab = ref<TabType>('users')

// User list data
const users = ref<User[]>([])
const loading = ref(true)

// User levels data
const userLevels = ref<UserLevel[]>([])
const loadingLevels = ref(true)

// Level assignment data
const selectedUserId = ref<number | ''>('')
const selectedLevelId = ref<number | ''>('')

// Search and filters
const userSearchQuery = ref('')
const userRoleFilter = ref('')
const userLevelFilter = ref('')

// Modal states
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const showDeleteModal = ref(false)
const showEditLevelModal = ref(false)

// User form data
const newUser = ref({
  username: '',
  password: '',
  role: 'user',
})

const editingUser = ref({
  id: null as number | null,
  username: '',
  role: '',
})

// Level form data
const editingLevel = ref({
  id: null as number | null,
  name: '',
  description: '',
  level_order: 0,
})

const userToDelete = ref<{ id: number; username: string } | null>(null)

// Feedback messages
const feedbackMessage = ref('')
const isSuccess = ref(true)

// Fetch data on component mount
onMounted(async () => {
  await refreshData()
})

// Refresh all data
async function refreshData() {
  try {
    await Promise.all([fetchUsers(), fetchUserLevels()])
    showFeedback('Data refreshed successfully')
  } catch (error) {
    console.error('Error refreshing data:', error)
    showFeedback('Error refreshing data', false)
  }
}

// Fetch all users
async function fetchUsers() {
  try {
    loading.value = true
    const response = await apiService.auth.getUsers()
    users.value = response
  } catch (error) {
    console.error('Error fetching users:', error)
    showFeedback('Error fetching users', false)
  } finally {
    loading.value = false
  }
}

// Fetch user levels
async function fetchUserLevels() {
  try {
    loadingLevels.value = true
    const response = await apiService.auth.getUserLevels()
    userLevels.value = response

    // Sort levels by their order
    userLevels.value.sort((a, b) => a.level_order - b.level_order)
  } catch (error) {
    console.error('Error fetching user levels:', error)
    showFeedback('Error fetching user levels', false)
  } finally {
    loadingLevels.value = false
  }
}

// Show feedback message
function showFeedback(message: string, success = true) {
  feedbackMessage.value = message
  isSuccess.value = success

  // Clear feedback after 3 seconds
  setTimeout(() => {
    feedbackMessage.value = ''
  }, 3000)
}

// Add new user
async function addUser() {
  try {
    await apiService.auth.registerUser(newUser.value)

    // Reset form and close modal
    newUser.value = {
      username: '',
      password: '',
      role: 'user',
    }
    showAddUserModal.value = false

    // Refresh user list
    await fetchUsers()
    showFeedback('User added successfully')
  } catch (error) {
    console.error('Error adding user:', error)
    showFeedback('Error adding user', false)
  }
}

// Edit user
function editUser(user: { id: number; username: string; role: string }) {
  editingUser.value = {
    id: user.id,
    username: user.username,
    role: user.role,
  }
  showEditUserModal.value = true
}

// Update user
async function updateUser() {
  try {
    await apiService.auth.updateUser(editingUser.value.id as number, {
      username: editingUser.value.username,
      role: editingUser.value.role,
    })

    // Close modal and refresh user list
    showEditUserModal.value = false
    await fetchUsers()
    showFeedback('User updated successfully')
  } catch (error) {
    console.error('Error updating user:', error)
    showFeedback('Error updating user', false)
  }
}

// Confirm delete user
function confirmDeleteUser(user: { id: number; username: string }) {
  userToDelete.value = {
    id: user.id,
    username: user.username,
  }
  showDeleteModal.value = true
}

// Delete user
async function deleteUser() {
  if (!userToDelete.value) return

  try {
    await apiService.auth.deleteUser(userToDelete.value.id)

    // Close modal and refresh user list
    showDeleteModal.value = false
    userToDelete.value = null
    await fetchUsers()
    showFeedback('User deleted successfully')
  } catch (error) {
    console.error('Error deleting user:', error)
    showFeedback('Error deleting user', false)
  }
}

// Edit level
function editLevel(level: { id: number; name: string; description: string; level_order: number }) {
  editingLevel.value = {
    id: level.id,
    name: level.name,
    description: level.description,
    level_order: level.level_order,
  }
  showEditLevelModal.value = true
}

// Update level
async function updateLevel() {
  try {
    await apiService.auth.updateUserLevel(editingLevel.value.id as number, {
      name: editingLevel.value.name,
      description: editingLevel.value.description,
    })

    // Close modal and refresh levels
    showEditLevelModal.value = false
    await fetchUserLevels()
    showFeedback('Level updated successfully')
  } catch (error) {
    console.error('Error updating level:', error)
    showFeedback('Error updating level', false)
  }
}

// Assign level to user
async function assignLevel() {
  if (!selectedUserId.value || !selectedLevelId.value) return

  try {
    await apiService.auth.assignUserLevel(
      selectedUserId.value as number,
      selectedLevelId.value as number,
    )

    // Reset form and refresh data
    selectedUserId.value = ''
    selectedLevelId.value = ''

    await Promise.all([fetchUsers(), fetchUserLevels()])
    showFeedback('User level assigned successfully')
  } catch (error) {
    console.error('Error assigning user level:', error)
    showFeedback('Error assigning user level', false)
  }
}

// Get users by level
function getUsersByLevel(levelName: string) {
  return users.value.filter((user) => user.user_level === levelName)
}

// Computed property for filtered users
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    // Filter by search query
    const matchesSearch =
      userSearchQuery.value === '' ||
      user.username.toLowerCase().includes(userSearchQuery.value.toLowerCase())

    // Filter by role
    const matchesRole = userRoleFilter.value === '' || user.role === userRoleFilter.value

    // Filter by level
    const matchesLevel =
      userLevelFilter.value === '' ||
      (userLevelFilter.value === 'None' && user.user_level === 'None') ||
      user.user_level === userLevelFilter.value

    return matchesSearch && matchesRole && matchesLevel
  })
})
</script>

<style scoped>
.user-management {
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

/* Theme Variables */
:root {
  --accent-color: #8a2a44;
  --accent-color-dark: #5a1c2e;
  --heading-color: #333;
  --text-color: #444;
  --bg-color: #fff;
  --card-bg: #fff;
  --border-color: rgba(0, 0, 0, 0.05);
  --hover-bg: rgba(138, 42, 68, 0.03);
  --shadow-color: rgba(0, 0, 0, 0.08);
  --btn-text: #fff;
  --success-color: #4caf50;
  --error-color: #f44336;
}

.dark-theme {
  --accent-color: #a83353;
  --accent-color-dark: #7a293d;
  --heading-color: #f0f0f0;
  --text-color: #ddd;
  --bg-color: #1a1a1a;
  --card-bg: #252525;
  --border-color: rgba(255, 255, 255, 0.07);
  --hover-bg: rgba(168, 51, 83, 0.15);
  --shadow-color: rgba(0, 0, 0, 0.3);
  --btn-text: #fff;
  --success-color: #66bb6a;
  --error-color: #e57373;
}

/* Feedback message */
.feedback-message {
  padding: 0.8rem 1.2rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-weight: 500;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.success {
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 4px solid var(--success-color);
  color: var(--success-color);
}

.error {
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 4px solid var(--error-color);
  color: var(--error-color);
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
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1px;
}

.tab-btn {
  padding: 0.8rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--accent-color);
  background-color: var(--hover-bg);
}

.tab-btn.active {
  color: var(--accent-color);
  border-bottom: 3px solid var(--accent-color);
  font-weight: 600;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

.actions {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.search-container {
  position: relative;
}

.search-input {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
  width: 250px;
  transition: all 0.2s ease;
}

[dir='rtl'] .search-input {
  padding: 0.75rem 2.5rem 0.75rem 1rem;
}

.search-input:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(138, 42, 68, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color);
  opacity: 0.6;
}

[dir='rtl'] .search-icon {
  left: auto;
  right: 0.8rem;
}

.filter-container {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
  min-width: 120px;
  transition: all 0.2s ease;
}

.filter-select:focus {
  border-color: var(--accent-color);
  outline: none;
}

.no-results {
  text-align: center;
  padding: 2rem !important;
  color: var(--text-color);
  font-style: italic;
  opacity: 0.7;
}

.add-user-btn {
  background: var(--accent-color);
  color: var(--btn-text);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.add-user-btn:hover {
  background: var(--accent-color-dark);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--hover-bg);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--accent-color);
  animation: spin 0.8s linear infinite;
}

.dark-theme .loading-spinner {
  border-color: rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-color);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Card styles for assignment view */
.assignment-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .assignment-container {
    grid-template-columns: 1fr;
  }
}

.card {
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  box-shadow: 0 4px 6px var(--shadow-color);
}

.card h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--heading-color);
  font-size: 1.3rem;
  font-weight: 600;
}

.assign-btn {
  width: 100%;
  margin-top: 1rem;
}

/* Users by level section */
.level-group {
  margin-bottom: 1.5rem;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.level-group h4 {
  color: var(--accent-color);
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.level-count {
  font-size: 0.85rem;
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-weight: 500;
}

.dark-theme .level-count {
  background-color: rgba(255, 255, 255, 0.1);
}

.users-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  padding: 0.75rem;
}

.dark-theme .users-list {
  background-color: rgba(255, 255, 255, 0.05);
}

.users-list li {
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
}

.users-list li:last-child {
  border-bottom: none;
}

.no-users {
  color: var(--text-color);
  opacity: 0.6;
  font-style: italic;
}

/* Table and loading */
.loading-indicator {
  text-align: center;
  padding: 2rem;
  font-style: italic;
  color: var(--text-color);
}

.table-container {
  overflow-x: auto;
  border-radius: 4px;
}

.table-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg);
}

.user-count {
  font-size: 0.9rem;
  color: var(--text-color);
  font-weight: 500;
}

.user-list-container {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  text-align: left;
}

.user-table th,
.user-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.user-table th {
  background-color: rgba(0, 0, 0, 0.03);
  font-weight: 600;
  color: var(--heading-color);
}

.dark-theme .user-table th {
  background-color: rgba(255, 255, 255, 0.05);
}

.user-table tr:last-child td {
  border-bottom: none;
}

.user-table tbody tr:hover td {
  background-color: rgba(0, 0, 0, 0.02);
}

.dark-theme .user-table tbody tr:hover td {
  background-color: rgba(255, 255, 255, 0.02);
}

/* Role badge */
.role-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin {
  background-color: rgba(128, 90, 213, 0.1);
  color: #805ad5;
}

.role-badge.user {
  background-color: rgba(49, 151, 149, 0.1);
  color: #319795;
}

.dark-theme .role-badge.admin {
  background-color: rgba(128, 90, 213, 0.2);
  color: #b794f4;
}

.dark-theme .role-badge.user {
  background-color: rgba(49, 151, 149, 0.2);
  color: #4fd1c5;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

/* Buttons */
.edit-btn,
.delete-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.edit-btn {
  background-color: #e0f0ff;
  color: #0078d4;
}

.delete-btn {
  background-color: #ffe0e0;
  color: #d13438;
}

.edit-btn:hover {
  background-color: #cce5ff;
}

.delete-btn:hover {
  background-color: #ffc9c9;
}

.dark-theme .edit-btn {
  background-color: rgba(0, 120, 212, 0.2);
  color: #4db5ff;
}

.dark-theme .delete-btn {
  background-color: rgba(209, 52, 56, 0.2);
  color: #ff6a6e;
}

.dark-theme .edit-btn:hover {
  background-color: rgba(0, 120, 212, 0.3);
}

.dark-theme .delete-btn:hover {
  background-color: rgba(209, 52, 56, 0.3);
}

/* Form elements */
.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--heading-color);
  font-weight: 500;
}

.form-group small {
  display: block;
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--accent-color);
  outline: none;
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled {
  background-color: rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
}

.dark-theme .form-group input:disabled,
.dark-theme .form-group select:disabled,
.dark-theme .form-group textarea:disabled {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: scaleIn 0.2s ease;
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
  color: var(--heading-color);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Button styles */
.cancel-btn,
.submit-btn,
.delete-confirm-btn {
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

.delete-confirm-btn {
  background-color: #d13438;
  color: white;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.submit-btn:hover {
  background-color: var(--accent-color-dark);
}

.delete-confirm-btn:hover {
  background-color: #bf2e32;
}

.dark-theme .cancel-btn {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .cancel-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

/* RTL adjustments */
[dir='rtl'] .user-table th,
[dir='rtl'] .user-table td {
  text-align: right;
}

[dir='rtl'] .modal-actions {
  flex-direction: row-reverse;
}

/* Dark mode harmony */
.dark-mode .user-management {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.dark-mode .user-table th {
  background-color: rgba(255, 255, 255, 0.05);
}

.dark-mode .user-table tbody tr:hover td {
  background-color: rgba(255, 255, 255, 0.02);
}

.dark-mode .add-user-btn {
  background-color: var(--accent-color);
}

.dark-mode .submit-btn {
  background-color: var(--accent-color);
}

.dark-mode .cancel-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
}

.dark-mode .delete-confirm-btn {
  background-color: rgba(209, 52, 56, 0.8);
}
</style>
