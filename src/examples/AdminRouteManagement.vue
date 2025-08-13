/** * Example: Admin Panel Route Management * This example shows how to integrate navigation refresh
* with route name updates in an admin panel */

<template>
  <div class="admin-route-management">
    <h2>Route Name Management</h2>

    <form @submit.prevent="saveRouteNames">
      <div v-for="route in routes" :key="route.id" class="route-item">
        <label>{{ `Route ID: ${route.id}` }}</label>
        <input v-model="route.english_name" :placeholder="'English Name'" required />
        <input v-model="route.arabic_name" :placeholder="'Arabic Name'" required />
      </div>

      <button type="submit" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>
    </form>

    <div class="actions">
      <button @click="refreshNavigationManually" class="refresh-btn">
        Refresh Navigation Menu
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiService from '@/services/apiService'
import { refreshNavigation, refreshNavigationAsync } from '@/utils/navigationRefresh'

interface RouteData {
  id: number
  english_name: string
  arabic_name: string
}

const routes = ref<RouteData[]>([])
const isSaving = ref(false)

// Load current route names
const loadRoutes = async () => {
  try {
    const response = await apiService.accountsEntities.getMainRoutes()
    if (response.data) {
      routes.value = response.data
    }
  } catch (error) {
    console.error('Error loading routes:', error)
  }
}

// Save updated route names
const saveRouteNames = async () => {
  try {
    isSaving.value = true

    // Example API call to save route names
    // Replace with your actual API endpoint
    await apiService.accountsEntities.updateMainRoutes(routes.value)

    // Trigger navigation menu refresh
    await refreshNavigationAsync()

    // Show success message
    alert('Route names updated successfully!')
  } catch (error) {
    console.error('Error saving routes:', error)
    alert('Error saving route names. Please try again.')
  } finally {
    isSaving.value = false
  }
}

// Manual refresh for testing
const refreshNavigationManually = () => {
  refreshNavigation()
  alert('Navigation refresh triggered!')
}

onMounted(() => {
  loadRoutes()
})
</script>

<style scoped>
.admin-route-management {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.route-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.route-item label {
  min-width: 100px;
  font-weight: 600;
}

.route-item input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: #e14b6a;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

button:hover {
  background: #c73650;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.actions {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.refresh-btn {
  background: #28a745;
}

.refresh-btn:hover {
  background: #218838;
}
</style>
