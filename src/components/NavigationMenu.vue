<!-- NavigationMenu.vue -->
<template>
  <nav class="navigation-menu" :class="{ 'dark-theme': isDarkMode }">
    <div class="container">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="loading-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>

      <!-- Desktop scroll controls -->
      <div v-else class="nav-container">
        <!-- Left scroll button -->
        <button
          v-if="showScrollButtons && canScrollLeft"
          @click="scrollLeft"
          class="scroll-button scroll-left"
          :class="{ 'dark-theme': isDarkMode }"
          aria-label="Scroll left"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <!-- Navigation links -->
        <ul
          ref="navLinksRef"
          class="nav-links"
          @scroll="updateScrollButtons"
          @keydown="handleKeyNavigation"
          tabindex="0"
        >
          <li
            v-for="item in menuItems"
            :key="item.label"
            :class="{ active: currentRoute === item.route }"
          >
            <router-link :to="{ name: item.route }">
              {{ item.label }}
            </router-link>
          </li>

          <!-- Admin links shown directly if user is admin -->
          <template v-if="isAdminUser">
            <li
              v-for="adminItem in adminMenuItems"
              :key="adminItem.route"
              :class="{ active: currentRoute === adminItem.route }"
            >
              <router-link :to="{ name: adminItem.route }">
                {{ adminItem.label }}
              </router-link>
            </li>
          </template>

          <!-- example dropdown (optional) -->
          <li class="dropdown" v-if="dropdownItem">
            <div @click="dropdownOpen = !dropdownOpen" class="dropdown-toggle">
              {{ dropdownItem.label }}
              <i class="fas fa-chevron-down"></i>
            </div>
            <ul v-if="dropdownOpen" class="dropdown-menu">
              <li v-for="sub in dropdownItem.dropdownItems" :key="sub.label">
                <router-link :to="{ name: sub.route }">
                  {{ sub.label }}
                </router-link>
              </li>
            </ul>
          </li>
        </ul>

        <!-- Right scroll button -->
        <button
          v-if="showScrollButtons && canScrollRight"
          @click="scrollRight"
          class="scroll-button scroll-right"
          :class="{ 'dark-theme': isDarkMode }"
          aria-label="Scroll right"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import apiService from '@/services/apiService'

// Define interfaces for menu items
interface MenuItem {
  label: string
  route: string
}

interface DropdownItem {
  label: string
  dropdownItems: MenuItem[]
}

interface RouteData {
  id: number
  english_name: string
  arabic_name: string
}

const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const currentRoute = computed(() => route.name)
const dropdownOpen = ref(false)

// Reactive state for routes data - simplified, no caching
const routesData = ref<RouteData[]>([])
const isLoading = ref(true)

// Check if user is an admin
const isAdminUser = computed(() => {
  return authStore.user?.role === 'admin'
})

// Define dropdownItem with proper typing
const dropdownItem = ref<DropdownItem | null>(null)

// Scroll functionality for desktop
const navLinksRef = ref<HTMLUListElement | null>(null)
const showScrollButtons = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')

// Scroll functions
const scrollLeft = () => {
  if (navLinksRef.value) {
    navLinksRef.value.scrollBy({
      left: -200,
      behavior: 'smooth',
    })
  }
}

const scrollRight = () => {
  if (navLinksRef.value) {
    navLinksRef.value.scrollBy({
      left: 200,
      behavior: 'smooth',
    })
  }
}

const updateScrollButtons = () => {
  if (navLinksRef.value) {
    const element = navLinksRef.value
    const scrollLeft = element.scrollLeft
    const scrollWidth = element.scrollWidth
    const clientWidth = element.clientWidth

    canScrollLeft.value = scrollLeft > 0
    canScrollRight.value = scrollLeft < scrollWidth - clientWidth
    showScrollButtons.value = scrollWidth > clientWidth
  }
}

// Check scroll on resize and mount
const checkScrollNeeded = () => {
  setTimeout(() => {
    updateScrollButtons()
  }, 100)
}

// Scroll to active item on route change
const scrollToActiveItem = () => {
  if (navLinksRef.value) {
    const activeItem = navLinksRef.value.querySelector('li.active')
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }
}

// Handle keyboard navigation for accessibility
const handleKeyNavigation = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    const scrollAmount = 200
    if (navLinksRef.value) {
      if (event.key === 'ArrowLeft') {
        navLinksRef.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      } else {
        navLinksRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }
}

