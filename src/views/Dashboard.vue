<!-- DashboardView.vue -->
<template>
  <div
    class="dashboard"
    :class="{ 'dark-mode': isDarkMode, rtl: isRTL }"
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <BudgetDashboard />
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import BudgetDashboard from '@/components/BudgetDashboard.vue'

export default {
  name: 'DashboardView',
  components: {
    BudgetDashboard,
  },
  setup() {
    const themeStore = useThemeStore()

    const isDarkMode = computed(() => themeStore.darkMode)
    const isRTL = computed(() => themeStore.language === 'ar')

    return {
      isDarkMode,
      isRTL,
    }
  },
}
</script>

<style scoped>
.dashboard {
  background: transparent;
  min-height: 100vh;
  transition: all var(--transition-normal);
}

.dashboard.dark-mode {
  color: #f8e9f0;
}

.dashboard.rtl {
  direction: rtl;
}
</style>
