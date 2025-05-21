<script setup lang="ts">
import MainLayout from '@/components/MainLayout.vue'
import { onMounted, ref, onUnmounted } from 'vue'
import { computed, watch } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import SessionExpiredNotification from '@/components/SessionExpiredNotification.vue'
import BackgroundConstellation from '@/plugins/backgroundConstellation'

// Reference to the background element
const bgContainer = ref<HTMLElement | null>(null)
let constellationEffect: BackgroundConstellation | null = null

// Add font loading via DOM for better error handling
onMounted(() => {
  // Add preconnect for performance
  const preconnect = document.createElement('link')
  preconnect.rel = 'preconnect'
  preconnect.href = 'https://fonts.googleapis.com'
  document.head.appendChild(preconnect)

  const preconnectCrossDomain = document.createElement('link')
  preconnectCrossDomain.rel = 'preconnect'
  preconnectCrossDomain.href = 'https://fonts.gstatic.com'
  preconnectCrossDomain.crossOrigin = 'anonymous'
  document.head.appendChild(preconnectCrossDomain)

  // Add the font link
  const fontLink = document.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href =
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700&display=swap'
  document.head.appendChild(fontLink)

  // Initialize constellation effect if container is available
  if (bgContainer.value) {
    constellationEffect = new BackgroundConstellation(bgContainer.value, themeStore.darkMode)
    constellationEffect.start()
  }
})

// Clean up
onUnmounted(() => {
  if (constellationEffect) {
    constellationEffect.dispose()
    constellationEffect = null
  }
})

const themeStore = useThemeStore()
const isArabic = computed(() => themeStore.language === 'ar')
const isDarkMode = computed(() => themeStore.darkMode)

// Update constellation when theme changes
watch(
  () => themeStore.darkMode,
  (newDarkMode) => {
    if (constellationEffect) {
      constellationEffect.updateMode(newDarkMode)
    }
  },
)
</script>

<template>
  <div class="app-container" :class="{ rtl: isArabic, 'dark-theme': isDarkMode }">
    <div ref="bgContainer" class="bg-constellation"></div>
    <div class="bg-animation"></div>
    <MainLayout />
    <SessionExpiredNotification />
  </div>
</template>

<style>
/* global resets already in main.css */
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: var(--color-bg-light);
  color: var(--color-text-dark);
  font-family: var(--font-primary);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

body.dark-theme {
  background-color: var(--color-bg-dark);
  color: var(--color-text-light);
}

.app-container {
  min-height: 100vh;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 20% 35%, rgba(243, 244, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(243, 244, 246, 0.1) 0%, transparent 50%);
  filter: blur(40px);
  opacity: 0.3;
  pointer-events: none;
}

.dark-theme .bg-animation {
  background:
    radial-gradient(circle at 20% 35%, rgba(94, 234, 212, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(240, 171, 252, 0.05) 0%, transparent 50%);
  filter: blur(40px);
  opacity: 0.5;
  animation: gradientShift 15s ease infinite alternate;
}

@keyframes gradientShift {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
}

.bg-constellation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  pointer-events: none;
}

/* RTL support */
.rtl {
  direction: rtl;
  text-align: right;
}

/* Logo colors as custom properties for reuse */
:root {
  --color-blue: #2563eb;
  --color-green: #10b981;
  --color-red: #ef4444;
  --color-orange: #f97316;
  --color-charcoal: #1f2937;

  /* Directional CSS Variables for RTL support */
  --direction: ltr;
  --start: left;
  --end: right;
  --text-align: left;
  --reverse-direction: rtl;
  --flex-direction: row;
  --reverse-flex: row-reverse;
}

/* RTL support for Arabic */
[dir='rtl'] {
  --direction: rtl;
  --start: right;
  --end: left;
  --text-align: right;
  --reverse-direction: ltr;
  --flex-direction: row-reverse;
  --reverse-flex: row;
}

/* General RTL support */
[dir='rtl'] .input-search {
  padding: 0.6rem 2.2rem 0.6rem 0.6rem;
}

[dir='rtl'] .search-icon {
  left: auto;
  right: 10px;
}

[dir='rtl'] .clear-search {
  right: auto;
  left: 10px;
}

/* Better font for Arabic text with fallbacks */
[dir='rtl'] {
  font-family: 'Tajawal', 'Arial', 'Tahoma', sans-serif;
  font-display: swap; /* Ensure text remains visible during loading */
}

/* Animation direction based on language */
@keyframes slideInRtl {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInLtr {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

[dir='rtl'] .animate-slide {
  animation: slideInRtl 0.3s ease-out forwards;
}

[dir='ltr'] .animate-slide {
  animation: slideInLtr 0.3s ease-out forwards;
}
</style>