// Mapping between route IDs and Vue Router route names
const routeIdToRouteName: Record<number, string> = {
  2: 'Dashboard',
  3: 'Home',
  4: 'Settlements',
  5: 'Enhancements',
  6: 'EnhancementsPendingApproval',
  7: 'ContractsPendingApproval',
  8: 'SettlementsPendingApproval',
  9: 'UserManagement',
  10: 'AccountEntityManagement',
  11: 'AccountsEntityView',
  12: 'Controller',
}

// Routes to hide when user_level = 1
const restrictedRouteIds = [6, 7, 8] // EnhancementsPendingApproval, ContractsPendingApproval, SettlementsPendingApproval

// Mapping for admin routes (these should only show for admin users)
const adminRouteIds = [9, 10, 11, 12] // User Management, Account-Entity Management, Accounts & Entities, Controller

// Simple function to fetch routes data from API - no caching
const fetchRoutesData = async () => {
  try {
    isLoading.value = true

    const response = await apiService.accountEntities.getMainRoutes()
    if (response.data && Array.isArray(response.data)) {
      routesData.value = response.data
    } else {
      throw new Error('Invalid response format')
    }
  } catch (error) {
    console.error('Error fetching routes data:', error)

    // Fallback to static data only if API fails completely
    routesData.value = [
      { id: 2, english_name: 'Dashboard', arabic_name: 'لوحة القيادة' },
      { id: 3, english_name: 'Transfer', arabic_name: 'المناقلات' },
      { id: 4, english_name: 'Fund Adjustment Department', arabic_name: 'التسويه' },
      { id: 5, english_name: 'Additional Fund Request', arabic_name: 'التعزيزات' },
      { id: 6, english_name: 'Pending Transfers', arabic_name: 'التعزيزات قيد الاعتماد' },
      { id: 7, english_name: 'Pending Fund Adjustment', arabic_name: 'العقود قيد الاعتماد' },
      { id: 8, english_name: 'Pending Additional Fund', arabic_name: 'التسويات قيد الاعتماد' },
      { id: 9, english_name: 'User Management', arabic_name: 'إدارة المستخدمين' },
      {
        id: 10,
        english_name: 'Account-Entity Management',
        arabic_name: 'إدارة الحسابات والكيانات',
      },
      { id: 11, english_name: 'Accounts & Entities', arabic_name: 'الحسابات والكيانات' },
      { id: 12, english_name: 'Control', arabic_name: 'التحكم' },
    ]
  } finally {
    isLoading.value = false
  }
}

// Create computed properties for menu items based on fetched data
const menuItems = computed(() => {
  if (isLoading.value || !routesData.value.length) {
    return []
  }

  return routesData.value
    .filter((route) => {
      // Exclude admin routes from regular menu
      if (adminRouteIds.includes(route.id)) {
        return false
      }

      // Hide restricted routes if user_level is 1
      if (authStore.userLevel === 1 && restrictedRouteIds.includes(route.id)) {
        return false
      }

      return routeIdToRouteName[route.id]
    })
    .sort((a, b) => a.id - b.id) // Sort by ID to maintain consistent order
    .map((route) => ({
      label: isArabic.value ? route.arabic_name : route.english_name,
      route: routeIdToRouteName[route.id],
    }))
    .filter((item) => item.route) // Ensure we have a valid route
})

const adminMenuItems = computed(() => {
  if (isLoading.value || !routesData.value.length) {
    return []
  }

  return routesData.value
    .filter((route) => {
      // Only include admin routes
      return adminRouteIds.includes(route.id) && routeIdToRouteName[route.id]
    })
    .sort((a, b) => a.id - b.id) // Sort by ID to maintain consistent order
    .map((route) => ({
      label: isArabic.value ? route.arabic_name : route.english_name,
      route: routeIdToRouteName[route.id],
    }))
    .filter((item) => item.route) // Ensure we have a valid route
})

// Fetch data only on component mount (page refresh)
onMounted(() => {
  fetchRoutesData()

  // Add window resize listener to check scroll buttons
  window.addEventListener('resize', checkScrollNeeded)

  // Initial check after mounting
  setTimeout(() => {
    checkScrollNeeded()
  }, 100)
})

// Watch for changes in menu items to update scroll buttons
watch([menuItems, adminMenuItems], () => {
  nextTick(() => {
    checkScrollNeeded()
  })
})

// Watch for route changes to scroll to active item
watch(currentRoute, () => {
  nextTick(() => {
    scrollToActiveItem()
  })
})
</script>

