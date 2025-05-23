<!-- UserManagement.vue -->
<template>
  <div class="user-management" :class="{ 'dark-mode': isDarkMode }">
    <h1>{{ isArabic ? 'إدارة المستخدمين' : 'User Management' }}</h1>

    <div class="actions">
      <button @click="showAddUserModal = true" class="add-user-btn">
        {{ isArabic ? 'إضافة مستخدم جديد' : 'Add New User' }}
      </button>
    </div>

    <div class="user-list-container">
      <div v-if="loading" class="loading-indicator">
        {{ isArabic ? 'جاري التحميل...' : 'Loading...' }}
      </div>
      <table v-else class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>{{ isArabic ? 'اسم المستخدم' : 'Username' }}</th>
            <th>{{ isArabic ? 'الدور' : 'Role' }}</th>
            <th>{{ isArabic ? 'الإجراءات' : 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.role }}</td>
            <td class="actions-cell">
              <button @click="editUser(user)" class="edit-btn">
                {{ isArabic ? 'تعديل' : 'Edit' }}
              </button>
              <button @click="confirmDeleteUser(user)" class="delete-btn">
                {{ isArabic ? 'حذف' : 'Delete' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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

const themeStore = useThemeStore()
const isArabic = computed(() => themeStore.language === 'ar')
const isDarkMode = computed(() => themeStore.darkMode)

// User list data
const users = ref<any[]>([])
const loading = ref(true)

// Modal states
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const showDeleteModal = ref(false)

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

const userToDelete = ref<{ id: number; username: string } | null>(null)

// Using centralized apiService instead of direct axios calls

// Fetch users on component mount
onMounted(async () => {
  await fetchUsers()
})

// Fetch all users
async function fetchUsers() {
  try {
    loading.value = true
    const response = await apiService.auth.getUsers()
    users.value = response
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
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
  } catch (error) {
    console.error('Error adding user:', error)
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
  } catch (error) {
    console.error('Error updating user:', error)
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
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

// Format date
function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(isArabic.value ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
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
}

.actions {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-end;
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

/* Simplified table styles */
.user-list-container {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  overflow-x: auto;
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

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

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

/* RTL adjustments for table */
[dir='rtl'] .user-table th,
[dir='rtl'] .user-table td {
  text-align: right;
}

/* ...existing code for modals and other elements... */

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
  background-color: var(--accent-color-dark);
}
.dark-mode .cancel-btn,
.dark-mode .submit-btn,
.dark-mode .delete-confirm-btn {
  background-color: #444;
  color: #fff;
}
</style>
