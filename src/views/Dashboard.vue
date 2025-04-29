<!-- DashboardView.vue -->
<template>
  <div class="dashboard" :class="{ 'dark-mode': isDarkMode, rtl: isRTL }">
    <h1 class="dashboard-title">{{ translations.dashboard }}</h1>
    <p class="dashboard-subtitle">{{ translations.welcomeMessage }}</p>

    <!-- ────── METRICS CARDS ────── -->
    <div class="metrics-grid">
      <div
        v-for="(metric, index) in localizedMetrics"
        :key="index"
        class="metric-card"
        :class="metric.trend"
      >
        <div class="metric-icon">
          <i :class="metric.icon"></i>
        </div>
        <div class="metric-content">
          <h3>{{ metric.title }}</h3>
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-trend">
            <i :class="metric.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{ metric.percentage }}% {{ translations.sinceLast }}
          </div>
        </div>
      </div>
    </div>

    <!-- ────── CHARTS ────── -->
    <div class="charts-grid">
      <div class="chart-card main-chart">
        <h3>{{ translations.revenueOverview }}</h3>
        <canvas v-if="chartsReady" ref="lineChart"></canvas>
        <div v-else class="loading-chart">{{ translations.loadingChart }}</div>
      </div>

      <div class="chart-card">
        <h3>{{ translations.budgetDistribution }}</h3>
        <canvas v-if="chartsReady" ref="doughnutChart"></canvas>
        <div v-else class="loading-chart">{{ translations.loadingChart }}</div>
      </div>

      <div class="chart-card">
        <h3>{{ translations.departmentPerformance }}</h3>
        <canvas v-if="chartsReady" ref="barChart"></canvas>
        <div v-else class="loading-chart">{{ translations.loadingChart }}</div>
      </div>
    </div>

    <!-- ────── RECENT ACTIVITIES ────── -->
    <div class="recent-activities">
      <h3>{{ translations.recentActivities }}</h3>
      <div class="activity-list">
        <div v-for="(activity, index) in localizedActivities" :key="index" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <i :class="activity.icon"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { Chart } from 'chart.js/auto'
import { useThemeStore } from '@/stores/themeStore'

