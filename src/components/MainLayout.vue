<!-- MainLayout.vue -->
<template>
  <div class="layout" :class="{ 'dark-theme': isDarkMode }" :dir="isArabic ? 'rtl' : 'ltr'">
    <template v-if="isAuthenticated">
      <HeaderBar />
      <NavigationMenu />
    </template>

    <main class="content" :class="{ 'full-height': !isAuthenticated }">
      <RouterView v-slot="{ Component }">
        <Transition :name="isArabic ? 'rtl-fade' : 'fade'" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HeaderBar from '@/components/HeaderBar.vue'
import NavigationMenu from '@/components/NavigationMenu.vue'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'

const themeStore = useThemeStore()
const authStore = useAuthStore()

const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f3f4f6;
  color: #1f2937;
  transition: all 0.3s ease;
}

.layout.dark-theme {
  background: #1a1a2e;
  color: #e0e0e0;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-x: hidden;
  transition: padding 0.3s;
}

/* Improved RTL transitions */
.fade-enter-active,
.fade-leave-active,
.rtl-fade-enter-active,
.rtl-fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to,
.rtl-fade-enter-from,
.rtl-fade-leave-to {
  opacity: 0;
}

/* Direction-specific transitions */
.fade-enter-from {
  transform: translateX(-10px);
}

.fade-leave-to {
  transform: translateX(10px);
}

.rtl-fade-enter-from {
  transform: translateX(10px);
}

.rtl-fade-leave-to {
  transform: translateX(-10px);
}

.full-height {
  height: 100vh;
  padding: 0;
}
</style>
