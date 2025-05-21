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
const currentRoute = computed(() => route.name)
const dropdownOpen = ref(false)

// Define dropdownItem with proper typing
const dropdownItem = ref<DropdownItem | null>(null)

const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')

// Define menu items in both languages
const menuItemsData = {
  ar: [
    { label: 'لوحة القيادة', route: 'Dashboard' },
    { label: 'المناقلات', route: 'Home' },
    { label: 'العقود', route: 'Settlements' },
    { label: 'التعزيزات', route: 'Enhancements' },
    { label: 'التعزيزات قيد الاعتماد', route: 'EnhancementsPendingApproval' },
    { label: 'العقود قيد الاعتماد', route: 'ContractsPendingApproval' },
    { label: 'التسويات قيد الاعتماد', route: 'SettlementsPendingApproval' },
  ],
  en: [
    { label: 'Dashboard', route: 'Dashboard' },
    { label: 'Transfers', route: 'Home' },
    { label: 'Contracts', route: 'Settlements' },
    { label: 'Enhancements', route: 'Enhancements' },
    { label: 'Transfers Pending Approval', route: 'EnhancementsPendingApproval' },
    { label: 'Contracts Pending Approval', route: 'ContractsPendingApproval' },
    { label: 'Settlements Pending Approval', route: 'SettlementsPendingApproval' },
  ],
}

// Create a computed property that returns the appropriate menu items based on language
const menuItems = computed(() => (isArabic.value ? menuItemsData.ar : menuItemsData.en))
</script>

<style scoped>
.navigation-menu {
  position: sticky;
  top: 60px; /* sits right under your HeaderBar */
  background: #8a2a44; /* Maroon base color */
  color: #fff;
  z-index: 90;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.navigation-menu.dark-theme {
  background: #5a1c2e; /* Darker maroon for dark mode */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 50px; /* Keep fixed height for single line navigation */
  transition: all 0.3s ease;
  padding: 0 0.5rem; /* Reduced horizontal padding */
}

[dir='rtl'] .container {
  justify-content: flex-start;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: nowrap; /* Prevent wrapping to keep items in one line */
  overflow-x: auto; /* Allow scrolling if items exceed container width */
  width: 100%;
}

.nav-links li {
  margin: 0; /* Remove margin to save space */
  white-space: nowrap; /* prevent text wrapping within items */
}

.nav-links a {
  display: block;
  padding: 0.75rem 0.6rem; /* Reduced horizontal padding to fit more items */
  color: #f1f1f1;
  text-decoration: none;
  transition: all 0.2s;
  border-radius: 4px;
  font-weight: 500;
}

.nav-links li.active > a {
  background: rgba(255, 255, 255, 0.15);
  color: #ffcc80;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-links a:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* dropdown */
.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.dropdown-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  background: #7a2540; /* Slightly darker than main maroon */
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 100;
  min-width: 180px;
}

[dir='ltr'] .dropdown-menu {
  left: 0;
  right: auto;
}

[dir='rtl'] .dropdown-menu {
  right: 0;
  left: auto;
}

.dropdown-menu li a {
  padding: 0.75rem 1.25rem;
  display: block;
  white-space: nowrap;
  border-radius: 0;
}

.dropdown-menu li a:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: none;
}

/* Arabic font size adjustment for navbar */
[dir='rtl'] .nav-links a {
  font-size: 0.95rem;
  letter-spacing: 0;
}
</style>