export default {
  name: 'DashboardView',
  setup() {
    /* ────── THEME ────── */
    const themeStore = useThemeStore()
    const isDarkMode = ref<boolean>(themeStore.darkMode)
    watch(
      () => themeStore.darkMode,
      (val) => (isDarkMode.value = val),
    )

    /* ────── RTL SUPPORT ────── */
    // Use the language from the themeStore
    const currentLang = computed(() => themeStore.language)

    // RTL languages list
    const rtlLanguages = ['ar', 'he', 'fa', 'ur']

    // Make RTL detection reactive based on the current language
    const isRTL = computed(() => {
      return rtlLanguages.includes(currentLang.value) || document.dir === 'rtl'
    })

    // Update language when the language in the theme store changes
    watch(
      () => themeStore.language,
      () => {
        // Trigger any necessary updates when language changes
        if (chartsReady.value) {
          nextTick(() => createCharts())
        }
      },
    )

    // Listen for localStorage changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'language') {
        // The language was changed in another tab
        // No need to update currentLang as it's tied to the store
        if (chartsReady.value) {
          nextTick(() => createCharts())
        }
      }
    }

    onMounted(() => {
      // Listen for storage events (language changes from other tabs)
      window.addEventListener('storage', handleStorageChange)
    })

    onUnmounted(() => {
      // Clean up
      window.removeEventListener('storage', handleStorageChange)
    })

    /* ────── TRANSLATIONS ────── */
    const translations = computed(() => {
      if (isRTL.value) {
        return {
          dashboard: 'لوحة القيادة',
          welcomeMessage: 'مرحبًا بعودتك! إليك نظرة عامة على بياناتك.',
          totalBudget: 'الميزانية الإجمالية',
          allocatedFunds: 'الأموال المخصصة',
          pendingApprovals: 'الموافقات المعلقة',
          completedTransfers: 'التحويلات المكتملة',
          revenueOverview: 'نظرة عامة على الإيرادات',
          budgetDistribution: 'توزيع الميزانية',
          departmentPerformance: 'أداء الأقسام',
          recentActivities: 'الأنشطة الأخيرة',
          loadingChart: 'جاري تحميل بيانات الرسم البياني...',
          sinceLast: 'منذ الشهر الماضي',
          // Month translations
          months: [
            'يناير',
            'فبراير',
            'مارس',
            'إبريل',
            'مايو',
            'يونيو',
            'يوليو',
            'أغسطس',
            'سبتمبر',
            'أكتوبر',
            'نوفمبر',
            'ديسمبر',
          ],
          // Department translations
          departments: ['العمليات', 'التسويق', 'تكنولوجيا المعلومات', 'الموارد البشرية', 'البحث'],
          // Quarter translations
          quarters: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
          // Activity translations
          budgetTransferApproved: 'تم الموافقة على تحويل الميزانية',
          transferApproved: 'تم الموافقة على تحويل مبلغ 25,000$ إلى قسم التسويق',
          newBudgetRequest: 'طلب ميزانية جديد',
          itRequestSubmitted: 'قدم قسم تكنولوجيا المعلومات طلبًا لمبلغ إضافي قدره 15,000$',
          settlementPending: 'تسوية معلقة',
          endOfQuarterSettlement: 'تسوية نهاية الربع في انتظار الموافقة',
          enhancementCompleted: 'اكتمل التعزيز',
          operationsBudgetEnhanced: 'تم تعزيز ميزانية العمليات بمبلغ 50,000$',
          // Time translations
          hoursAgo: (hours: number) => `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`,
          daysAgo: (days: number) => `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`,
          target: 'الهدف',
          actual: 'الفعلي',
          budgetAllocation: 'تخصيص الميزانية',
          actualSpending: 'الإنفاق الفعلي',
        }
      } else {
        return {
          dashboard: 'Dashboard',
          welcomeMessage: "Welcome back! Here's an overview of your data.",
          totalBudget: 'Total Budget',
          allocatedFunds: 'Allocated Funds',
          pendingApprovals: 'Pending Approvals',
          completedTransfers: 'Completed Transfers',
          revenueOverview: 'Revenue Overview',
          budgetDistribution: 'Budget Distribution',
          departmentPerformance: 'Department Performance',
          recentActivities: 'Recent Activities',
          loadingChart: 'Loading chart data...',
          sinceLast: 'since last month',
          // Month translations
          months: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          // Department translations
          departments: ['Operations', 'Marketing', 'IT', 'HR', 'Research'],
          // Quarter translations
          quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
          // Activity translations
          budgetTransferApproved: 'Budget Transfer Approved',
          transferApproved: 'Transfer of $25,000 to Marketing department approved',
          newBudgetRequest: 'New Budget Request',
          itRequestSubmitted: 'IT department submitted a request for additional $15,000',
          settlementPending: 'Settlement Pending',
          endOfQuarterSettlement: 'End of quarter settlement awaiting approval',
          enhancementCompleted: 'Enhancement Completed',
          operationsBudgetEnhanced: 'Operations budget enhanced by $50,000',
          // Time translations
          hoursAgo: (hours: number) => `${hours} hour${hours !== 1 ? 's' : ''} ago`,
          daysAgo: (days: number) => `${days} day${days !== 1 ? 's' : ''} ago`,
          target: 'Target',
          actual: 'Actual',
          budgetAllocation: 'Budget Allocation',
          actualSpending: 'Actual Spending',
        }
      }
    })

    /* ────── METRICS DATA ────── */
    const metrics = ref([
      {
        title: 'Total Budget',
        value: '$1,234,567',
        trend: 'up',
        percentage: '12.5',
        icon: 'fas fa-dollar-sign',
      },
      {
        title: 'Allocated Funds',
        value: '$987,432',
        trend: 'up',
        percentage: '8.2',
        icon: 'fas fa-chart-pie',
      },
      {
        title: 'Pending Approvals',
        value: '23',
        trend: 'down',
        percentage: '3.1',
        icon: 'fas fa-clock',
      },
      {
        title: 'Completed Transfers',
        value: '156',
        trend: 'up',
        percentage: '15.3',
        icon: 'fas fa-exchange-alt',
      },
    ])

    const localizedMetrics = computed(() => {
      return metrics.value.map((metric) => {
        let title = metric.title
        // Map English titles to Arabic when in RTL mode
        if (isRTL.value) {
          if (metric.title === 'Total Budget') title = translations.value.totalBudget
          else if (metric.title === 'Allocated Funds') title = translations.value.allocatedFunds
          else if (metric.title === 'Pending Approvals') title = translations.value.pendingApprovals
          else if (metric.title === 'Completed Transfers')
            title = translations.value.completedTransfers
        }
        return {
          ...metric,
          title,
        }
      })
    })

    /* ────── CHART DATA ────── */
    const lineChartData = computed(() => ({
      labels: isRTL.value
        ? translations.value.months
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: isRTL.value ? translations.value.budgetAllocation : 'Budget Allocation',
          data: [65, 59, 80, 81, 56, 55, 40, 62, 69, 75, 82, 91],
          borderColor: '#8a2a44',
          backgroundColor: 'rgba(138,42,68,.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: isRTL.value ? translations.value.actualSpending : 'Actual Spending',
          data: [28, 48, 40, 19, 86, 27, 90, 45, 52, 65, 59, 80],
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74,144,226,.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    }))

    const doughnutChartData = computed(() => ({
      labels: isRTL.value
        ? translations.value.departments
        : ['Operations', 'Marketing', 'IT', 'HR', 'Research'],
      datasets: [
        {
          data: [30, 25, 20, 15, 10],
          backgroundColor: ['#8a2a44', '#4a90e2', '#50e3c2', '#f5a623', '#b8e986'],
        },
      ],
    }))

    const barChartData = computed(() => ({
      labels: isRTL.value ? translations.value.quarters : ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: isRTL.value ? translations.value.target : 'Target',
          data: [100, 120, 140, 160],
          backgroundColor: 'rgba(138,42,68,.6)',
        },
        {
          label: isRTL.value ? translations.value.actual : 'Actual',
          data: [90, 115, 135, 170],
          backgroundColor: 'rgba(74,144,226,.6)',
        },
      ],
    }))

    /* ────── CHART OPTIONS ────── */
    const getChartOptions = (isDark: boolean) => {
      const textColor = isDark ? '#e2e2e2' : '#1e293b'
      const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
            labels: { color: textColor },
          },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } },
        },
      }
    }

    const baseOptions = computed(() => getChartOptions(isDarkMode.value))
    const lineOpts = computed(() => baseOptions.value)
    const doughnutOpts = computed(() => ({
      ...baseOptions.value,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: { color: isDarkMode.value ? '#e2e2e2' : '#1e293b' },
        },
      },
    }))
    const barOpts = computed(() => baseOptions.value)

    /* ────── CANVAS REFS ────── */
    const lineChart = ref<HTMLCanvasElement | null>(null)
    const doughnutChart = ref<HTMLCanvasElement | null>(null)
    const barChart = ref<HTMLCanvasElement | null>(null)

    /* ────── CHART INSTANCES ────── */
    let lineInstance: Chart | null = null
    let doughnutInstance: Chart | null = null
    let barInstance: Chart | null = null

    const chartsReady = ref<boolean>(false)

    const destroyCharts = () => {
      if (lineInstance) lineInstance.destroy()
      if (doughnutInstance) doughnutInstance.destroy()
      if (barInstance) barInstance.destroy()
      lineInstance = null
      doughnutInstance = null
      barInstance = null
    }

    const createCharts = () => {
      destroyCharts()
      if (lineChart.value) {
        const ctx = lineChart.value.getContext('2d')
        if (ctx) {
          lineInstance = new Chart(ctx, {
            type: 'line',
            data: lineChartData.value,
            options: lineOpts.value,
          }) as Chart
        }
      }
      if (doughnutChart.value) {
        const ctx = doughnutChart.value.getContext('2d')
        if (ctx) {
          doughnutInstance = new Chart(ctx, {
            type: 'doughnut',
            data: doughnutChartData.value,
            options: doughnutOpts.value,
          }) as Chart
        }
      }
      if (barChart.value) {
        const ctx = barChart.value.getContext('2d')
        if (ctx) {
          barInstance = new Chart(ctx, {
            type: 'bar',
            data: barChartData.value,
            options: barOpts.value,
          }) as Chart
        }
      }
    }

    /* ────── RECENT ACTIVITIES ────── */
    const recentActivities = ref([
      {
        title: 'Budget Transfer Approved',
        description: 'Transfer of $25,000 to Marketing department approved',
        time: '2 hours ago',
        type: 'success',
        icon: 'fas fa-check-circle',
      },
      {
        title: 'New Budget Request',
        description: 'IT department submitted a request for additional $15,000',
        time: '5 hours ago',
        type: 'info',
        icon: 'fas fa-info-circle',
      },
      {
        title: 'Settlement Pending',
        description: 'End of quarter settlement awaiting approval',
        time: '1 day ago',
        type: 'warning',
        icon: 'fas fa-exclamation-circle',
      },
      {
        title: 'Enhancement Completed',
        description: 'Operations budget enhanced by $50,000',
        time: '2 days ago',
        type: 'success',
        icon: 'fas fa-check-circle',
      },
    ])

    const localizedActivities = computed(() => {
      return recentActivities.value.map((activity) => {
        // Default to English values
        let title = activity.title
        let description = activity.description
        let time = activity.time

        // Apply Arabic translations when in RTL mode
        if (isRTL.value) {
          if (activity.title === 'Budget Transfer Approved') {
            title = translations.value.budgetTransferApproved
            description = translations.value.transferApproved
          } else if (activity.title === 'New Budget Request') {
            title = translations.value.newBudgetRequest
            description = translations.value.itRequestSubmitted
          } else if (activity.title === 'Settlement Pending') {
            title = translations.value.settlementPending
            description = translations.value.endOfQuarterSettlement
          } else if (activity.title === 'Enhancement Completed') {
            title = translations.value.enhancementCompleted
            description = translations.value.operationsBudgetEnhanced
          }

          // Translate time strings
          if (activity.time === '2 hours ago') {
            time = translations.value.hoursAgo(2)
          } else if (activity.time === '5 hours ago') {
            time = translations.value.hoursAgo(5)
          } else if (activity.time === '1 day ago') {
            time = translations.value.daysAgo(1)
          } else if (activity.time === '2 days ago') {
            time = translations.value.daysAgo(2)
          }
        }

        return {
          ...activity,
          title,
          description,
          time,
        }
      })
    })

    /* ────── HANDLE THEME TOGGLE ────── */
    watch(
      () => isDarkMode.value,
      () => {
        if (chartsReady.value) {
          nextTick(() => createCharts())
        }
      },
    )

    /* ────── HANDLE CHART RECREATION ON LANGUAGE CHANGE ────── */
    watch(
      () => currentLang.value,
      () => {
        if (chartsReady.value) {
          nextTick(() => createCharts())
        }
      },
    )

    /* ────── LIFECYCLE ────── */
    onMounted(async () => {
      await nextTick()
      chartsReady.value = true
      setTimeout(() => {
        if (lineChart.value && doughnutChart.value && barChart.value) {
          createCharts()
        } else {
          console.error('Chart canvas elements not found')
        }
      }, 300)
    })

    onUnmounted(() => {
      destroyCharts()
    })

    return {
      isDarkMode,
      isRTL,
      translations,
      localizedMetrics,
      localizedActivities,
      recentActivities,
      chartsReady,
      lineChart,
      doughnutChart,
      barChart,
    }
  },
}
</script>