<style scoped>
.navigation-menu {
  position: sticky;
  background: linear-gradient(135deg, #fff6fa 0%, #f8f6f8 35%, #e4c9d6 70%, #8a2a44 100%);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: #1a1423;
  z-index: 90;
  box-shadow:
    0 8px 32px rgba(138, 42, 68, 0.15),
    0 2px 8px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid #e4c9d6;
  padding: 4px 0;
  position: relative;
  overflow: hidden;
}

.navigation-menu::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.1), transparent);
  animation: shimmer 3s infinite;
}

.navigation-menu.dark-theme {
  background: linear-gradient(135deg, #241726 0%, #18131a 35%, #51203c 70%, #6d1a36 100%);
  color: #f8e9f0;
  box-shadow:
    0 8px 32px rgba(167, 56, 92, 0.25),
    0 2px 8px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
  border-bottom: 1px solid #51203c;
}

.navigation-menu.dark-theme::before {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.2), transparent);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 56px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 24px;
  position: relative;
  background: rgba(255, 246, 250, 0.1);
  border-radius: 16px;
  margin: 4px 12px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.navigation-menu.dark-theme .container {
  background: rgba(36, 23, 38, 0.3);
}

.container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 2px;
  width: 60%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #e14b6a 20%,
    #8a2a44 50%,
    #e14b6a 80%,
    transparent 100%
  );
  opacity: 0.6;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}

.navigation-menu.dark-theme .container::after {
  background: linear-gradient(
    90deg,
    transparent 0%,
    #e14b6a 20%,
    #a7385c 50%,
    #e14b6a 80%,
    transparent 100%
  );
}

[dir='rtl'] .container {
  justify-content: flex-start;
}

/* Navigation container with scroll buttons */
.nav-container {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  gap: 8px;
}

/* Scroll buttons */
.scroll-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 246, 250, 0.8);
  color: #8a2a44;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  flex-shrink: 0;
  box-shadow:
    0 4px 12px rgba(138, 42, 68, 0.15),
    0 2px 6px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(228, 201, 214, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.scroll-button.dark-theme {
  background: rgba(36, 23, 38, 0.8);
  color: #e14b6a;
  box-shadow:
    0 4px 12px rgba(167, 56, 92, 0.25),
    0 2px 6px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
  border: 1px solid rgba(81, 32, 60, 0.5);
}

.scroll-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.2), transparent);
  transition: left 0.4s ease-in-out;
}

.scroll-button.dark-theme::before {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.3), transparent);
}

.scroll-button:hover {
  background: rgba(225, 75, 106, 0.15);
  color: #6d1a36;
  transform: translateY(-2px) scale(1.05);
  box-shadow:
    0 6px 16px rgba(138, 42, 68, 0.25),
    0 3px 8px rgba(138, 42, 68, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border-color: #e14b6a;
}

.scroll-button.dark-theme:hover {
  background: rgba(225, 75, 106, 0.25);
  color: #f8e9f0;
  box-shadow:
    0 6px 16px rgba(167, 56, 92, 0.35),
    0 3px 8px rgba(167, 56, 92, 0.25),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
  border-color: #e14b6a;
}

.scroll-button:hover::before {
  left: 0;
}

.scroll-button:active {
  transform: translateY(0) scale(0.98);
  transition: transform 0.1s ease-in-out;
}

.scroll-button i {
  font-size: 16px;
  font-weight: 600;
  filter: drop-shadow(0 0 2px rgba(138, 42, 68, 0.3));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-button.dark-theme i {
  filter: drop-shadow(0 0 2px rgba(225, 75, 106, 0.5));
}

.scroll-button:hover i {
  transform: scale(1.1);
  filter: drop-shadow(0 0 4px rgba(225, 75, 106, 0.5));
}

.scroll-button.dark-theme:hover i {
  filter: drop-shadow(0 0 4px rgba(225, 75, 106, 0.7));
}

/* Animation for scroll buttons appearing */
.scroll-button {
  animation: scrollButtonFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scrollButtonFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: none;
  -ms-overflow-style: none;
  gap: 6px;
  align-items: center;
  scroll-behavior: smooth;
  max-width: calc(100% - 96px); /* Account for scroll buttons when visible */
  outline: none;
}

.nav-links:focus {
  box-shadow:
    inset 0 0 0 2px rgba(225, 75, 106, 0.5),
    0 0 0 4px rgba(225, 75, 106, 0.2);
  border-radius: 12px;
}

.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-links li {
  margin: 0;
  white-space: nowrap;
  position: relative;
}

.nav-links a {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.2rem;
  margin: 0.5rem 0;
  color: #1a1423;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
  background: rgba(255, 246, 250, 0.4);
  border: 1px solid rgba(228, 201, 214, 0.3);
  box-shadow:
    0 2px 8px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.navigation-menu.dark-theme .nav-links a {
  color: #f8e9f0;
  background: rgba(36, 23, 38, 0.6);
  border: 1px solid rgba(81, 32, 60, 0.4);
  box-shadow:
    0 2px 8px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

.nav-links a::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.15), transparent);
  transition: left 0.5s ease-in-out;
}

.navigation-menu.dark-theme .nav-links a::before {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.25), transparent);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #e14b6a, #8a2a44, #e14b6a);
  transform: translateX(-50%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(225, 75, 106, 0.4);
}

