<!-- MainLayout.vue -->
<template>
  <div
    class="layout"
    ref="layoutContainer"
    :class="{ 'dark-theme': isDarkMode }"
    :dir="isArabic ? 'rtl' : 'ltr'"
  >
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

    <!-- Footer - Only show when authenticated -->
    <FooterBar v-if="isAuthenticated" />

    <!-- ChatBot Component - Always visible when authenticated -->
    <ChatBot v-if="isAuthenticated" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import HeaderBar from '@/components/HeaderBar.vue'
import NavigationMenu from '@/components/NavigationMenu.vue'
import FooterBar from '@/components/FooterBar.vue'
import ChatBot from '@/components/ChatBot.vue'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import MagneticSectionSnap from '@/utils/magneticSectionSnap'

const themeStore = useThemeStore()
const authStore = useAuthStore()

const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')
const isAuthenticated = computed(() => authStore.isAuthenticated)

// References
const layoutContainer = ref<HTMLElement | null>(null)
let sectionSnapper: MagneticSectionSnap | null = null

// Initialize magnetic section snapping
onMounted(() => {
  // We only want to apply magnetic scrolling when authenticated
  if (isAuthenticated.value && layoutContainer.value) {
    // Add a small delay to ensure all components have rendered
    setTimeout(() => {
      if (layoutContainer.value) {
        sectionSnapper = new MagneticSectionSnap(layoutContainer.value, {
          threshold: 0.2,
          smoothness: 0.12,
          sectionClass: 'snap-section',
        })
        sectionSnapper.initialize()
      }
    }, 500)
  }
})

// Clean up
onUnmounted(() => {
  if (sectionSnapper) {
    sectionSnapper.destroy()
    sectionSnapper = null
  }
})
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #374151;
  transition: all 0.3s ease;
  perspective: 1000px;
  overflow-x: hidden;
}

.layout.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #d1d5db;
  position: relative;
}

.layout.dark-theme::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23334155' stroke-width='1'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3Cpath d='M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382'/%3E%3Cpath d='M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269'/%3E%3C/g%3E%3Cg fill='%23475569'%3E%3Ccircle cx='769' cy='229' r='3'/%3E%3Ccircle cx='539' cy='269' r='3'/%3E%3Ccircle cx='603' cy='493' r='3'/%3E%3Ccircle cx='731' cy='737' r='3'/%3E%3Ccircle cx='520' cy='660' r='3'/%3E%3Ccircle cx='309' cy='538' r='3'/%3E%3Ccircle cx='295' cy='764' r='3'/%3E%3Ccircle cx='40' cy='599' r='3'/%3E%3Ccircle cx='102' cy='382' r='3'/%3E%3Ccircle cx='127' cy='80' r='3'/%3E%3Ccircle cx='370' cy='105' r='3'/%3E%3Ccircle cx='578' cy='42' r='3'/%3E%3Ccircle cx='237' cy='261' r='3'/%3E%3Ccircle cx='390' cy='382' r='3'/%3E%3C/g%3E%3C/svg%3E")
    center/cover;
  opacity: 0.02;
  z-index: 0;
  pointer-events: none;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-x: hidden;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.layout.dark-theme .content {
  background: rgba(30, 41, 59, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Government card surfaces */
:deep(.card) {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(71, 85, 105, 0.1);
  border: 1px solid rgba(71, 85, 105, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

:deep(.dark-theme .card) {
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(71, 85, 105, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

:deep(.card:hover) {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(71, 85, 105, 0.15);
}

:deep(.dark-theme .card:hover) {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

/* Government accent colors */
:deep(.dark-theme .accent) {
  color: #60a5fa;
  text-shadow: 0 0 6px rgba(96, 165, 250, 0.3);
}

:deep(.dark-theme .accent-secondary) {
  color: #a78bfa;
  text-shadow: 0 0 6px rgba(167, 139, 250, 0.3);
}

/* Improved RTL transitions */
.fade-enter-active,
.fade-leave-active,
.rtl-fade-enter-active,
.rtl-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-enter-from,
.fade-leave-to,
.rtl-fade-enter-from,
.rtl-fade-leave-to {
  opacity: 0;
  filter: blur(4px);
}

/* Direction-specific transitions */
.fade-enter-from {
  transform: translateX(-20px) scale(0.98);
}

.fade-leave-to {
  transform: translateX(20px) scale(0.98);
}

.rtl-fade-enter-from {
  transform: translateX(20px) scale(0.98);
}

.rtl-fade-leave-to {
  transform: translateX(-20px) scale(0.98);
}

.full-height {
  height: 100vh;
  padding: 0;
}

/* Responsive typography */
:deep(h1) {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.025em;
}

:deep(h2) {
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}

:deep(h3) {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  font-weight: 600;
}

/* Neon accents */
:deep(.dark-theme .accent) {
  color: #5eead4;
  text-shadow: 0 0 8px rgba(94, 234, 212, 0.4);
}

:deep(.dark-theme .accent-magenta) {
  color: #f0abfc;
  text-shadow: 0 0 8px rgba(240, 171, 252, 0.4);
}

/* Custom scrollbar */
:deep(::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(::-webkit-scrollbar-thumb) {
  background: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}

:deep(.dark-theme ::-webkit-scrollbar-thumb) {
  background: rgba(100, 100, 100, 0.5);
}

:deep(::-webkit-scrollbar-thumb:hover) {
  background: rgba(125, 125, 125, 0.7);
}
</style>
