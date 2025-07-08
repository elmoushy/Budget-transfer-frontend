<!-- DashboardView.vue -->
<template>
  <div class="dashboard" :class="{ 'dark-mode': isDarkMode, rtl: isRTL }">
    <div class="page-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>
    <div class="dashboard-header">
      <div>
        <h1 class="dashboard-title">{{ translations.dashboard }}</h1>
        <p class="dashboard-subtitle">{{ translations.welcomeMessage }}</p>
      </div>
      <div class="dashboard-actions">
        <button @click="refreshDashboard" class="refresh-button" :disabled="isLoading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
          {{ translations.refresh }}
        </button>
        <!-- <div class="time-filter">
          <select v-model="timeFilter" @change="handleTimeFilterChange">
            <option value="week">{{ translations.thisWeek }}</option>
            <option value="month">{{ translations.thisMonth }}</option>
            <option value="quarter">{{ translations.thisQuarter }}</option>
            <option value="year">{{ translations.thisYear }}</option>
          </select>
        </div> -->
      </div>
    </div>

    <!-- ────── METRICS CARDS ────── -->
    <div class="metrics-grid">
      <div
        class="metric-card"
        :class="getTrendClass(dashboardData?.approved_transfers, dashboardData?.total_transfers)"
      >
        <div class="metric-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="metric-content">
          <h3>{{ translations.approvedTransfers }}</h3>
          <div class="metric-value">{{ dashboardData?.approved_transfers || 0 }}</div>
          <div class="metric-trend">
            <i
              :class="
                getTrendClass(dashboardData?.approved_transfers, dashboardData?.total_transfers) ===
                'up'
                  ? 'fas fa-arrow-up'
                  : 'fas fa-arrow-down'
              "
            ></i>
            {{ getPercentage(dashboardData?.approved_transfers, dashboardData?.total_transfers) }}%
            {{ translations.ofTotal }}
          </div>
        </div>
        <div class="metric-glow"></div>
      </div>

      <div
        class="metric-card"
        :class="
          getTrendClass(dashboardData?.rejected_transfers, dashboardData?.total_transfers, true)
        "
      >
        <div class="metric-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="metric-content">
          <h3>{{ translations.rejectedTransfers }}</h3>
          <div class="metric-value">{{ dashboardData?.rejected_transfers || 0 }}</div>
          <div class="metric-trend">
            <i
              :class="
                getTrendClass(
                  dashboardData?.rejected_transfers,
                  dashboardData?.total_transfers,
                  true,
                ) === 'up'
                  ? 'fas fa-arrow-up'
                  : 'fas fa-arrow-down'
              "
            ></i>
            {{ getPercentage(dashboardData?.rejected_transfers, dashboardData?.total_transfers) }}%
            {{ translations.ofTotal }}
          </div>
        </div>
        <div class="metric-glow"></div>
      </div>

      <div class="metric-card" :class="getTotalPendingClass()">
        <div class="metric-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="metric-content">
          <h3>{{ translations.pendingTransfers }}</h3>
          <div class="metric-value">{{ getTotalPending() }}</div>
          <div class="metric-trend">
            <i
              :class="getTotalPendingClass() === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"
            ></i>
            {{ getPercentage(getTotalPending(), dashboardData?.total_transfers) }}%
            {{ translations.ofTotal }}
          </div>
        </div>
        <div class="metric-glow"></div>
      </div>

      <div
        class="metric-card"
        :class="getTrendClass(dashboardData?.total_transfers, previousTotalTransfers)"
      >
        <div class="metric-icon">
          <i class="fas fa-exchange-alt"></i>
        </div>
        <div class="metric-content">
          <h3>{{ translations.totalTransfers }}</h3>
          <div class="metric-value">{{ dashboardData?.total_transfers || 0 }}</div>
          <div class="metric-trend">
            <i
              :class="
                getTrendClass(dashboardData?.total_transfers, previousTotalTransfers) === 'up'
                  ? 'fas fa-arrow-up'
                  : 'fas fa-arrow-down'
              "
            ></i>
            {{ getChangedPercentage(dashboardData?.total_transfers, previousTotalTransfers) }}%
            {{ translations.sinceLast }}
          </div>
        </div>
        <div class="metric-glow"></div>
      </div>
    </div>

    <!-- ────── TRANSFER TYPE BREAKDOWN ────── -->
    <div class="transfer-breakdown">
      <h3 class="section-title">{{ translations.transferTypeBreakdown }}</h3>
      <div class="transfer-types-grid">
        <div class="transfer-type-card">
          <div class="transfer-type-icon far">
            <i class="fas fa-money-bill-transfer"></i>
          </div>
          <div class="transfer-type-content">
            <h4>{{ translations.farTransfers }}</h4>
            <div class="transfer-type-value">{{ dashboardData?.total_transfers_far || 0 }}</div>
            <div class="transfer-type-percent">
              {{
                getPercentage(dashboardData?.total_transfers_far, dashboardData?.total_transfers)
              }}%
            </div>
          </div>
        </div>

        <div class="transfer-type-card">
          <div class="transfer-type-icon afr">
            <i class="fas fa-handshake"></i>
          </div>
          <div class="transfer-type-content">
            <h4>{{ translations.afrTransfers }}</h4>
            <div class="transfer-type-value">{{ dashboardData?.total_transfers_afr || 0 }}</div>
            <div class="transfer-type-percent">
              {{
                getPercentage(dashboardData?.total_transfers_afr, dashboardData?.total_transfers)
              }}%
            </div>
          </div>
        </div>

        <div class="transfer-type-card">
          <div class="transfer-type-icon fad">
            <i class="fas fa-credit-card"></i>
          </div>
          <div class="transfer-type-content">
            <h4>{{ translations.fadTransfers }}</h4>
            <div class="transfer-type-value">{{ dashboardData?.total_transfers_fad || 0 }}</div>
            <div class="transfer-type-percent">
              {{
                getPercentage(dashboardData?.total_transfers_fad, dashboardData?.total_transfers)
              }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ────── CHARTS ────── -->
    <div class="charts-grid">
      <div class="chart-card main-chart">
        <h3>{{ translations.transferFlow }}</h3>
        <div v-if="isLoading" class="loading-chart">{{ translations.loadingChart }}</div>
        <canvas
          v-else-if="chartsReady"
          id="transferFlowChart"
          ref="transferFlowChart"
          class="animated-chart"
        ></canvas>
        <div v-else class="loading-chart">{{ translations.loadingChart }}</div>
      </div>

      <!-- Futuristic Approval Levels Visualization -->
      <div class="chart-card approval-levels-card">
        <h3>{{ translations.approvalLevels }}</h3>
        <div v-if="isLoading" class="loading-chart">{{ translations.loadingChart }}</div>
        <div v-else-if="dashboardData" class="approval-levels-container">
          <div class="approval-levels-grid">
            <div
              v-for="(level, index) in getApprovalLevelsData()"
              :key="index"
              class="approval-level-item"
              :class="`level-${index + 1}`"
            >
              <div class="level-circle">
                <div
                  class="level-progress"
                  :style="getLevelProgressStyle(level.value, level.total)"
                >
                  <div class="level-inner">
                    <div class="level-number" style="color: black !important">
                      {{ level.value }}
                    </div>
                    <div class="level-label" style="color: black !important">{{ level.label }}</div>
                  </div>
                </div>
              </div>
              <div class="level-percentage">
                <span style="color: black !important"
                  >{{ getLevelPercentage(level.value, level.total) }}%</span
                >
              </div>
            </div>
          </div>
          <div class="approval-summary">
            <div class="summary-item">
              <span class="summary-label">{{ translations.pendingTransfers }}</span>
              <span class="summary-value">{{ getTotalPending() }}</span>
            </div>
          </div>
        </div>
        <div v-else class="loading-chart">{{ translations.loadingChart }}</div>
      </div>

      <!-- Futuristic Cost Center Distribution -->
      <div class="chart-card cost-center-card">
        <h3>{{ translations.costCenterDistribution }}</h3>
        <div v-if="isLoading" class="loading-chart">{{ translations.loadingChart }}</div>
        <div v-else-if="dashboardData" class="cost-center-container">
          <div class="cost-center-network">
            <div
              v-for="(center, index) in getCostCenterNetworkData()"
              :key="index"
              class="cost-center-node"
              :class="center.type"
              :style="getCenterNodeStyle(index, getCostCenterNetworkData().length)"
            >
              <div class="node-core">
                <div class="node-pulse"></div>
                <div class="node-content">
                  <div class="node-code" style="font-size: 0.85rem; margin-bottom: 0.25rem">
                    {{ center.code }}
                  </div>
                  <div class="node-amount" style="font-size: 0.75rem; font-weight: 600">
                    {{ formatCurrency(center.amount) }}
                  </div>
                </div>
              </div>
              <div class="node-connections" v-if="center.connections">
                <div
                  v-for="(connection, connIndex) in center.connections"
                  :key="connIndex"
                  class="connection-line"
                  :style="getConnectionStyle(connection)"
                ></div>
              </div>
            </div>
          </div>
          <div class="cost-center-legend">
            <div class="legend-item outgoing">
              <div class="legend-dot"></div>
              <span>{{ translations.outgoing }}</span>
            </div>
            <div class="legend-item incoming">
              <div class="legend-dot"></div>
              <span>{{ translations.incoming }}</span>
            </div>
          </div>
        </div>
        <div v-else class="loading-chart">{{ translations.loadingChart }}</div>
      </div>
    </div>

    <!-- ────── TRANSFER FLOWS & ANALYSIS ────── -->
    <div class="data-analysis-section">
      <h3 class="section-title">{{ translations.transferAnalysis }}</h3>
      <div class="tabs">
        <button
          v-for="(tab, index) in analysisTabs"
          :key="index"
          @click="activeTab = tab.id"
          :class="{ active: activeTab === tab.id }"
          class="tab-button"
        >
          <i :class="tab.icon"></i> {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Filtered Combinations -->
        <div v-if="activeTab === 'filtered'" class="filtered-combinations">
          <div v-if="!dashboardData?.filtered_combinations.length" class="no-data">
            {{ translations.noFilteredData }}
          </div>
          <div v-else class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ translations.costCenter }}</th>
                  <th>{{ translations.accountCode }}</th>
                  <th>{{ translations.outgoing }}</th>
                  <th>{{ translations.incoming }}</th>
                  <th>{{ translations.netFlow }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in dashboardData?.filtered_combinations" :key="index">
                  <td>
                    <span class="code-badge">{{ item.cost_center_code_str }}</span>
                  </td>
                  <td>
                    <span class="code-badge">{{ item.account_code_str }}</span>
                  </td>
                  <td :class="{ negative: item.total_from_center > 0 }">
                    {{ formatCurrency(item.total_from_center) }}
                  </td>
                  <td :class="{ positive: item.total_to_center > 0 }">
                    {{ formatCurrency(item.total_to_center) }}
                  </td>
                  <td :class="getNetFlowClass(item.total_to_center - item.total_from_center)">
                    {{ formatCurrency(item.total_to_center - item.total_from_center) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cost Center Totals -->
        <div v-if="activeTab === 'costcenters'" class="cost-center-totals">
          <div v-if="!dashboardData?.cost_center_totals.length" class="no-data">
            {{ translations.noCostCenterData }}
          </div>
          <div v-else class="cost-center-flows">
            <div
              v-for="(transferGroup, groupIndex) in dashboardData?.cost_center_totals"
              :key="'cg-' + groupIndex"
              class="transfer-group"
            >
              <h4>{{ translations.transferGroup }} {{ groupIndex + 1 }}</h4>
              <div class="flow-card">
                <div class="flow-visualization">
                  <div class="flow-node from">
                    <span class="node-label">{{
                      getFromCenterInGroup(transferGroup)?.cost_center_code_str || ''
                    }}</span>
                    <span class="node-amount">{{
                      formatCurrency(getFromCenterInGroup(transferGroup)?.total_from_center || 0)
                    }}</span>
                  </div>
                  <div class="flow-arrow">
                    <i class="fas fa-arrow-right"></i>
                  </div>
                  <div class="flow-node to">
                    <span class="node-label">{{
                      getToCenterInGroup(transferGroup)?.cost_center_code_str || ''
                    }}</span>
                    <span class="node-amount">{{
                      formatCurrency(getToCenterInGroup(transferGroup)?.total_to_center || 0)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Code Totals -->
        <div v-if="activeTab === 'accounts'" class="account-code-totals">
          <div v-if="!dashboardData?.account_code_totals.length" class="no-data">
            {{ translations.noAccountData }}
          </div>
          <div v-else class="account-flows">
            <div
              v-for="(accountGroup, groupIndex) in dashboardData?.account_code_totals"
              :key="'ag-' + groupIndex"
              class="transfer-group"
            >
              <h4>{{ translations.accountGroup }} {{ groupIndex + 1 }}</h4>
              <div class="flow-card">
                <div class="flow-visualization">
                  <div class="flow-node from">
                    <span class="node-label">{{
                      getFromAccountInGroup(accountGroup)?.account_code_str || ''
                    }}</span>
                    <span class="node-amount">{{
                      formatCurrency(getFromAccountInGroup(accountGroup)?.total_from_center || 0)
                    }}</span>
                  </div>
                  <div class="flow-arrow">
                    <i class="fas fa-arrow-right"></i>
                  </div>
                  <div class="flow-node to">
                    <span class="node-label">{{
                      getToAccountInGroup(accountGroup)?.account_code_str || ''
                    }}</span>
                    <span class="node-amount">{{
                      formatCurrency(getToAccountInGroup(accountGroup)?.total_to_center || 0)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- All Combinations -->
        <div v-if="activeTab === 'all'" class="all-combinations">
          <div v-if="!dashboardData?.all_combinations.length" class="no-data">
            {{ translations.noAllCombinationsData }}
          </div>
          <div v-else class="all-flows">
            <div
              v-for="(comboGroup, groupIndex) in dashboardData?.all_combinations"
              :key="'comb-' + groupIndex"
              class="combo-group"
            >
              <h4>{{ translations.transferGroup }} {{ groupIndex + 1 }}</h4>
              <div class="combo-card">
                <div class="combo-visualization">
                  <div class="combo-node from">
                    <span class="combo-center">{{
                      getFromCenterAccountCombo(comboGroup)?.cost_center_code_str || ''
                    }}</span>
                    <span class="combo-account">{{
                      getFromCenterAccountCombo(comboGroup)?.account_code_str || ''
                    }}</span>
                    <span class="combo-amount">{{
                      formatCurrency(getFromCenterAccountCombo(comboGroup)?.total_from_center || 0)
                    }}</span>
                  </div>
                  <div class="combo-arrow">
                    <i class="fas fa-arrow-right"></i>
                  </div>
                  <div class="combo-node to">
                    <span class="combo-center">{{
                      getToCenterAccountCombo(comboGroup)?.cost_center_code_str || ''
                    }}</span>
                    <span class="combo-account">{{
                      getToCenterAccountCombo(comboGroup)?.account_code_str || ''
                    }}</span>
                    <span class="combo-amount">{{
                      formatCurrency(getToCenterAccountCombo(comboGroup)?.total_to_center || 0)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'
import { useThemeStore } from '@/stores/themeStore'
import { useDashboardService } from '@/services/dashboardService'
import type {
  CostCenterTotal,
  AccountCodeTotal,
  CostCenterAccountCombo,
} from '@/services/dashboardService'

export default {
  name: 'DashboardView',
  setup() {
    /* ────── API DATA FETCHING ────── */
    const { dashboardData, currencyData, isLoading, error, fetchDashboardData } =
      useDashboardService()
    const previousTotalTransfers = ref(0)
    const timeFilter = ref('month')

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
          welcomeMessage: 'مرحبًا بعودتك! إليك نظرة عامة على الميزانية.',
          totalBudget: 'الميزانية الإجمالية',
          allocatedFunds: 'الأموال المخصصة',
          pendingApprovals: 'الموافقات المعلقة',
          completedTransfers: 'التحويلات المكتملة',
          loadingChart: 'جاري تحميل بيانات الرسم البياني...',
          sinceLast: 'منذ الفترة السابقة',
          ofTotal: 'من الإجمالي',
          // New dashboard translations
          approvedTransfers: 'التحويلات المعتمدة',
          rejectedTransfers: 'التحويلات المرفوضة',
          pendingTransfers: 'التحويلات المعلقة',
          totalTransfers: 'إجمالي التحويلات',
          transferTypeBreakdown: 'تفصيل أنواع التحويلات',
          farTransfers: 'تحويلات FAR',
          afrTransfers: 'تحويلات AFR',
          fadTransfers: 'تحويلات FAD',
          transferFlow: 'تدفق التحويلات',
          approvalLevels: 'مستويات الموافقة',
          costCenterDistribution: 'توزيع مراكز التكلفة',
          transferAnalysis: 'تحليل التحويلات',
          filteredCombinations: 'التركيبات المصفاة',
          costCenterTotals: 'إجماليات مركز التكلفة',
          accountCodeTotals: 'إجماليات رموز الحساب',
          allCombinations: 'جميع التركيبات',
          costCenter: 'مركز التكلفة',
          accountCode: 'رمز الحساب',
          outgoing: 'صادر',
          incoming: 'وارد',
          netFlow: 'التدفق الصافي',
          noFilteredData: 'لا توجد بيانات مصفاة متاحة',
          noCostCenterData: 'لا توجد بيانات لمركز التكلفة متاحة',
          noAccountData: 'لا توجد بيانات رمز الحساب متاحة',
          noAllCombinationsData: 'لا توجد بيانات للتركيبات متاحة',
          transferGroup: 'مجموعة التحويل',
          accountGroup: 'مجموعة الحساب',
          refresh: 'تحديث',
          thisWeek: 'هذا الأسبوع',
          thisMonth: 'هذا الشهر',
          thisQuarter: 'هذا الربع',
          thisYear: 'هذا العام',
          level1: 'المستوى 1',
          level2: 'المستوى 2',
          level3: 'المستوى 3',
          level4: 'المستوى 4',
          from: 'من',
          to: 'إلى',
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
        }
      } else {
        return {
          dashboard: 'Dashboard',
          welcomeMessage: "Welcome back! Here's an overview of your budget.",
          totalBudget: 'Total Budget',
          allocatedFunds: 'Allocated Funds',
          pendingApprovals: 'Pending Approvals',
          completedTransfers: 'Completed Transfers',
          loadingChart: 'Loading chart data...',
          sinceLast: 'since last period',
          ofTotal: 'of total',
          // New dashboard translations
          approvedTransfers: 'Approved Transfers',
          rejectedTransfers: 'Rejected Transfers',
          pendingTransfers: 'Pending Transfers',
          totalTransfers: 'Total Transfers',
          transferTypeBreakdown: 'Transfer Type Breakdown',
          farTransfers: 'FAR Transfers',
          afrTransfers: 'AFR Transfers',
          fadTransfers: 'FAD Transfers',
          transferFlow: 'Transfer Flow',
          approvalLevels: 'Approval Levels',
          costCenterDistribution: 'Cost Center Distribution',
          transferAnalysis: 'Transfer Analysis',
          filteredCombinations: 'Filtered Combinations',
          costCenterTotals: 'Cost Center Totals',
          accountCodeTotals: 'Account Code Totals',
          allCombinations: 'All Combinations',
          costCenter: 'Cost Center',
          accountCode: 'Account Code',
          outgoing: 'Outgoing',
          incoming: 'Incoming',
          netFlow: 'Net Flow',
          noFilteredData: 'No filtered data available',
          noCostCenterData: 'No cost center data available',
          noAccountData: 'No account code data available',
          noAllCombinationsData: 'No combinations data available',
          transferGroup: 'Transfer Group',
          accountGroup: 'Account Group',
          refresh: 'Refresh',
          thisWeek: 'This Week',
          thisMonth: 'This Month',
          thisQuarter: 'This Quarter',
          thisYear: 'This Year',
          level1: 'Level 1',
          level2: 'Level 2',
          level3: 'Level 3',
          level4: 'Level 4',
          from: 'From',
          to: 'To',
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
        }
      }
    })

    /* ────── CHART INSTANCES ────── */
    let transferFlowInstance: Chart | null = null

    const chartsReady = ref<boolean>(false)

    // Fix chart canvas references
    const transferFlowChart = ref<HTMLCanvasElement | null>(null)

    const destroyCharts = () => {
      if (transferFlowInstance) {
        transferFlowInstance.destroy()
        transferFlowInstance = null
      }
    }

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
        animation: {
          duration: 2000,
        },
      }
    }

    const baseOptions = computed(() => getChartOptions(isDarkMode.value))

    const transferFlowOpts = computed(() => baseOptions.value)

    const generateTransferFlowData = () => {
      // This would ideally be generated from the actual data
      // For now, we'll simulate it based on API data if available
      if (!dashboardData.value) {
        return {
          labels: translations.value.months,
          datasets: [],
        }
      }

      // Generate some mock flow data based on the totals we have
      const totalTransfers = dashboardData.value.total_transfers || 0
      const approvedTransfers = dashboardData.value.approved_transfers || 0
      const rejectedTransfers = dashboardData.value.rejected_transfers || 0

      const mockApprovedData = Array(12)
        .fill(0)
        .map(() => Math.floor(Math.random() * (approvedTransfers / 2)))
      const mockRejectedData = Array(12)
        .fill(0)
        .map(() => Math.floor(Math.random() * (rejectedTransfers / 2)))
      const mockPendingData = Array(12)
        .fill(0)
        .map(() =>
          Math.floor(
            Math.random() * ((totalTransfers - approvedTransfers - rejectedTransfers) / 2),
          ),
        )

      return {
        labels: translations.value.months,
        datasets: [
          {
            label: translations.value.approvedTransfers,
            data: mockApprovedData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.2)',
            fill: true,
            tension: 0.4,
          },
          {
            label: translations.value.rejectedTransfers,
            data: mockRejectedData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.2)',
            fill: true,
            tension: 0.4,
          },
          {
            label: translations.value.pendingTransfers,
            data: mockPendingData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245,158,11,0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      }
    }

    const createCharts = async () => {
      // Wait for next tick to ensure DOM is updated
      await nextTick()

      // Destroy existing charts first
      destroyCharts()

      console.log('Creating charts...')
      console.log('transferFlowChart.value:', transferFlowChart.value)
      console.log('dashboardData.value:', dashboardData.value)

      // Transfer Flow Chart
      if (transferFlowChart.value) {
        const ctx = transferFlowChart.value.getContext('2d')
        if (ctx) {
          console.log('Creating transfer flow chart...')
          transferFlowInstance = new Chart(ctx, {
            type: 'line',
            data: generateTransferFlowData(),
            options: transferFlowOpts.value,
          })
          console.log('Transfer flow chart created successfully')
        } else {
          console.error('Could not get 2D context for transfer flow chart')
        }
      } else {
        console.error('Transfer flow chart canvas element not found')
      }
    }

    /* ────── HANDLE THEME TOGGLE ────── */
    watch(
      () => isDarkMode.value,
      () => {
        if (chartsReady.value && dashboardData.value) {
          createCharts()
        }
      },
    )

    /* ────── HANDLE CHART RECREATION ON LANGUAGE CHANGE ────── */
    watch(
      () => currentLang.value,
      () => {
        if (chartsReady.value && dashboardData.value) {
          createCharts()
        }
      },
    )

    // Watch for dashboard data changes
    watch(
      () => dashboardData.value,
      (newData) => {
        if (newData && chartsReady.value) {
          setTimeout(() => {
            createCharts()
          }, 100)
        }
      },
    )

    /* ────── LIFECYCLE ────── */
    onMounted(async () => {
      console.log('Dashboard component mounted')

      // Fetch dashboard data first
      await fetchDashboardData()

      // Wait for next tick to ensure DOM is rendered
      await nextTick()

      // Mark charts as ready
      chartsReady.value = true

      // Wait a bit more for canvas elements to be in DOM
      setTimeout(async () => {
        console.log('Attempting to create charts after timeout...')
        console.log('Canvas elements:', {
          transferFlow: transferFlowChart.value,
        })

        if (dashboardData.value && transferFlowChart.value) {
          await createCharts()
        } else {
          console.error('Chart creation failed - missing elements or data:', {
            dashboardData: !!dashboardData.value,
            transferFlowChart: !!transferFlowChart.value,
          })
        }
      }, 500)
    })

    onUnmounted(() => {
      destroyCharts()
    })

    /* ────── DATA ANALYSIS TABS ────── */
    const activeTab = ref('filtered')

    const analysisTabs = computed(() => [
      { id: 'filtered', label: translations.value.filteredCombinations, icon: 'fas fa-filter' },
      { id: 'costcenters', label: translations.value.costCenterTotals, icon: 'fas fa-building' },
      { id: 'accounts', label: translations.value.accountCodeTotals, icon: 'fas fa-file-invoice' },
      { id: 'all', label: translations.value.allCombinations, icon: 'fas fa-project-diagram' },
    ])

    /* ────── HELPER METHODS ────── */
    const refreshDashboard = () => {
      // Store previous values for trend calculation
      if (dashboardData.value) {
        previousTotalTransfers.value = dashboardData.value.total_transfers
      }
      fetchDashboardData()
    }

    const handleTimeFilterChange = () => {
      // In a real implementation, this would pass the filter to the API
      refreshDashboard()
    }

    const getTrendClass = (
      current: number | undefined,
      previous: number | undefined,
      inversed = false,
    ) => {
      if (!current || !previous) return 'neutral'
      const trend = current > previous ? 'up' : current < previous ? 'down' : 'neutral'
      return inversed ? (trend === 'up' ? 'down' : trend === 'down' ? 'up' : 'neutral') : trend
    }

    const getPercentage = (part: number | undefined, total: number | undefined) => {
      if (!part || !total) return '0'
      return ((part / total) * 100).toFixed(1)
    }

    const getChangedPercentage = (current: number | undefined, previous: number | undefined) => {
      if (!current || !previous) return '0'
      if (previous === 0) return '100'
      return (((current - previous) / previous) * 100).toFixed(1)
    }

    const getTotalPending = () => {
      if (!dashboardData.value?.pending_transfers) return 0
      const { Level1, Level2, Level3, Level4 } = dashboardData.value.pending_transfers
      return Level1 + Level2 + Level3 + Level4
    }

    const getTotalPendingClass = () => {
      const totalPending = getTotalPending()
      const totalTransfers = dashboardData.value?.total_transfers || 0
      // If more than 30% are pending, consider it "high" (down trend)
      return totalPending / totalTransfers > 0.3 ? 'down' : 'up'
    }

    const formatCurrency = (amount: number) => {
      // Use dynamic currency icon if available, fallback to USD
      const currencyIcon = currencyData.value?.icon || '$'

      // For RTL languages and if we have Arabic currency, format differently
      if (isRTL.value && currencyData.value?.icon) {
        // For Arabic currencies, show amount first then currency
        return `${amount.toLocaleString('ar-SA')} ${currencyIcon}`
      }

      // For other currencies, use standard formatting but with dynamic currency
      const formattedAmount = new Intl.NumberFormat(isRTL.value ? 'ar-SA' : 'en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)

      return `${formattedAmount} ${currencyIcon}`
    }

    const getNetFlowClass = (amount: number) => {
      if (amount > 0) return 'positive'
      if (amount < 0) return 'negative'
      return ''
    }

    const getFromCenterInGroup = (group: CostCenterTotal[]) => {
      return group.find((item) => item.total_from_center > 0)
    }

    const getToCenterInGroup = (group: CostCenterTotal[]) => {
      return group.find((item) => item.total_to_center > 0)
    }

    const getFromAccountInGroup = (group: AccountCodeTotal[]) => {
      return group.find((item) => item.total_from_center > 0)
    }

    const getToAccountInGroup = (group: AccountCodeTotal[]) => {
      return group.find((item) => item.total_to_center > 0)
    }

    const getFromCenterAccountCombo = (group: CostCenterAccountCombo[]) => {
      return group.find((item) => item.total_from_center > 0)
    }

    const getToCenterAccountCombo = (group: CostCenterAccountCombo[]) => {
      return group.find((item) => item.total_to_center > 0)
    }

    /* ────── FETCH DATA ON MOUNT ────── */
    onMounted(async () => {
      await fetchDashboardData()
      await nextTick()
      chartsReady.value = true

      setTimeout(() => {
        if (dashboardData.value) {
          createCharts()
        }
      }, 300)
    })

    // New futuristic visualization methods
    const getApprovalLevelsData = () => {
      if (!dashboardData.value?.pending_transfers) return []

      const { Level1, Level2, Level3, Level4 } = dashboardData.value.pending_transfers
      const total = Level1 + Level2 + Level3 + Level4

      return [
        { label: translations.value.level1, value: Level1, total },
        { label: translations.value.level2, value: Level2, total },
        { label: translations.value.level3, value: Level3, total },
        { label: translations.value.level4, value: Level4, total },
      ]
    }

    const getLevelProgressStyle = (value: number, total: number) => {
      const percentage = total > 0 ? (value / total) * 100 : 0
      const rotation = (percentage / 100) * 360

      return {
        background: `conic-gradient(
          from 0deg,
          var(--level-color) 0deg,
          var(--level-color) ${rotation}deg,
          rgba(255, 255, 255, 0.1) ${rotation}deg,
          rgba(255, 255, 255, 0.1) 360deg
        )`,
      }
    }

    const getLevelPercentage = (value: number, total: number) => {
      return total > 0 ? ((value / total) * 100).toFixed(1) : '0'
    }

    const getCostCenterNetworkData = () => {
      if (!dashboardData.value?.filtered_combinations) return []

      const centers = new Map()

      dashboardData.value.filtered_combinations.forEach((item) => {
        if (item.total_from_center > 0) {
          centers.set(item.cost_center_code_str, {
            code: item.cost_center_code_str,
            amount: item.total_from_center,
            type: 'outgoing',
          })
        }
        if (item.total_to_center > 0) {
          centers.set(item.cost_center_code_str, {
            code: item.cost_center_code_str,
            amount: item.total_to_center,
            type: 'incoming',
          })
        }
      })

      return Array.from(centers.values()).slice(0, 6) // Limit to 6 for better visualization
    }

    const getCenterNodeStyle = (index: number, total: number) => {
      const angle = (index / total) * 360
      const radius = 80
      const x = Math.cos(((angle - 90) * Math.PI) / 180) * radius
      const y = Math.sin(((angle - 90) * Math.PI) / 180) * radius

      return {
        transform: `translate(${x}px, ${y}px)`,
        '--node-delay': `${index * 0.2}s`,
      }
    }

    const getConnectionStyle = (connection: { angle: number; strength: number }) => {
      return {
        transform: `rotate(${connection.angle}deg)`,
        width: `${connection.strength * 2}px`,
        opacity: connection.strength / 100,
      }
    }

    return {
      // Theme and UI
      isDarkMode,
      isRTL,
      translations,
      chartsReady,

      // Dashboard API data
      dashboardData,
      currencyData,
      isLoading,
      error,
      previousTotalTransfers,
      timeFilter,

      // Analysis and tabs
      analysisTabs,
      activeTab,

      // Chart refs - Fixed references
      transferFlowChart,

      // Helper methods
      refreshDashboard,
      handleTimeFilterChange,
      getTrendClass,
      getPercentage,
      getChangedPercentage,
      getTotalPending,
      getTotalPendingClass,
      formatCurrency,
      getNetFlowClass,
      getFromCenterInGroup,
      getToCenterInGroup,
      getFromAccountInGroup,
      getToAccountInGroup,
      getFromCenterAccountCombo,
      getToCenterAccountCombo,

      // New futuristic visualization methods
      getApprovalLevelsData,
      getLevelProgressStyle,
      getLevelPercentage,
      getCostCenterNetworkData,
      getCenterNodeStyle,
      getConnectionStyle,
    }
  },
}
</script>

<style scoped>
.dashboard {
  background: linear-gradient(135deg, #f8f6f8 0%, #fff6fa 35%, #f0e8f2 70%, #e8d5e8 100%);
  padding: 2rem;
  border-radius: 24px;
  max-width: 100%;
  overflow-x: hidden;
  position: relative;
  font-family: 'Inter', sans-serif;
  transition: all var(--transition-normal);
}

.dashboard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  opacity: 0.07;
  z-index: 0;
  border-radius: 24px 24px 0 0;
  transition: opacity var(--transition-normal);
}

.dashboard.dark-mode {
  background: linear-gradient(135deg, #1a1623 0%, #241726 35%, #2d1b32 70%, #362040 100%);
  color: #f8e9f0;
}

.dashboard.dark-mode::before {
  background: linear-gradient(135deg, #e14b6a, #d946ef);
  opacity: 0.12;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.dashboard-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.5rem;
}

.refresh-button {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(225, 75, 106, 0.3);
  position: relative;
  overflow: hidden;
}

.refresh-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(225, 75, 106, 0.4);
}

.refresh-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.dark-mode .refresh-button {
  background: linear-gradient(135deg, #e14b6a, #d946ef);
  box-shadow: 0 0 20px rgba(225, 75, 106, 0.4);
  color: white;
}

.dark-mode .refresh-button:hover {
  box-shadow: 0 0 25px rgba(225, 75, 106, 0.6);
}

.time-filter select {
  background: rgba(255, 246, 250, 0.9);
  border: 2px solid rgba(228, 201, 214, 0.4);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  color: #6d1a36;
  font-weight: 500;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23e14b6a' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.dark-mode .time-filter select {
  background: rgba(36, 23, 38, 0.9);
  border-color: rgba(81, 32, 60, 0.4);
  color: #e14b6a;
}

.time-filter select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(225, 75, 106, 0.2);
}

.dashboard-title {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem;
  position: relative;
  letter-spacing: -0.5px;
  transition: all 0.3s ease;
}

.dark-mode .dashboard-title {
  background: linear-gradient(135deg, #e14b6a, #d946ef);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 0 15px rgba(225, 75, 106, 0.3);
}

.dashboard-subtitle {
  color: #8a2a44;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 400;
  transition: color 0.3s ease;
}

.dark-mode .dashboard-subtitle {
  color: rgba(225, 75, 106, 0.8);
}

/* ───── SECTION TITLES ───── */
.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #6d1a36;
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
  padding-bottom: 0.75rem;
  transition: color 0.3s ease;
}

.section-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40%;
  height: 3px;
  background: linear-gradient(90deg, #e14b6a, #8a2a44);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.dark-mode .section-title {
  color: #e14b6a;
}

.dark-mode .section-title::after {
  background: linear-gradient(90deg, #e14b6a, #d946ef);
  box-shadow: 0 0 10px rgba(225, 75, 106, 0.5);
}

/* ───── METRICS GRID ───── */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.metric-card {
  background: rgba(255, 246, 250, 0.9);
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 8px 25px rgba(138, 42, 68, 0.15);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-left: 4px solid transparent;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(228, 201, 214, 0.4);
}

.dark-mode .metric-card {
  background: rgba(36, 23, 38, 0.9);
  border: 1px solid rgba(81, 32, 60, 0.4);
  box-shadow: 0 8px 25px rgba(167, 56, 92, 0.15);
}

.metric-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 15px 35px rgba(138, 42, 68, 0.25);
}

.dark-mode .metric-card:hover {
  box-shadow: 0 15px 35px rgba(167, 56, 92, 0.3);
}

.metric-card.up {
  border-left-color: #e14b6a;
}

.metric-card.down {
  border-left-color: #ef4444;
}

.metric-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(225, 75, 106, 0.12) 0%, rgba(225, 75, 106, 0) 70%);
  opacity: 0.5;
  transition: all 0.4s ease;
}

.dark-mode .metric-glow {
  background: radial-gradient(circle, rgba(225, 75, 106, 0.15) 0%, rgba(225, 75, 106, 0) 70%);
}

.metric-card.up .metric-glow {
  background: radial-gradient(circle, rgba(225, 75, 106, 0.15) 0%, rgba(225, 75, 106, 0) 70%);
}

.metric-card.down .metric-glow {
  background: radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0) 70%);
}

.metric-icon {
  background: linear-gradient(135deg, #fff6fa, #f0e8f2);
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.25rem;
  color: #e14b6a;
  font-size: 1.4rem;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 10px rgba(225, 75, 106, 0.1);
  transition: all 0.3s ease;
}

.dark-mode .metric-icon {
  background: linear-gradient(135deg, rgba(36, 23, 38, 0.8), rgba(45, 27, 50, 0.8));
  color: #e14b6a;
  box-shadow: 0 4px 15px rgba(225, 75, 106, 0.2);
}

.metric-card.up .metric-icon {
  color: #e14b6a;
}

.metric-card.down .metric-icon {
  color: #ef4444;
}

.metric-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.metric-content h3 {
  font-size: 0.875rem;
  color: #8a2a44;
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark-mode .metric-content h3 {
  color: rgba(225, 75, 106, 0.8);
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #6d1a36;
  margin-bottom: 0.75rem;
}

.dark-mode .metric-value {
  color: #e14b6a;
}

.metric-trend {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 500;
}

.metric-card.up .metric-trend {
  color: #e14b6a;
}

.metric-card.down .metric-trend {
  color: #ef4444;
}

.metric-card.neutral .metric-trend {
  color: #6b7280;
}

/* ───── TRANSFER TYPE BREAKDOWN ───── */
.transfer-breakdown {
  margin-bottom: 2.5rem;
}

.transfer-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.transfer-type-card {
  background: rgba(255, 246, 250, 0.9);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 25px rgba(138, 42, 68, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(228, 201, 214, 0.4);
}

.dark-mode .transfer-type-card {
  background: rgba(36, 23, 38, 0.9);
  border: 1px solid rgba(81, 32, 60, 0.4);
  box-shadow: 0 8px 25px rgba(167, 56, 92, 0.15);
}

.transfer-type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(138, 42, 68, 0.2);
}

.dark-mode .transfer-type-card:hover {
  box-shadow: 0 15px 35px rgba(167, 56, 92, 0.25);
}

.transfer-type-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.25rem;
  color: white;
  font-size: 1.5rem;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.transfer-type-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask-composite: xor;
}

.transfer-type-icon i {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.transfer-type-card:hover .transfer-type-icon {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.transfer-type-icon.far {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  box-shadow: 0 4px 15px rgba(225, 75, 106, 0.3);
}

.transfer-type-icon.afr {
  background: linear-gradient(135deg, #d946ef, #8a2a44);
  box-shadow: 0 4px 15px rgba(217, 70, 239, 0.3);
}

.transfer-type-icon.fad {
  background: linear-gradient(135deg, #c084fc, #d946ef);
  box-shadow: 0 4px 15px rgba(192, 132, 252, 0.3);
}

/* Dark mode enhancements for transfer type icons */
.dark-mode .transfer-type-icon {
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(225, 75, 106, 0.2);
}

.dark-mode .transfer-type-icon::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
}

.dark-mode .transfer-type-icon.far {
  box-shadow:
    0 4px 20px rgba(225, 75, 106, 0.4),
    0 0 20px rgba(225, 75, 106, 0.3);
}

.dark-mode .transfer-type-icon.afr {
  box-shadow:
    0 4px 20px rgba(217, 70, 239, 0.4),
    0 0 20px rgba(217, 70, 239, 0.3);
}

.dark-mode .transfer-type-icon.fad {
  box-shadow:
    0 4px 20px rgba(192, 132, 252, 0.4),
    0 0 20px rgba(192, 132, 252, 0.3);
}

.dark-mode .transfer-type-card:hover .transfer-type-icon {
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.4),
    0 0 25px rgba(225, 75, 106, 0.4);
}
.transfer-type-content {
  flex: 1;
}

.transfer-type-content h4 {
  font-size: 0.875rem;
  color: #8a2a44;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.dark-mode .transfer-type-content h4 {
  color: rgba(225, 75, 106, 0.8);
}

.transfer-type-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6d1a36;
  margin-bottom: 0.25rem;
}

.dark-mode .transfer-type-value {
  color: #e14b6a;
}

.transfer-type-percent {
  font-size: 0.875rem;
  color: #8a2a44;
  font-weight: 500;
}

.dark-mode .transfer-type-percent {
  color: rgba(225, 75, 106, 0.7);
}

/* ───── CHARTS GRID ───── */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.chart-card {
  background: rgba(255, 246, 250, 0.9);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 8px 25px rgba(138, 42, 68, 0.1);
  transition: all 0.3s ease;
  height: 350px;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(228, 201, 214, 0.4);
}

.dark-mode .chart-card {
  background: rgba(17, 17, 34, var(--glass-opacity-dark));
  border: 1px solid var(--glass-border-dark);
  box-shadow: var(--shadow-dark);
}

.chart-card canvas {
  flex: 1;
  width: 100% !important;
  height: calc(100% - 40px) !important;
  position: relative;
}

.chart-card:hover {
  box-shadow: 0 15px 35px rgba(138, 42, 68, 0.2);
}

.dark-mode .chart-card:hover {
  box-shadow: 0 15px 35px rgba(167, 56, 92, 0.25);
}

.chart-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #6d1a36;
  margin-bottom: 1.25rem;
}

.dark-mode .chart-card h3 {
  color: #e14b6a;
}

.main-chart {
  grid-column: span 2;
  height: 400px;
}

.animated-chart {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-chart {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a2a44;
  font-style: italic;
  background: rgba(225, 75, 106, 0.05);
  border-radius: 12px;
  margin-top: 5px;
  transition: all 0.3s ease;
}

.dark-mode .loading-chart {
  color: rgba(225, 75, 106, 0.8);
  background: rgba(225, 75, 106, 0.05);
}

/* ───── DATA ANALYSIS SECTION ───── */
.data-analysis-section {
  background: rgba(255, 246, 250, 0.9);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 8px 25px rgba(138, 42, 68, 0.1);
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(228, 201, 214, 0.4);
}

.dark-mode .data-analysis-section {
  background: rgba(36, 23, 38, 0.9);
  border: 1px solid rgba(81, 32, 60, 0.4);
  box-shadow: 0 8px 25px rgba(167, 56, 92, 0.15);
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(228, 201, 214, 0.4);
  padding-bottom: 1rem;
  overflow-x: auto;
  scrollbar-width: thin;
  transition: all 0.3s ease;
}

.dark-mode .tabs {
  border-bottom-color: rgba(81, 32, 60, 0.4);
}

.tab-button {
  background: transparent;
  border: none;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #8a2a44;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark-mode .tab-button {
  color: rgba(225, 75, 106, 0.8);
}

.tab-button.active {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.1), rgba(138, 42, 68, 0.1));
  color: #e14b6a;
}

.dark-mode .tab-button.active {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), rgba(138, 42, 68, 0.1));
  color: #e14b6a;
  box-shadow: 0 0 10px rgba(225, 75, 106, 0.3);
}

