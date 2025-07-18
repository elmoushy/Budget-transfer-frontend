<script setup lang="ts">
import MainLayout from '@/components/MainLayout.vue'
import { onMounted } from 'vue'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import SessionExpiredNotification from '@/components/SessionExpiredNotification.vue'

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
})

const themeStore = useThemeStore()
const isArabic = computed(() => themeStore.language === 'ar')
const isDarkMode = computed(() => themeStore.darkMode)
</script>

<template>
  <div class="app-container" :class="{ rtl: isArabic, 'dark-theme': isDarkMode }">
    <div class="bg-animation"></div>
    <MainLayout />
    <SessionExpiredNotification />
  </div>
</template>

<style>
/* Define theme variables */
:root {
  /* Base colors */
  --color-bg-light: #f8f9fa;
  --color-bg-dark: #111122;
  --color-text-dark: #333;
  --color-text-light: #f0f0f0;

  /* Accent colors */
  --accent-color: #8a2a44;
  --accent-color-rgb: 138, 42, 68;
  --accent-color-dark: #5a1c2e;
  --accent-color-dark-rgb: 90, 28, 46;

  /* UI Colors */
  --heading-color: #333;
  --text-color: #444;
  --text-color-rgb: 68, 68, 68;
  --bg-color: #fff;
  --card-bg: #fff;
  --border-color: rgba(0, 0, 0, 0.05);
  --hover-bg: rgba(138, 42, 68, 0.03);
  --shadow-color: rgba(0, 0, 0, 0.08);
  --btn-text: #fff;

  /* Fonts */
  --font-primary: 'Inter', 'Tajawal', sans-serif;
  --font-heading: 'Space Grotesk', 'Inter', 'Tajawal', sans-serif;

  /* Animations */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  /* Special effects */
  --glass-opacity-light: 0.9;
  --glass-opacity-dark: 0.7;
  --glass-blur: 10px;
  --glass-border-light: rgba(255, 255, 255, 0.1);
  --glass-border-dark: rgba(255, 255, 255, 0.05);

  /* Shadows */
  --shadow-light: 0 8px 30px rgba(0, 0, 0, 0.08);
  --shadow-dark: 0 8px 30px rgba(0, 0, 0, 0.3);
  --shadow-glow-primary: 0 0 15px rgba(138, 42, 68, 0.2);
  --shadow-glow-magenta: 0 0 15px rgba(240, 171, 252, 0.2);
}

/* Dark theme variables */
.dark-theme {
  --accent-color: #a83353;
  --accent-color-rgb: 168, 51, 83;
  --accent-color-dark: #7a293d;
  --accent-color-dark-rgb: 122, 41, 61;

  --heading-color: #f0f0f0;
  --text-color: #ddd;
  --text-color-rgb: 221, 221, 221;
  --bg-color: #1a1a1a;
  --card-bg: #252525;
  --border-color: rgba(255, 255, 255, 0.07);
  --hover-bg: rgba(168, 51, 83, 0.15);
  --shadow-color: rgba(0, 0, 0, 0.3);
  --btn-text: #fff;

  --glass-border-light: rgba(255, 255, 255, 0.1);
  --glass-border-dark: rgba(255, 255, 255, 0.05);
  --shadow-glow-primary: 0 0 15px rgba(168, 51, 83, 0.3);
  --shadow-glow-magenta: 0 0 15px rgba(240, 171, 252, 0.3);
}

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: var(--font-primary);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.dark-theme {
  background-color: var(--bg-color);
  color: var(--text-color);
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