.navigation-menu.dark-theme .nav-links a::after {
  background: linear-gradient(90deg, #e14b6a, #a7385c, #e14b6a);
  box-shadow: 0 0 12px rgba(225, 75, 106, 0.6);
}

.nav-links li.active > a {
  color: #6d1a36;
  background: linear-gradient(135deg, #fff6fa, #f8f6f8);
  font-weight: 700;
  box-shadow:
    0 6px 20px rgba(138, 42, 68, 0.25),
    0 2px 8px rgba(138, 42, 68, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  border: 1px solid #e14b6a;
}

.navigation-menu.dark-theme .nav-links li.active > a {
  color: #f8e9f0;
  background: linear-gradient(135deg, #a7385c, #6d1a36);
  box-shadow:
    0 6px 20px rgba(167, 56, 92, 0.35),
    0 2px 8px rgba(167, 56, 92, 0.25),
    inset 0 1px 0 rgba(248, 233, 240, 0.2);
  border: 1px solid #e14b6a;
}

.nav-links li.active > a::after {
  width: 90%;
  height: 3px;
  background: linear-gradient(90deg, #e14b6a, #8a2a44, #e14b6a);
  box-shadow:
    0 0 16px rgba(225, 75, 106, 0.6),
    0 0 8px rgba(138, 42, 68, 0.4);
}

.navigation-menu.dark-theme .nav-links li.active > a::after {
  background: linear-gradient(90deg, #e14b6a, #a7385c, #e14b6a);
  box-shadow:
    0 0 16px rgba(225, 75, 106, 0.8),
    0 0 8px rgba(167, 56, 92, 0.6);
}

.nav-links a:hover {
  color: #6d1a36;
  transform: translateY(-2px);
  background: rgba(255, 246, 250, 0.8);
  border-color: #e14b6a;
  box-shadow:
    0 4px 16px rgba(138, 42, 68, 0.2),
    0 2px 8px rgba(138, 42, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.navigation-menu.dark-theme .nav-links a:hover {
  color: #f8e9f0;
  background: rgba(36, 23, 38, 0.9);
  border-color: #e14b6a;
  box-shadow:
    0 4px 16px rgba(167, 56, 92, 0.3),
    0 2px 8px rgba(167, 56, 92, 0.2),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
}

.nav-links a:hover::before {
  left: 0;
}

.nav-links a:hover::after {
  width: 70%;
}

/* dropdown */
.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1a1423;
  position: relative;
  overflow: hidden;
  font-weight: 600;
  background: rgba(255, 246, 250, 0.4);
  border: 1px solid rgba(228, 201, 214, 0.3);
  box-shadow:
    0 2px 8px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.navigation-menu.dark-theme .dropdown-toggle {
  color: #f8e9f0;
  background: rgba(36, 23, 38, 0.6);
  border: 1px solid rgba(81, 32, 60, 0.4);
  box-shadow:
    0 2px 8px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

.dropdown-toggle i {
  font-size: 14px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 2px rgba(225, 75, 106, 0.3));
}

.navigation-menu.dark-theme .dropdown-toggle i {
  filter: drop-shadow(0 0 2px rgba(225, 75, 106, 0.5));
}

.dropdown-toggle i.open {
  transform: rotate(180deg);
}

.dropdown-toggle:hover {
  color: #6d1a36;
  transform: translateY(-2px);
  background: rgba(255, 246, 250, 0.8);
  border-color: #e14b6a;
  box-shadow:
    0 4px 16px rgba(138, 42, 68, 0.2),
    0 2px 8px rgba(138, 42, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.navigation-menu.dark-theme .dropdown-toggle:hover {
  color: #f8e9f0;
  background: rgba(36, 23, 38, 0.9);
  border-color: #e14b6a;
  box-shadow:
    0 4px 16px rgba(167, 56, 92, 0.3),
    0 2px 8px rgba(167, 56, 92, 0.2),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
}

.dropdown-toggle:hover i {
  transform: translateY(2px) rotate(180deg);
}

.dropdown-toggle::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.15), transparent);
  transition: left 0.5s ease-in-out;
}

.navigation-menu.dark-theme .dropdown-toggle::before {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.25), transparent);
}

.dropdown-toggle:hover::before {
  left: 0;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  background: rgba(255, 246, 250, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  list-style: none;
  margin: 0;
  padding: 0.75rem;
  border-radius: 16px;
  box-shadow:
    0 12px 40px rgba(138, 42, 68, 0.2),
    0 4px 16px rgba(138, 42, 68, 0.1),
    0 0 0 1px rgba(228, 201, 214, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  overflow: hidden;
  z-index: 100;
  min-width: 220px;
  opacity: 0;
  transform: translateY(10px) scale(0.95);
  transition:
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(228, 201, 214, 0.4);
}

.navigation-menu.dark-theme .dropdown-menu {
  background: rgba(36, 23, 38, 0.95);
  box-shadow:
    0 12px 40px rgba(167, 56, 92, 0.3),
    0 4px 16px rgba(167, 56, 92, 0.2),
    0 0 0 1px rgba(81, 32, 60, 0.4),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
  border: 1px solid rgba(81, 32, 60, 0.5);
}

.dropdown-menu.open {
  opacity: 1;
  transform: translateY(0) scale(1);
}

[dir='ltr'] .dropdown-menu {
  left: 0;
  right: auto;
}

[dir='rtl'] .dropdown-menu {
  right: 0;
  left: auto;
}

.dropdown-menu li {
  width: 100%;
  margin-bottom: 4px;
}

.dropdown-menu li:last-child {
  margin-bottom: 0;
}

.dropdown-menu li a {
  padding: 0.8rem 1rem;
  display: block;
  white-space: nowrap;
  border-radius: 10px;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1a1423;
  font-weight: 600;
  letter-spacing: 0.01em;
  background: rgba(255, 246, 250, 0.3);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.navigation-menu.dark-theme .dropdown-menu li a {
  color: #f8e9f0;
  background: rgba(36, 23, 38, 0.5);
}

.dropdown-menu li a::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.1), transparent);
  transition: left 0.3s ease-in-out;
}

.navigation-menu.dark-theme .dropdown-menu li a::before {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.2), transparent);
}

.dropdown-menu li a:hover {
  background: rgba(225, 75, 106, 0.1);
  color: #6d1a36;
  transform: translateX(4px);
  border-color: rgba(225, 75, 106, 0.3);
  box-shadow:
    0 4px 12px rgba(138, 42, 68, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.navigation-menu.dark-theme .dropdown-menu li a:hover {
  background: rgba(225, 75, 106, 0.2);
  color: #f8e9f0;
  border-color: rgba(225, 75, 106, 0.4);
  box-shadow:
    0 4px 12px rgba(167, 56, 92, 0.25),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
}

.dropdown-menu li a:hover::before {
  left: 0;
}

/* Arabic font size adjustment for navbar */
[dir='rtl'] .nav-links a {
  font-size: 0.95rem;
  letter-spacing: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding: 0 12px;
    margin: 4px 8px;
  }

  .nav-links a {
    padding: 0.7rem 0.9rem;
    font-size: 0.9rem;
    letter-spacing: 0;
  }

  .dropdown-toggle {
    padding: 0.7rem 0.9rem;
  }

  /* Adjust scroll buttons for mobile */
  .scroll-button {
    width: 36px;
    height: 36px;
  }

  .scroll-button i {
    font-size: 14px;
  }

  .nav-links {
    max-width: calc(100% - 80px); /* Smaller buttons on mobile */
  }
}

/* Hide scroll buttons on very small screens where touch scrolling is preferred */
@media (max-width: 480px) {
  .scroll-button {
    display: none;
  }

  .nav-links {
    max-width: 100%;
  }
}

/* Futuristic animations */
@keyframes shimmer {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes pulse-glow {
  0% {
    box-shadow:
      0 6px 20px rgba(138, 42, 68, 0.25),
      0 2px 8px rgba(138, 42, 68, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }
  50% {
    box-shadow:
      0 8px 24px rgba(225, 75, 106, 0.35),
      0 4px 12px rgba(225, 75, 106, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  100% {
    box-shadow:
      0 6px 20px rgba(138, 42, 68, 0.25),
      0 2px 8px rgba(138, 42, 68, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }
}

.nav-links li.active > a {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Enhanced hover effects for better interactivity */
.nav-links a:active {
  transform: translateY(0);
  transition: transform 0.1s ease-in-out;
}

.dropdown-toggle:active {
  transform: translateY(0);
  transition: transform 0.1s ease-in-out;
}

/* Smooth transitions for theme switching */
.navigation-menu,
.navigation-menu * {
  transition-property: color, background-color, border-color, box-shadow, transform;
  transition-duration: 0.4s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Loading indicator styles */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  width: 100%;
}

.loading-dots {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e14b6a, #8a2a44);
  animation: loading-pulse 1.4s ease-in-out infinite both;
}

.navigation-menu.dark-theme .dot {
  background: linear-gradient(90deg, #e14b6a, #a7385c);
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes loading-pulse {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Robot container and button styles */
.robot-container {
  margin-left: 16px;
  display: flex;
  align-items: center;
}

.sleeping-robot {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.sleeping-robot:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.sleeping-robot.dark-theme {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
}

.sleeping-robot.dark-theme:hover {
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
}

.robot-icon {
  position: relative;
  z-index: 2;
  color: white;
  transition: all 0.3s ease;
}

.robot-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sleeping-robot:hover .robot-glow {
  opacity: 1;
}

/* Robot states */
.sleeping-robot.sleeping .robot-svg {
  animation: gentle-bob 3s ease-in-out infinite;
}

.sleeping-robot.waking .robot-svg {
  animation: wake-up 0.5s ease-out;
}

.sleeping-robot.awake .robot-svg {
  animation: excited-bounce 0.6s ease-out;
}

/* Robot SVG animations */
.robot-svg {
  transition: all 0.3s ease;
}

.sleeping .robot-svg .left-eye,
.sleeping .robot-svg .right-eye {
  animation: blink 4s ease-in-out infinite;
}

.sleeping .robot-svg .left-pupil,
.sleeping .robot-svg .right-pupil {
  transform: translateY(1px);
  opacity: 0.3;
}

.waking .robot-svg .left-pupil,
.waking .robot-svg .right-pupil {
  animation: eyes-open 0.5s ease-out;
}

.awake .robot-svg .antenna {
  animation: antenna-wiggle 0.3s ease-in-out 2;
}

/* Sleep indicators animation */
.sleep-indicators text {
  animation: float-up 2s ease-in-out infinite;
}

.sleep-indicators text:nth-child(2) {
  animation-delay: 0.3s;
}

.sleep-indicators text:nth-child(3) {
  animation-delay: 0.6s;
}

/* Floating robot for animation */
.robot-floating {
  transform-origin: center;
  filter: drop-shadow(0 4px 20px rgba(102, 126, 234, 0.6));
}

/* Keyframe animations */
@keyframes gentle-bob {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes wake-up {
  0% {
    transform: scale(1) rotate(0deg);
  }
  30% {
    transform: scale(1.1) rotate(-5deg);
  }
  60% {
    transform: scale(1.05) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes excited-bounce {
  0%,
  100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.15);
  }
  50% {
    transform: scale(1.05);
  }
  75% {
    transform: scale(1.1);
  }
}

@keyframes blink {
  0%,
  90%,
  100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
}

@keyframes eyes-open {
  0% {
    transform: translateY(1px);
    opacity: 0.3;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes antenna-wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

@keyframes float-up {
  0% {
    opacity: 0.7;
    transform: translateY(0px);
  }
  50% {
    opacity: 0.3;
    transform: translateY(-8px);
  }
  100% {
    opacity: 0;
    transform: translateY(-16px);
  }
}

/* RTL support for robot */
[dir='rtl'] .robot-container {
  margin-left: 0;
  margin-right: 16px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .robot-container {
    margin-left: 8px;
  }

  [dir='rtl'] .robot-container {
    margin-left: 0;
    margin-right: 8px;
  }

  .sleeping-robot {
    width: 40px;
    height: 40px;
  }

  .robot-icon svg {
    width: 24px;
    height: 24px;
  }
}
</style>
