<!-- UserManagement.vue -->
<template>
  <div class="user-management">
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
            <th>{{ isArabic ? 'تاريخ الانضمام' : 'Date Joined' }}</th>
            <th>{{ isArabic ? 'الإجراءات' : 'Actions' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.role }}</td>
            <td>{{ formatDate(user.date_joined) }}</td>
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
            <input 
              type="text" 
              id="username" 
              v-model="newUser.username" 
              required
            />
          </div>
          <div class="form-group">
            <label for="password">{{ isArabic ? 'كلمة المرور' : 'Password' }}</label>
            <input 
              type="password" 
              id="password" 
              v-model="newUser.password" 
              required
            />
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
            <input 
              type="text" 
              id="edit-username" 
              v-model="editingUser.username" 
              required
            />
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
          {{ isArabic 
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
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const isArabic = computed(() => themeStore.language === 'ar')

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

const userToDelete = ref<{ id: number, username: string } | null>(null)

// API URLs
const BASE_URL = 'http://localhost:8000'

// Fetch users on component mount
onMounted(async () => {
  await fetchUsers()
})

// Fetch all users
async function fetchUsers() {
  try {
    loading.value = true
    const response = await axios.get(`${BASE_URL}/api/auth/users/`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

// Add new user
async function addUser() {
  try {
    await axios.post(`${BASE_URL}/api/auth/register/`, newUser.value, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
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
function editUser(user: any) {
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
    await axios.put(`${BASE_URL}/api/auth/users/update/?pk=${editingUser.value.id}`, {
      username: editingUser.value.username,
      role: editingUser.value.role
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    // Close modal and refresh user list
    showEditUserModal.value = false
    await fetchUsers()
  } catch (error) {
    console.error('Error updating user:', error)
  }
}

// Confirm delete user
function confirmDeleteUser(user: any) {
  userToDelete.value = {
    id: user.id,
    username: user.username
  }
  showDeleteModal.value = true
}

// Delete user
async function deleteUser() {
  if (!userToDelete.value) return
  
  try {
    await axios.delete(`${BASE_URL}/api/auth/users/delete/?pk=${userToDelete.value.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
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
    minute: '2-digit'
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
  background: linear-gradient(135deg, var(--accent-color), var(--accent-color-dark));
  color: var(--btn-text);
  border: none;
  padding: 0.85rem 1.8rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 
    0 4px 12px rgba(0,0,0,0.12),
    0 0 0 1px rgba(255,255,255,0.1) inset;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-user-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.1), rgba(255,255,255,0));
  transform: translateX(-100%);
  transition: transform 0.8s ease;
}

.add-user-btn:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 8px 20px rgba(0,0,0,0.15),
    0 0 0 1px rgba(255,255,255,0.15) inset;
}

.add-user-btn:hover::before {
  transform: translateX(100%);
}

.add-user-btn:active {
  transform: translateY(-1px);
}

.user-list-container {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 
    0 8px 30px var(--shadow-color),
    0 0 0 1px var(--border-color);
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.user-table th,
.user-table td {
  padding: 1.2rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.user-table th {
  background: rgba(var(--accent-color-rgb, 138, 42, 68), 0.08);
  font-weight: 600;
  color: var(--heading-color);
  position: relative;
  overflow: hidden;
}

.user-table th::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-color), transparent);
  opacity: 0.3;
}

[dir='rtl'] .user-table th::after {
  background: linear-gradient(90deg, transparent, var(--accent-color));
}

.user-table tr:last-child td {
  border-bottom: none;
}

.user-table tr {
  transition: all 0.2s ease;
  position: relative;
}

.user-table tbody tr:hover td {
  background: var(--hover-bg);
}

.user-table tbody tr::before {
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

[dir='rtl'] .user-table tbody tr::before {
  left: auto;
  right: 0;
}

.user-table tbody tr:hover::before {
  opacity: 1;
}

.actions-cell {
  display: flex;
  gap: 0.8rem;
}

.edit-btn, .delete-btn {
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
}

.edit-btn {
  background: rgba(0, 120, 212, 0.1);
  color: #0078d4;
}

.dark-theme .edit-btn {
  background: rgba(0, 120, 212, 0.2);
  color: #4db5ff;
}

.delete-btn {
  background: rgba(209, 52, 56, 0.1);
  color: #d13438;
}

.dark-theme .delete-btn {
  background: rgba(209, 52, 56, 0.2);
  color: #ff6a6e;
}

.edit-btn::before, .delete-btn::before {
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

.edit-btn:hover, .delete-btn:hover {
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

.delete-btn:hover::before {
  opacity: 1;
  background: #d13438;
}

.dark-theme .delete-btn:hover::before {
  background: #eb4d51;
}

.edit-btn:active, .delete-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.edit-btn > *, .delete-btn > * {
  position: relative;
  z-index: 1;
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
    0 0 0 3px rgba(var(--accent-color-rgb, 138, 42, 68), 0.1);
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

.form-group input,
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
}

.dark-theme .form-group input,
.dark-theme .form-group select {
  background: rgba(0,0,0,0.2);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2) inset;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 
    0 0 0 3px rgba(var(--accent-color-rgb, 138, 42, 68), 0.15),
    0 1px 2px rgba(0,0,0,0.05) inset;
}

.form-group input::placeholder {
  color: rgba(var(--text-color-rgb, 68, 68, 68), 0.5);
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
.submit-btn,
.delete-confirm-btn {
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
  background: rgba(var(--text-color-rgb, 68, 68, 68), 0.08);
  color: var(--text-color);
}

.dark-theme .cancel-btn {
  background: rgba(255, 255, 255, 0.1);
}

.submit-btn {
  background: linear-gradient(135deg, var(--accent-color), var(--accent-color-dark));
  color: white;
  box-shadow: 
    0 4px 15px rgba(var(--accent-color-rgb, 138, 42, 68), 0.25),
    0 0 0 1px rgba(var(--accent-color-rgb, 138, 42, 68), 0.3);
}

.delete-confirm-btn {
  background: linear-gradient(135deg, #d13438, #bf2e32);
  color: white;
  box-shadow: 
    0 4px 15px rgba(209, 52, 56, 0.25),
    0 0 0 1px rgba(209, 52, 56, 0.3);
}

.cancel-btn::before,
.submit-btn::before,
.delete-confirm-btn::before {
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
.submit-btn:hover,
.delete-confirm-btn:hover {
  transform: translateY(-3px);
}

.cancel-btn:hover {
  background: rgba(var(--text-color-rgb, 68, 68, 68), 0.12);
}

.dark-theme .cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.submit-btn:hover {
  box-shadow: 
    0 8px 25px rgba(var(--accent-color-rgb, 138, 42, 68), 0.35),
    0 0 0 1px rgba(var(--accent-color-rgb, 138, 42, 68), 0.4);
}

.delete-confirm-btn:hover {
  box-shadow: 
    0 8px 25px rgba(209, 52, 56, 0.35),
    0 0 0 1px rgba(209, 52, 56, 0.4);
}

.cancel-btn:hover::before,
.submit-btn:hover::before,
.delete-confirm-btn:hover::before {
  transform: translateX(100%);
}

.cancel-btn:active,
.submit-btn:active,
.delete-confirm-btn:active {
  transform: translateY(-1px);
}

.loading-indicator {
  padding: 3rem;
  text-align: center;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
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

/* RTL adjustments */
[dir='rtl'] .user-table th,
[dir='rtl'] .user-table td {
  text-align: right;
}

[dir='rtl'] .actions {
  justify-content: flex-start;
}

[dir='rtl'] .modal-actions {
  justify-content: flex-start;
}
</style>