<style scoped>
.dashboard {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 100%;
  overflow-x: hidden;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  position: relative;
  display: inline-block;
}

.dashboard-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #8a2a44, #e63946);
  border-radius: 4px;
}

.dashboard-subtitle {
  color: #64748b;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.metric-card.up {
  border-left-color: #10b981;
}

.metric-card.down {
  border-left-color: #ef4444;
}

.metric-icon {
  background: #f3f4f6;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: #8a2a44;
  font-size: 1.25rem;
}

.metric-content {
  flex: 1;
}

.metric-content h3 {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.metric-trend {
  font-size: 0.813rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.metric-card.up .metric-trend {
  color: #10b981;
}

.metric-card.down .metric-trend {
  color: #ef4444;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 350px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.chart-card canvas {
  flex: 1;
  width: 100% !important;
  height: calc(100% - 40px) !important;
  position: relative;
}

.chart-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.main-chart {
  grid-column: span 2;
  height: 380px;
}

/* Recent Activities */
.recent-activities {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.recent-activities h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1.25rem;
  position: relative;
  display: inline-block;
}

.recent-activities h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #8a2a44, #e63946);
  border-radius: 3px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #f1f5f9;
  transform: translateX(5px);
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: white;
  flex-shrink: 0;
}

.activity-icon.success {
  background: #10b981;
}

.activity-icon.warning {
  background: #f59e0b;
}

.activity-icon.info {
  background: #3b82f6;
}

.activity-icon.error {
  background: #ef4444;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.activity-description {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.activity-time {
  color: #94a3b8;
  font-size: 0.75rem;
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .main-chart {
    grid-column: span 1;
  }

  .chart-card {
    height: 320px;
  }
}

@media (max-width: 900px) {
  .chart-card {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .chart-card {
    height: 280px;
  }
}

@media (max-width: 640px) {
  .chart-card {
    height: 260px;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 1rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .chart-card {
    height: 240px;
    padding: 1rem;
  }

  .metric-card {
    padding: 1rem;
  }

  .recent-activities {
    padding: 1rem;
  }
}

/* Dark mode support */
.dashboard.dark-mode {
  background: #2d3748;
  color: #e2e2e2;
}

.dark-mode .dashboard-title {
  color: #e2e2e2;
}

.dark-mode .dashboard-subtitle {
  color: #a0a0b8;
}

.dark-mode .metric-card {
  background: #1e1e2d;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.dark-mode .metric-value {
  color: #e2e2e2;
}

.dark-mode .metric-content h3 {
  color: #a0a0b8;
}

.dark-mode .metric-icon {
  background: #2a2a3c;
  color: #e2e2e2;
}

.dark-mode .chart-card,
.dark-mode .recent-activities {
  background: #1e1e2d;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.dark-mode .chart-card h3,
.dark-mode .recent-activities h3 {
  color: #e2e2e2;
}

.dark-mode .activity-item {
  background: #2a2a3c;
}

.dark-mode .activity-item:hover {
  background: #323248;
}

.dark-mode .activity-title {
  color: #e2e2e2;
}

.dark-mode .activity-description {
  color: #a0a0b8;
}

.dark-mode .activity-time {
  color: #8f8fa8;
}

/* Add loading state for charts */
.loading-chart {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-style: italic;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  margin-top: 5px;
}

.dark-mode .loading-chart {
  background: rgba(255, 255, 255, 0.05);
  color: #a0a0b8;
}

/* RTL Support */
.dashboard.rtl {
  direction: rtl;
  text-align: right;
}

.rtl .dashboard-title::after {
  right: 0;
  left: auto;
}

.rtl .metric-card {
  border-left: none;
  border-right: 4px solid transparent;
}

.rtl .metric-card.up {
  border-right-color: #10b981;
}

.rtl .metric-card.down {
  border-right-color: #ef4444;
}

.rtl .metric-icon {
  margin-right: 0;
  margin-left: 1rem;
}

.rtl .metric-trend {
  flex-direction: row-reverse;
}

.rtl .activity-item:hover {
  transform: translateX(-5px);
}

.rtl .activity-icon {
  margin-right: 0;
  margin-left: 1rem;
}

.rtl .recent-activities h3::after {
  right: 0;
  left: auto;
}
</style>