.tab-button:hover:not(.active) {
  background: rgba(225, 75, 106, 0.05);
  color: #8a2a44;
}

.dark-mode .tab-button:hover:not(.active) {
  background: rgba(225, 75, 106, 0.1);
  color: #e14b6a;
}

.tab-content {
  min-height: 300px;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #8a2a44;
  font-style: italic;
  background: rgba(225, 75, 106, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.dark-mode .no-data {
  color: rgba(225, 75, 106, 0.7);
  background: rgba(225, 75, 106, 0.05);
  border: 1px solid rgba(225, 75, 106, 0.1);
}

/* ───── DATA TABLE ───── */
.data-table-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(138, 42, 68, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  background: rgba(225, 75, 106, 0.1);
  color: #8a2a44;
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.dark-mode .data-table th {
  background: rgba(225, 75, 106, 0.1);
  color: #e14b6a;
}

.data-table td {
  padding: 1rem;
  border-top: 1px solid rgba(228, 201, 214, 0.4);
  color: #6d1a36;
}

.dark-mode .data-table td {
  border-top-color: rgba(81, 32, 60, 0.4);
  color: rgba(225, 75, 106, 0.9);
}

.data-table tr:hover td {
  background-color: rgba(225, 75, 106, 0.05);
}

.dark-mode .data-table tr:hover td {
  background-color: rgba(225, 75, 106, 0.1);
}

.code-badge {
  background: rgba(225, 75, 106, 0.15);
  color: #e14b6a;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.dark-mode .code-badge {
  background: rgba(225, 75, 106, 0.2);
  color: #e14b6a;
}

td.positive {
  color: #e14b6a;
  font-weight: 600;
}

td.negative {
  color: #ef4444;
  font-weight: 600;
}

/* ───── FLOW VISUALIZATION ───── */
.cost-center-flows,
.account-flows,
.all-flows {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.transfer-group,
.combo-group {
  margin-bottom: 1rem;
}

.transfer-group h4,
.combo-group h4 {
  font-size: 0.875rem;
  color: #8a2a44;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.dark-mode .transfer-group h4,
.dark-mode .combo-group h4 {
  color: rgba(225, 75, 106, 0.8);
}

.flow-card,
.combo-card {
  background: rgba(255, 246, 250, 0.7);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 10px rgba(138, 42, 68, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(228, 201, 214, 0.4);
}

.dark-mode .flow-card,
.dark-mode .combo-card {
  background: rgba(36, 23, 38, 0.7);
  box-shadow: 0 4px 15px rgba(167, 56, 92, 0.15);
  border: 1px solid rgba(81, 32, 60, 0.4);
}

.flow-visualization,
.combo-visualization {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.flow-node,
.combo-node {
  background: rgba(255, 246, 250, 0.9);
  border-radius: 12px;
  padding: 1rem;
  width: 45%;
  text-align: center;
  box-shadow: 0 4px 8px rgba(138, 42, 68, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.dark-mode .flow-node,
.dark-mode .combo-node {
  background: rgba(36, 23, 38, 0.8);
  box-shadow: 0 4px 12px rgba(167, 56, 92, 0.15);
}

.flow-node.from,
.combo-node.from {
  border-left: 3px solid #ef4444;
}

.flow-node.to,
.combo-node.to {
  border-left: 3px solid #e14b6a;
}

.node-label,
.combo-center {
  font-weight: 600;
  color: #8a2a44;
  transition: color 0.3s ease;
}

.dark-mode .node-label,
.dark-mode .combo-center {
  color: rgba(225, 75, 106, 0.9);
}

.combo-account {
  font-size: 0.75rem;
  color: #8a2a44;
  background: rgba(225, 75, 106, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  transition: all 0.3s ease;
}

.dark-mode .combo-account {
  color: rgba(225, 75, 106, 0.8);
  background: rgba(225, 75, 106, 0.15);
}

.node-amount,
.combo-amount {
  font-weight: 700;
  font-size: 1.125rem;
  color: #6d1a36;
  transition: color 0.3s ease;
}

.dark-mode .node-amount,
.dark-mode .combo-amount {
  color: #e14b6a;
}

.flow-arrow,
.combo-arrow {
  color: #e14b6a;
  font-size: 1.25rem;
}

.dark-mode .flow-arrow,
.dark-mode .combo-arrow {
  color: #e14b6a;
}

/* ───── FUTURISTIC APPROVAL LEVELS ───── */
.approval-levels-card {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.05), rgba(138, 42, 68, 0.05));
  border: 1px solid rgba(228, 201, 214, 0.4);
  position: relative;
  overflow: hidden;
}

.dark-mode .approval-levels-card {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.08), rgba(138, 42, 68, 0.05));
  border: 1px solid rgba(81, 32, 60, 0.4);
}

.approval-levels-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(225, 75, 106, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(138, 42, 68, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.dark-mode .approval-levels-card::before {
  background:
    radial-gradient(circle at 20% 20%, rgba(225, 75, 106, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(138, 42, 68, 0.1) 0%, transparent 50%);
}

.approval-levels-container {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.approval-levels-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.approval-level-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.level-circle {
  width: 80px;
  height: 80px;
  position: relative;
  margin-bottom: 0.5rem;
}

.level-progress {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  animation: levelPulse 2s ease-in-out infinite;
  --level-color: #10b981;
}

.approval-level-item.level-1 .level-progress {
  --level-color: #f59e0b;
}

.approval-level-item.level-2 .level-progress {
  --level-color: #e14b6a;
}

.approval-level-item.level-3 .level-progress {
  --level-color: #8a2a44;
}

.approval-level-item.level-4 .level-progress {
  --level-color: #d946ef;
}

.dark-mode .approval-level-item.level-1 .level-progress {
  --level-color: #fbbf24;
}

.dark-mode .approval-level-item.level-2 .level-progress {
  --level-color: #e14b6a;
}

.dark-mode .approval-level-item.level-3 .level-progress {
  --level-color: #8a2a44;
}

.dark-mode .approval-level-item.level-4 .level-progress {
  --level-color: #d946ef;
}

.level-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.level-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--level-color);
  line-height: 1;
}

.level-label {
  font-size: 0.6rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.dark-mode .level-label {
  color: rgba(255, 255, 255, 0.7);
}

.level-percentage {
  font-size: 0.75rem;
  color: var(--level-color);
  font-weight: 600;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.approval-summary {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

@keyframes levelPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(138, 43, 194, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(138, 43, 194, 0);
  }
}

/* ───── FUTURISTIC COST CENTER NETWORK ───── */
.cost-center-card {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.05), rgba(239, 68, 68, 0.05));
  border: 1px solid rgba(228, 201, 214, 0.4);
  position: relative;
  overflow: hidden;
}

.dark-mode .cost-center-card {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.08), rgba(239, 68, 68, 0.05));
  border: 1px solid rgba(81, 32, 60, 0.4);
}

.cost-center-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 30% 30%, rgba(225, 75, 106, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(239, 68, 68, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.dark-mode .cost-center-card::before {
  background:
    radial-gradient(circle at 30% 30%, rgba(225, 75, 106, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(239, 68, 68, 0.1) 0%, transparent 50%);
}

.cost-center-container {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cost-center-network {
  position: relative;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cost-center-node {
  position: absolute;
  width: 60px;
  height: 60px;
  animation: nodeFloat 3s ease-in-out infinite;
  animation-delay: var(--node-delay, 0s);
}

.cost-center-node.outgoing .node-core {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

.cost-center-node.incoming .node-core {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  box-shadow: 0 0 20px rgba(225, 75, 106, 0.3);
}

.dark-mode .cost-center-node.incoming .node-core {
  background: linear-gradient(135deg, #e14b6a, #d946ef);
  box-shadow: 0 0 20px rgba(225, 75, 106, 0.5);
}

.node-core {
  width: 250%;
  height: 250%;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transform: translate(-50px, -60px);
}

.node-pulse {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  border: 2px solid currentColor;
  animation: nodePulse 2s ease-in-out infinite;
  opacity: 0.6;
}

.node-content {
  text-align: center;
  color: white;
}

.node-code {
  font-size: 0.6rem;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 0.1rem;
}

.node-amount {
  font-size: 0.5rem;
  font-weight: 500;
  opacity: 0.9;
}

.connection-line {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(138, 43, 194, 0.5), transparent);
  top: 50%;
  left: 50%;
  transform-origin: left center;
  animation: connectionFlow 2s ease-in-out infinite;
}

.cost-center-legend {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 0.75rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-item.outgoing .legend-dot {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

.legend-item.incoming .legend-dot {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  box-shadow: 0 0 8px rgba(225, 75, 106, 0.3);
}

@keyframes nodeFloat {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

@keyframes nodePulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.2;
  }
}

@keyframes connectionFlow {
  0%,
  100% {
    opacity: 0.3;
    transform: translateX(0);
  }
  50% {
    opacity: 0.8;
    transform: translateX(20px);
  }
}

/* ───── DARK MODE UPDATES ───── */
.dashboard.dark-mode {
  background: linear-gradient(135deg, var(--color-bg-dark) 0%, #111122 100%);
  color: var(--color-text-light);
}

.dark-mode .gradient-orb {
  opacity: 0.5;
  filter: blur(100px);
}

.dark-mode .dashboard-header {
  color: var(--color-text-light);
}

.dark-mode .dashboard-title,
.dark-mode .dashboard-subtitle {
  color: var(--color-text-light);
}

.dark-mode .metric-card {
  background: rgba(17, 17, 34, var(--glass-opacity-dark));
  border: 1px solid var(--glass-border-dark);
  box-shadow: var(--shadow-dark);
}

.dark-mode .metric-card:hover {
  background: rgba(30, 41, 59, var(--glass-opacity-dark));
  transform: translateY(-7px);
  box-shadow: 0 15px 35px rgba(240, 171, 252, 0.12);
}

.dark-mode .transfer-type-card {
  background: rgba(17, 17, 34, var(--glass-opacity-dark));
  border: 1px solid var(--glass-border-dark);
  backdrop-filter: blur(var(--glass-blur));
}

.dark-mode .chart-card {
  background: rgba(17, 17, 34, var(--glass-opacity-dark));
  border: 1px solid var(--glass-border-dark);
  box-shadow: var(--shadow-dark);
}

.dark-mode .dashboard-title,
.dark-mode .dashboard-subtitle,
.dark-mode .section-title,
.dark-mode .tab-button {
  color: var(--color-text-light);
}

.dark-mode .tab-button.active {
  background: rgba(240, 171, 252, 0.2);
  box-shadow: var(--shadow-glow-magenta);
}

.dark-mode .metric-content h3,
.dark-mode .metric-value,
.dark-mode .transfer-type-content h4,
.dark-mode .transfer-type-value,
.dark-mode .transfer-type-percent {
  color: rgba(255, 255, 255, 0.9);
}

.dark-mode .metric-trend {
  color: rgba(255, 255, 255, 0.7);
}

.dark-mode .metric-card .metric-glow {
  box-shadow: 0 0 15px rgba(240, 171, 252, 0.2);
}

.dark-mode .metric-card.up .metric-glow {
  box-shadow: 0 0 15px rgba(94, 234, 212, 0.2);
}

.dark-mode .metric-card.down .metric-glow {
  box-shadow: 0 0 15px rgba(255, 100, 100, 0.2);
}

.dark-mode .data-table {
  color: var(--color-text-light);
}

.dark-mode .data-table th {
  background: rgba(17, 17, 34, 0.8);
  color: rgba(255, 255, 255, 0.9);
}

.dark-mode .data-table td {
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.dark-mode .data-table tbody tr:hover {
  background: rgba(240, 171, 252, 0.1);
}

.dark-mode .pagination-controls button {
  background: rgba(17, 17, 34, 0.6);
  color: var(--color-text-light);
  border-color: var(--glass-border-dark);
}

.dark-mode .pagination-controls button:hover:not(:disabled) {
  background: rgba(240, 171, 252, 0.2);
  box-shadow: var(--shadow-glow-magenta);
}

/* ───── RESPONSIVE UPDATES ───── */
@media (max-width: 768px) {
  .approval-levels-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .level-circle {
    width: 60px;
    height: 60px;
  }

  .level-inner {
    width: 45px;
    height: 45px;
  }

  .level-number {
    font-size: 1rem;
  }

  .cost-center-network {
    height: 150px;
  }

  .cost-center-node {
    width: 45px;
    height: 45px;
  }

  .node-code {
    font-size: 0.5rem;
  }

  .node-amount {
    font-size: 0.4rem;
  }
}

/* Background animation elements */
.page-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
  filter: blur(80px);
  transition: transform 8s cubic-bezier(0.23, 1, 0.32, 1);
}

.orb-1 {
  top: 10%;
  left: 10%;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, #e14b6a 0%, rgba(225, 75, 106, 0) 70%);
  animation: pulse 15s ease-in-out infinite alternate;
}

.orb-2 {
  bottom: 20%;
  right: 10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #8a2a44 0%, rgba(138, 42, 68, 0) 70%);
  animation: pulse 18s ease-in-out infinite alternate-reverse;
}

.orb-3 {
  top: 40%;
  right: 30%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #d946ef 0%, rgba(217, 70, 239, 0) 70%);
  animation: pulse 20s ease-in-out infinite alternate;
}

.dark-mode .orb-1 {
  background: radial-gradient(circle, #e14b6a 0%, rgba(225, 75, 106, 0) 70%);
}

.dark-mode .orb-2 {
  background: radial-gradient(circle, #8a2a44 0%, rgba(138, 42, 68, 0) 70%);
}

.dark-mode .orb-3 {
  background: radial-gradient(circle, #d946ef 0%, rgba(217, 70, 239, 0) 70%);
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.4;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.2;
  }
}

/* ───── CURRENCY FORMATTING ───── */
.currency-value {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
}

/* RTL Currency Support */
.dashboard.rtl .currency-value {
  direction: rtl;
  text-align: right;
}

/* Arabic Currency Icon Styling */
.currency-icon {
  font-weight: 600;
  margin-inline-start: 0.25rem;
}

.dashboard.rtl .currency-icon {
  margin-inline-start: 0;
  margin-inline-end: 0.25rem;
}

/* Loading state for currency */
.currency-loading {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.1), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
