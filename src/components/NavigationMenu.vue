<!-- NavigationMenu.vue -->
<template>
  <nav class="navigation-menu" :class="{ 'dark-theme': isDarkMode }">
    <div class="container">
      <!-- links -->
      <ul class="nav-links">
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
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'

// Define interfaces for menu items
interface MenuItem {
  label: string
  route: string
}

interface DropdownItem {
  label: string
  dropdownItems: MenuItem[]
}

const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const currentRoute = computed(() => route.name)
const dropdownOpen = ref(false)

// Check if user is an admin
const isAdminUser = computed(() => {
  return authStore.user?.role === 'admin'
})

// Define dropdownItem with proper typing
const dropdownItem = ref<DropdownItem | null>(null)

const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')

// Define admin menu items in both languages
const adminMenuItemsData = {
  ar: [
    { label: 'إدارة المستخدمين', route: 'UserManagement' },
    { label: 'إدارة الحسابات والكيانات', route: 'AccountEntityManagement' },
    { label: 'الحسابات والكيانات', route: 'AccountsEntityView' },
  ],
  en: [
    { label: 'User Management', route: 'UserManagement' },
    { label: 'Account-Entity Management', route: 'AccountEntityManagement' },
    { label: 'Accounts & Entities', route: 'AccountsEntityView' },
  ],
}

// Define menu items in both languages
const menuItemsData = {
  ar: [
    { label: 'لوحة القيادة', route: 'Dashboard' },
    { label: 'المناقلات', route: 'Home' },
    { label: 'التسويه', route: 'Settlements' },
    { label: 'التعزيزات', route: 'Enhancements' },
    { label: 'التعزيزات قيد الاعتماد', route: 'EnhancementsPendingApproval' },
    { label: 'العقود قيد الاعتماد', route: 'ContractsPendingApproval' },
    { label: 'التسويات قيد الاعتماد', route: 'SettlementsPendingApproval' },
  ],
  en: [
    { label: 'Dashboard', route: 'Dashboard' },
    { label: 'Transfers', route: 'Home' },
    { label: 'Fund Adjustment Department', route: 'Settlements' },
    { label: 'Additional Fund Request', route: 'Enhancements' },
    { label: 'Pending Transfers', route: 'EnhancementsPendingApproval' },
    { label: 'Pending Fund Adjustment', route: 'ContractsPendingApproval' },
    { label: 'Pending Additional Fund', route: 'SettlementsPendingApproval' },
  ],
}

// Create computed properties for menu items
const menuItems = computed(() => (isArabic.value ? menuItemsData.ar : menuItemsData.en))
const adminMenuItems = computed(() =>
  isArabic.value ? adminMenuItemsData.ar : adminMenuItemsData.en,
)
</script>

<style scoped>
.navigation-menu {
  position: sticky;
  top: 64px; /* Adjusted to match new header height */
  background: linear-gradient(90deg, #e5f6f5 0%, #a4cac5 35%, #5e9b92 70%, #2c6d62 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #0c362f;
  z-index: 90;
  box-shadow: 0 4px 20px rgba(14, 77, 67, 0.15); /* Enhanced shadow */
  transition: all 0.3s ease-in-out;
  border-bottom: 1px solid rgba(44, 109, 98, 0.2); /* More visible border */
  padding: 1px 0; /* Small vertical padding */
}

.navigation-menu.dark-theme {
  background: linear-gradient(90deg, #a4cac5 0%, #5e9b92 25%, #2c6d62 65%, #0e4d43 100%);
  color: #e5f6f5;
  box-shadow: 0 4px 20px rgba(14, 77, 67, 0.15);
  border-bottom: 1px solid rgba(229, 246, 245, 0.15);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 54px; /* Slightly taller for better scrolling area */
  transition: all 0.3s ease-in-out;
  padding: 0 24px; /* Match header padding */
  position: relative;
}

.container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(229, 246, 245, 0) 0%,
    rgba(229, 246, 245, 0.3) 50%,
    rgba(229, 246, 245, 0) 100%
  );
  opacity: 0.6;
  transition: opacity 0.3s ease-in-out;
}

[dir='rtl'] .container {
  justify-content: flex-start;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0 2px; /* Small padding to improve spacing */
  flex-wrap: nowrap;
  overflow-x: auto;
  width: 100%;
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  -ms-overflow-style: none; /* Hide scrollbar for IE/Edge */
  gap: 4px; /* Increased gap between links for better separation */
  align-items: center; /* Ensure vertical centering */
}

.nav-links::-webkit-scrollbar {
  display: none; /* Hide scrollbar for Chrome/Safari */
}

.nav-links li {
  margin: 0;
  white-space: nowrap;
  position: relative;
}

.nav-links a {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #0c362f; /* Darker color for better contrast */
  text-decoration: none;
  transition: all 0.3s ease-in-out;
  border-radius: 6px;
  font-weight: 600; /* Increased font weight */
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.1); /* Subtle text shadow for clarity */
  letter-spacing: 0.02em; /* Slightly improved letter spacing */
}

.navigation-menu.dark-theme .nav-links a {
  color: rgba(229, 246, 245, 1); /* Full opacity for better contrast */
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.2); /* Shadow for clarity in dark mode */
}

