<script setup lang="ts">
import MainLayout from '@/components/MainLayout.vue'
</script>

<template>
  <MainLayout />
</template>

<style>
/* global resets or font imports */
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #f5f7fa;
  color: #333;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
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

/* Better font for Arabic text */
[dir='rtl'] {
  font-family:
    'Tajawal',
    'Amiri',
    'Noto Sans Arabic',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
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
