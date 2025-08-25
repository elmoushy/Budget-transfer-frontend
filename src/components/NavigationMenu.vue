<!-- NavigationMenu.vue -->
<template>
  <nav :class="[styles.navigationMenu, { [styles.darkTheme]: isDarkMode }]">
    <div :class="styles.container">
      <!-- Loading indicator -->
      <div v-if="isLoading" :class="styles.loadingIndicator">
        <div :class="styles.loadingDots">
          <div :class="styles.dot"></div>
          <div :class="styles.dot"></div>
          <div :class="styles.dot"></div>
        </div>
      </div>

      <!-- Desktop scroll controls -->
      <div v-else :class="styles.navContainer">
        <!-- Left scroll button -->
        <button
          v-if="showScrollButtons && canScrollLeft"
          @click="scrollLeft"
          :class="[styles.scrollButton, styles.scrollLeft, { [styles.darkTheme]: isDarkMode }]"
          aria-label="Scroll left"
        >
          <i :class="['fas', isArabic ? 'fa-chevron-right' : 'fa-chevron-left']"></i>
        </button>

        <!-- Navigation links -->
        <ul
          ref="navLinksRef"
          :class="styles.navLinks"
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

          <!-- Admin links shown directly if user is admin (but not superadmin) -->
          <template v-if="isAdminUser && !isSuperAdminUser">
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

          <!-- Superadmin links shown directly if user is superadmin (includes admin + superadmin items) -->
          <template v-if="isSuperAdminUser">
            <li
              v-for="adminItem in adminMenuItems"
              :key="adminItem.route"
              :class="{ active: currentRoute === adminItem.route }"
            >
              <router-link :to="{ name: adminItem.route }">
                {{ adminItem.label }}
              </router-link>
            </li>
            <li
              v-for="superAdminItem in superAdminMenuItems"
              :key="superAdminItem.route"
              :class="{ active: currentRoute === superAdminItem.route }"
            >
              <router-link :to="{ name: superAdminItem.route }">
                {{ superAdminItem.label }}
              </router-link>
            </li>
          </template>

          <!-- example dropdown (optional) -->
          <li :class="styles.dropdown" v-if="dropdownItem">
            <div @click="dropdownOpen = !dropdownOpen" :class="styles.dropdownToggle">
              {{ dropdownItem.label }}
              <i class="fas fa-chevron-down"></i>
            </div>
            <ul v-if="dropdownOpen" :class="styles.dropdownMenu">
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
          :class="[styles.scrollButton, styles.scrollRight, { [styles.darkTheme]: isDarkMode }]"
          aria-label="Scroll right"
        >
          <i :class="['fas', isArabic ? 'fa-chevron-left' : 'fa-chevron-right']"></i>
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
import styles from './NavigationMenu.module.css'

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

// Reactive state for routes data - now using hardcoded data
const routesData = ref<RouteData[]>([
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
    english_name: 'Account-Project Management',
    arabic_name: 'إدارة الحسابات والمشاريع',
  },
  { id: 11, english_name: 'Accounts & Projects', arabic_name: 'الحسابات والمشاريع' },
  { id: 12, english_name: 'Control', arabic_name: 'التحكم' },
  { id: 13, english_name: 'User Abilities', arabic_name: 'صلاحيات المستخدمين' },
  { id: 14, english_name: 'Audit Logs', arabic_name: 'السجلات' },

])
const isLoading = ref(false)

// Check if user is an admin
const isAdminUser = computed(() => {
  return authStore.user?.role === 'admin'
})

// Check if user is a superadmin
const isSuperAdminUser = computed(() => {
  return authStore.user?.role === 'superadmin'
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
  10: 'AccountProjectManagement',
  11: 'AccountsProjectView',
  // 12: 'Controller',
  13: 'UserAbilities', // New route for superadmin
  14: 'Logs', // New route for logs
}

// Routes to hide when user_level = 1

// Mapping for admin routes (these should only show for admin users)
const adminRouteIds = [9, 10, 11, 14]  // User Management, Account-Project Management, Accounts & Projects
// const adminRouteIds = [9, 10, 11, 12] // User Management, Account-Project Management, Accounts & Projects, Controller

// Mapping for superadmin routes (these should only show for superadmin users)
const superAdminRouteIds = [13, 14]// User Abilities

// Create computed properties for menu items based on hardcoded data

// helpers
const isUser = computed(() => authStore.user?.role === 'user')
const userLevel = computed(() => Number(authStore.userLevel)) // لو جاية سترنج هنحوّلها لرقم

const routesForLevel1 = [2, 3, 4, 5]
const routesForLevel234 = [2, 6, 7, 8]

const menuItems = computed(() => {
  if (isLoading.value || !routesData.value.length) return []

  // ✅ شروط اليوزر بس
  if (isUser.value) {
    const idsToShow =
      userLevel.value === 1
        ? routesForLevel1
        : [2, 3, 4].includes(userLevel.value)
          ? routesForLevel234
          : routesForLevel1 // fallback لو level مش متوقع

    return routesData.value
      .filter((route) => idsToShow.includes(route.id) && routeIdToRouteName[route.id])
      .sort((a, b) => a.id - b.id)
      .map((route) => ({
        label: isArabic.value ? route.arabic_name : route.english_name,
        route: routeIdToRouteName[route.id],
      }))
      .filter((item) => item.route)
  }

  // 🔽 باقي الأدوار (أدمن/سوبرأدمن...) — القائمة العادية بدون عناصر الأدمن في الجزء العام
  return routesData.value
    .filter((route) => {
      if (adminRouteIds.includes(route.id)) return false
      if (superAdminRouteIds.includes(route.id)) return false
      return routeIdToRouteName[route.id]
    })
    .sort((a, b) => a.id - b.id)
    .map((route) => ({
      label: isArabic.value ? route.arabic_name : route.english_name,
      route: routeIdToRouteName[route.id],
    }))
    .filter((item) => item.route)
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

const superAdminMenuItems = computed(() => {
  if (isLoading.value || !routesData.value.length) {
    return []
  }

  return routesData.value
    .filter((route) => {
      // Only include superadmin routes
      return superAdminRouteIds.includes(route.id) && routeIdToRouteName[route.id]
    })
    .sort((a, b) => a.id - b.id) // Sort by ID to maintain consistent order
    .map((route) => ({
      label: isArabic.value ? route.arabic_name : route.english_name,
      route: routeIdToRouteName[route.id],
    }))
    .filter((item) => item.route) // Ensure we have a valid route
})

// Setup on component mount
onMounted(() => {
  // Add window resize listener to check scroll buttons
  window.addEventListener('resize', checkScrollNeeded)

  // Initial check after mounting
  setTimeout(() => {
    checkScrollNeeded()
  }, 100)
})

// Watch for changes in menu items to update scroll buttons
watch([menuItems, adminMenuItems, superAdminMenuItems], () => {
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
