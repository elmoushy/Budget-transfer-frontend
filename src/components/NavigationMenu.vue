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
  top: 64px; /* Adjusted to match new header height */
  background: rgba(138, 42, 68, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  z-index: 90;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.navigation-menu.dark-theme {
  background: rgba(90, 28, 46, 0.85);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.2),
    inset 0 0 30px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 54px; /* Slightly taller for better scrolling area */
  transition: all 0.3s ease;
  padding: 0 18px;
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
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0.5;
}

[dir='rtl'] .container {
  justify-content: flex-start;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
  width: 100%;
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  -ms-overflow-style: none; /* Hide scrollbar for IE/Edge */
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
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 6px;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.nav-links a::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.7);
  transform: translateX(-50%);
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

.nav-links li.active > a {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.nav-links li.active > a::after {
  width: 80%;
  background: #5eead4;
  box-shadow: 0 0 10px rgba(94, 234, 212, 0.6);
}

.nav-links a:hover {
  color: #fff;
  transform: translateY(-2px);
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
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  color: rgba(255, 255, 255, 0.85);
  position: relative;
  overflow: hidden;
}

.dropdown-toggle i {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.dropdown-toggle:hover {
  color: #fff;
  transform: translateY(-2px);
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dropdown-toggle:hover::before {
  opacity: 1;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  background: rgba(122, 37, 64, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 0 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 100;
  min-width: 200px;
  opacity: 0;
  transform: translateY(10px);
  animation: dropdownFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes dropdownFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
}

.dropdown-menu li a:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: none;
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
    font-size: 0.85rem;
  }
}
</style>