.nav-links a::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(14, 77, 67, 0.05) 0%, rgba(14, 77, 67, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.navigation-menu.dark-theme .nav-links a::before {
  background: linear-gradient(135deg, rgba(229, 246, 245, 0.1) 0%, rgba(229, 246, 245, 0) 100%);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: rgba(14, 77, 67, 0.5);
  transform: translateX(-50%);
  transition: width 0.3s ease-in-out;
  box-shadow: 0 0 8px rgba(14, 77, 67, 0.2);
}

.navigation-menu.dark-theme .nav-links a::after {
  background: rgba(229, 246, 245, 0.8);
  box-shadow: 0 0 8px rgba(229, 246, 245, 0.4);
}

.nav-links li.active > a {
  color: #0e4d43;
  background: rgba(255, 255, 255, 0.5); /* Lighter background for better contrast */
  font-weight: 700; /* Bolder for active items */
  box-shadow: 0 4px 15px rgba(14, 77, 67, 0.15); /* Enhanced shadow */
}

.navigation-menu.dark-theme .nav-links li.active > a {
  color: #ffffff; /* Pure white for maximum contrast */
  background: rgba(229, 246, 245, 0.25); /* Slightly more visible */
  box-shadow: 0 4px 15px rgba(14, 77, 67, 0.2); /* Enhanced shadow */
}

.nav-links li.active > a::after {
  width: 80%;
  height: 3px; /* Thicker underline */
  background: #0c362f; /* Darker for more visibility */
  box-shadow: 0 0 12px rgba(14, 77, 67, 0.5); /* Enhanced glow effect */
}

.navigation-menu.dark-theme .nav-links li.active > a::after {
  background: #ffffff; /* Pure white for maximum visibility */
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.8); /* Stronger glow effect */
}

.nav-links a:hover {
  color: #0e4d43;
  transform: translateY(-2px);
}

.navigation-menu.dark-theme .nav-links a:hover {
  color: #e5f6f5;
}

.nav-links a:hover::before {
  opacity: 1;
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
  padding: 0.75rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease-in-out;
  color: #0c362f; /* Darker for better contrast */
  position: relative;
  overflow: hidden;
  font-weight: 600; /* Increased font weight */
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.1); /* Subtle text shadow for clarity */
}

.navigation-menu.dark-theme .dropdown-toggle {
  color: rgba(229, 246, 245, 1); /* Full opacity for better contrast */
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.2); /* Shadow for clarity in dark mode */
}

.dropdown-toggle i {
  font-size: 14px; /* Larger icon size */
  transition: transform 0.3s ease-in-out;
  filter: drop-shadow(0 0 1px rgba(14, 77, 67, 0.2)); /* Subtle shadow for icon */
}

.navigation-menu.dark-theme .dropdown-toggle i {
  filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.3)); /* Shadow for dark mode icon */
}

.dropdown-toggle i.open {
  transform: rotate(180deg);
}

.dropdown-toggle:hover {
  color: #0e4d43;
  transform: translateY(-2px);
}

.navigation-menu.dark-theme .dropdown-toggle:hover {
  color: #e5f6f5;
}

.dropdown-toggle:hover i {
  transform: translateY(2px);
}

.dropdown-toggle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(14, 77, 67, 0.05) 0%, rgba(14, 77, 67, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.navigation-menu.dark-theme .dropdown-toggle::before {
  background: linear-gradient(135deg, rgba(229, 246, 245, 0.1) 0%, rgba(229, 246, 245, 0) 100%);
}

.dropdown-toggle:hover::before {
  opacity: 1;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  background: rgba(164, 202, 197, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(14, 77, 67, 0.15),
    0 0 0 1px rgba(14, 77, 67, 0.08),
    inset 0 0 20px rgba(14, 77, 67, 0.05);
  overflow: hidden;
  z-index: 100;
  min-width: 200px;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out;
}

.navigation-menu.dark-theme .dropdown-menu {
  background: rgba(44, 109, 98, 0.95);
  box-shadow:
    0 8px 32px rgba(14, 77, 67, 0.2),
    0 0 0 1px rgba(229, 246, 245, 0.1),
    inset 0 0 20px rgba(14, 77, 67, 0.1);
}

.dropdown-menu.open {
  opacity: 1;
  transform: translateY(0);
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
  margin-bottom: 2px;
}

.dropdown-menu li a {
  padding: 0.75rem 1rem;
  display: block;
  white-space: nowrap;
  border-radius: 6px;
  width: 100%;
  transition: all 0.3s ease-in-out;
  color: #0c362f; /* Darker for better visibility */
  font-weight: 600; /* Bolder text */
  letter-spacing: 0.01em; /* Improved letter spacing */
}

.navigation-menu.dark-theme .dropdown-menu li a {
  color: #ffffff; /* Pure white for maximum contrast */
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.2); /* Shadow for clarity */
}

.dropdown-menu li a:hover {
  background: rgba(14, 77, 67, 0.08);
  color: #0e4d43;
  transform: none;
}

.navigation-menu.dark-theme .dropdown-menu li a:hover {
  background: rgba(229, 246, 245, 0.15);
  color: #e5f6f5;
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
  }

  .nav-links a {
    padding: 0.75rem 0.8rem;
    font-size: 0.9rem; /* Slightly larger font on mobile for readability */
    letter-spacing: 0; /* Remove letter spacing on mobile */
  }
}
</style>
