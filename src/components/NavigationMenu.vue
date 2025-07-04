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

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  width: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
  gap: 6px;
  align-items: center;
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
</style>
