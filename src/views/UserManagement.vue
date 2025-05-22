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
    await axios.delete(`${BASE_URL}/api/auth/users/?pk=${userToDelete.value.id}`, {
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
}

h1 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
}

.actions {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.add-user-btn {
  background: linear-gradient(135deg, #8a2a44, #5a1c2e);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.add-user-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.user-list-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.user-table th {
  background: rgba(138, 42, 68, 0.05);
  font-weight: 600;
  color: #333;
}

.user-table tr:last-child td {
  border-bottom: none;
}

.user-table tr:hover td {
  background: rgba(138, 42, 68, 0.03);
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.edit-btn {
  background: rgba(0, 120, 212, 0.1);
  color: #0078d4;
}

.delete-btn {
  background: rgba(209, 52, 56, 0.1);
  color: #d13438;
}

.edit-btn:hover {
  background: rgba(0, 120, 212, 0.2);
}

.delete-btn:hover {
  background: rgba(209, 52, 56, 0.2);
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
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
.submit-btn,
.delete-confirm-btn {
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

.delete-confirm-btn {
  background: #d13438;
  color: white;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #9b3050, #6b2237);
}

.delete-confirm-btn:hover {
  background: #e04146;
}

.loading-indicator {
  padding: 2rem;
  text-align: center;
  color: #666;
  font-style: italic;
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
