<template>
  <div class="budget-dashboard rtl-layout" :class="{ 'dark-mode': isDarkMode }" dir="rtl">
    <!-- Header Controls -->
    <div class="dashboard-header">
      <div class="dashboard-info">
        <h1 class="dashboard-title">لوحة تحويل الميزانية</h1>
        <p class="dashboard-subtitle">تحليلات ورؤى شاملة لتحويل الميزانية</p>
      </div>

      <div class="dashboard-controls">
        <!-- Type Selector -->
        <div class="control-group">
          <label>الوضع:</label>
          <select
            v-model="selectedType"
            @change="handleTypeChange"
            class="type-selector"
            :disabled="loading"
          >
            <option value="normal">عادي</option>
            <option value="all">الكل</option>
            <option value="smart">ذكي</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="action-group">
          <button
            @click="handleRefresh"
            :disabled="loading"
            class="refresh-btn"
            :class="{ loading }"
          >
            <i class="fas fa-sync-alt" :class="{ spinning: loading }"></i>
            تحديث
          </button>

          <div v-if="lastFetched" class="last-fetched">
            آخر تحديث: {{ formatRelativeTimeCairo(lastFetched) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !hasData" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-chart-line spinning"></i>
      </div>
      <p>جاري تحميل بيانات اللوحة...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3>{{ getErrorTitle() }}</h3>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="handleRetry" class="retry-btn">
          <i class="fas fa-redo"></i>
          حاول مرة أخرى
        </button>
        <button v-if="isAuthError" @click="handleRelogin" class="login-btn">
          <i class="fas fa-sign-in-alt"></i>
          إعادة تسجيل الدخول
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="isEmpty"
      title="لا توجد بيانات تحويل"
      description="لا توجد تحويلات ميزانية للعرض في الوقت الحالي."
      icon-class="fas fa-chart-bar"
      action-text="تحديث البيانات"
      @action="handleRefresh"
    />

    <!-- Dashboard Content -->
    <div v-else-if="hasData" class="dashboard-content">
      <!-- Dashboard Content -->
      <div v-if="hasData" class="dashboard-content scrollable-layout">
        <!-- KPI Section -->
        <div class="kpi-section glass-section" data-section="kpi">
          <h2 class="section-title">
            <i class="fas fa-chart-pie section-icon"></i>
            مؤشرات الأداء الرئيسية
          </h2>
          <div class="kpi-grid">
            <!-- Normal Mode KPIs -->
            <template v-if="isNormalMode && normalData">
              <div class="kpi-card glass-card">
                <div class="kpi-icon">
                  <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ normalData.total_transfers }}</div>
                  <div class="kpi-label">إجمالي التحويلات</div>
                </div>
              </div>

              <div class="kpi-card glass-card approved">
                <div class="kpi-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ normalData.approved_transfers }}</div>
                  <div class="kpi-label">مُوافق عليها</div>
                </div>
              </div>

              <div class="kpi-card glass-card pending">
                <div class="kpi-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ normalData.pending_transfers }}</div>
                  <div class="kpi-label">قيد الانتظار</div>
                </div>
              </div>

              <div class="kpi-card glass-card rejected">
                <div class="kpi-icon">
                  <i class="fas fa-times-circle"></i>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ normalData.rejected_transfers }}</div>
                  <div class="kpi-label">مرفوضة</div>
                </div>
              </div>
            </template>

            <!-- Flow Mode KPIs -->
            <template v-else-if="flowData">
              <div class="kpi-card glass-card inflow">
                <div class="kpi-icon">
                  <i class="fas fa-arrow-down"></i>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ formatCurrency(flowTotals.totalTo) }}</div>
                  <div class="kpi-label">إجمالي التدفق الداخل</div>
                </div>
              </div>

              <div class="kpi-card glass-card outflow">
                <div class="kpi-icon">
                  <i class="fas fa-arrow-up"></i>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ formatCurrency(flowTotals.totalFrom) }}</div>
                  <div class="kpi-label">إجمالي التدفق الخارج</div>
                </div>
              </div>

              <div
                class="kpi-card glass-card net"
                :class="{ positive: flowTotals.net >= 0, negative: flowTotals.net < 0 }"
              >
                <div class="kpi-icon">
                  <i :class="flowTotals.net >= 0 ? 'fas fa-plus' : 'fas fa-minus'"></i>
                </div>
                <div class="kpi-content">
                  <div class="kpi-value">{{ formatCurrency(Math.abs(flowTotals.net)) }}</div>
                  <div class="kpi-label">
                    صافي {{ flowTotals.net >= 0 ? 'التدفق الداخل' : 'التدفق الخارج' }}
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Smart Mode Filter Badge -->
          <div v-if="isSmartMode && flowData?.applied_filters" class="filter-badge glass-badge">
            <i class="fas fa-filter"></i>
            مركز التكلفة: {{ flowData.applied_filters.cost_center_code || 'الكل' }} | الحساب:
            {{ flowData.applied_filters.account_code || 'الكل' }}
          </div>
        </div>

        <!-- Overview Section -->
        <div class="overview-section glass-section" data-section="overview">
          <h2 class="section-title">
            <i class="fas fa-chart-bar section-icon"></i>
            تحليلات عامة
          </h2>
          <div v-if="isNormalMode && normalData" class="charts-grid">
            <div class="chart-card glass-card">
              <h3>حالة التحويل</h3>
              <StatusDonut
                :approved="normalData.approved_transfers"
                :pending="normalData.pending_transfers"
                :rejected="normalData.rejected_transfers"
              />
            </div>

            <div class="chart-card glass-card">
              <h3>فئات التحويل</h3>
              <TransferCategories
                :far="normalData.total_transfers_far"
                :afr="normalData.total_transfers_afr"
                :fad="normalData.total_transfers_fad"
              />
            </div>
          </div>

          <div v-else-if="flowData" class="charts-grid">
            <div class="chart-card glass-card wide">
              <h3>مجاميع مراكز التكلفة</h3>
              <CostCenterTotals :grouped-data="costCenterGrouped" />
            </div>

            <div class="chart-card glass-card wide">
              <h3>مجاميع أكواد الحساب</h3>
              <AccountCodeTotals :grouped-data="accountCodeGrouped" />
            </div>
          </div>
        </div>

        <!-- Transfers & Workflow Section (Normal Mode) -->
        <div
          v-if="isNormalMode && normalData"
          class="transfers-section glass-section"
          data-section="transfers"
        >
          <h2 class="section-title">
            <i class="fas fa-project-diagram section-icon"></i>
            التحويلات وسير العمل
          </h2>
          <div class="charts-grid">
            <div class="chart-card glass-card">
              <h3>المعلقة حسب المستوى</h3>
              <PendingByLevel :pending-by-level="normalData.pending_transfers_by_level" />
            </div>

            <div class="chart-card glass-card">
              <h3>الجدول الزمني للطلبات</h3>
              <RequestsTimeline :timeline-data="timelineData" />
            </div>
          </div>
        </div>

        <!-- Flows & Totals Section (All/Smart Mode) -->
        <div v-if="flowData" class="flows-section glass-section" data-section="flows">
          <h2 class="section-title">
            <i class="fas fa-exchange-alt section-icon"></i>
            التدفقات والمجاميع
          </h2>
          <div class="flow-visualization">
            <div class="chart-card glass-card">
              <h3>خريطة حرارية للتدفق</h3>
              <FlowHeatmap :heatmap-cells="heatmapCells" />
            </div>

            <div class="chart-card glass-card">
              <h3>مخطط تدفق سانكي</h3>
              <SankeyDiagram :sankey-data="sankeyData" />
            </div>
          </div>
        </div>

        <!-- Data Tables Section -->
        <div class="data-section glass-section" data-section="data">
          <h2 class="section-title">
            <i class="fas fa-table section-icon"></i>
            تحليلات البيانات
          </h2>
          <div class="data-content glass-card">
            <div class="table-controls">
              <h3>{{ getTableTitle() }}</h3>
              <button @click="exportTableData" class="export-btn glass-btn">
                <i class="fas fa-download"></i>
                تصدير CSV
              </button>
            </div>

            <!-- Normal Mode Table -->
            <div v-if="isNormalMode && normalData" class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>تاريخ الطلب (توقيت القاهرة)</th>
                    <th>عدد الأيام</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in timelineData" :key="item.label">
                    <td>{{ item.label }}</td>
                    <td>{{ item.count }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Flow Mode Table -->
            <div v-else-if="flowData" class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th @click="sortTable('cost_center_code')" class="sortable">
                      مركز التكلفة
                      <i class="fas fa-sort sort-icon"></i>
                    </th>
                    <th @click="sortTable('account_code')" class="sortable">
                      كود الحساب
                      <i class="fas fa-sort sort-icon"></i>
                    </th>
                    <th @click="sortTable('total_from_center')" class="sortable">
                      من المركز
                      <i class="fas fa-sort sort-icon"></i>
                    </th>
                    <th @click="sortTable('total_to_center')" class="sortable">
                      إلى المركز
                      <i class="fas fa-sort sort-icon"></i>
                    </th>
                    <th @click="sortTable('net')" class="sortable">
                      صافي التدفق
                      <i class="fas fa-sort sort-icon"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in sortedTableData"
                    :key="`${row.cost_center_code}-${row.account_code}`"
                  >
                    <td>{{ row.cost_center_code }}</td>
                    <td>{{ row.account_code }}</td>
                    <td class="number negative">{{ formatCurrency(row.total_from_center) }}</td>
                    <td class="number positive">{{ formatCurrency(row.total_to_center) }}</td>
                    <td class="number" :class="{ positive: row.net >= 0, negative: row.net < 0 }">
                      {{ formatCurrency(row.net) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Performance Section -->
        <!-- <div class="performance-section glass-section" data-section="performance">
          <h2 class="section-title">
            <i class="fas fa-tachometer-alt section-icon"></i>
            Performance Metrics
          </h2>
          <div class="metrics-grid">
            <div v-if="isNormalMode && normalData" class="performance-card glass-card">
              <h4>Normal Mode Metrics</h4>
              <div class="metric-list">
                <div class="metric-item">
                  <span>Total Processing Time:</span>
                  <span
                    >{{ normalData.performance_metrics.total_processing_time.toFixed(3) }}s</span
                  >
                </div>
                <div class="metric-item">
                  <span>Counting Time:</span>
                  <span>{{ normalData.performance_metrics.counting_time.toFixed(3) }}s</span>
                </div>
                <div class="metric-item">
                  <span>Records Processed:</span>
                  <span>{{ normalData.performance_metrics.total_records_processed }}</span>
                </div>
                <div class="metric-item">
                  <span>Request Dates Retrieved:</span>
                  <span>{{ normalData.performance_metrics.request_dates_retrieved }}</span>
                </div>
              </div>
            </div>

            <div v-else-if="flowData" class="performance-card glass-card">
              <h4>{{ isSmartMode ? 'Smart' : 'All' }} Mode Metrics</h4>
              <div class="metric-list">
                <div class="metric-item">
                  <span>Total Processing Time:</span>
                  <span>{{ flowData.performance_metrics.total_processing_time.toFixed(3) }}s</span>
                </div>
                <div class="metric-item">
                  <span>Aggregation Time:</span>
                  <span>{{ flowData.performance_metrics.aggregation_time.toFixed(3) }}s</span>
                </div>
                <div class="metric-item">
                  <span>Cost Center Groups:</span>
                  <span>{{ flowData.performance_metrics.cost_center_groups }}</span>
                </div>
                <div class="metric-item">
                  <span>Account Code Groups:</span>
                  <span>{{ flowData.performance_metrics.account_code_groups }}</span>
                </div>
                <div class="metric-item">
                  <span>Total Combinations:</span>
                  <span>{{ flowData.performance_metrics.total_combinations }}</span>
                </div>
              </div>
            </div>
          </div>
        </div> -->
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-section">
        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Overview Tab -->

          <!-- Transfers & Workflow Tab (Normal Mode) -->
          <div v-if="activeTab === 'transfers' && isNormalMode && normalData" class="tab-panel">
            <div class="charts-grid">
              <div class="chart-card">
                <h3>المعلقة حسب المستوى</h3>
                <PendingByLevel :pending-by-level="normalData.pending_transfers_by_level" />
              </div>

              <div class="chart-card">
                <h3>الجدول الزمني للطلبات</h3>
                <RequestsTimeline :timeline-data="timelineData" />
              </div>
            </div>
          </div>

          <!-- Flows & Totals Tab (All/Smart Mode) -->
          <div v-if="activeTab === 'flows' && flowData" class="tab-panel">
            <div class="flow-visualization">
              <div class="chart-card">
                <h3>خريطة حرارية للتدفق</h3>
                <FlowHeatmap :heatmap-cells="heatmapCells" />
              </div>

              <div class="chart-card">
                <h3>مخطط تدفق سانكي</h3>
                <SankeyDiagram :sankey-data="sankeyData" />
              </div>
            </div>
          </div>

          <!-- Data Tables Tab -->
          <div v-if="activeTab === 'data'" class="tab-panel">
            <div class="data-section">
              <div class="table-controls">
                <h3>{{ getTableTitle() }}</h3>
                <button @click="exportTableData" class="export-btn">
                  <i class="fas fa-download"></i>
                  تصدير CSV
                </button>
              </div>

              <!-- Normal Mode Table -->
              <div v-if="isNormalMode && normalData" class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>تاريخ الطلب (توقيت القاهرة)</th>
                      <th>عدد الأيام</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in timelineData" :key="item.label">
                      <td>{{ item.label }}</td>
                      <td>{{ item.count }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Flow Mode Table -->
              <div v-else-if="flowData" class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th @click="sortTable('cost_center_code')" class="sortable">
                        مركز التكلفة
                        <i class="fas fa-sort sort-icon"></i>
                      </th>
                      <th @click="sortTable('account_code')" class="sortable">
                        كود الحساب
                        <i class="fas fa-sort sort-icon"></i>
                      </th>
                      <th @click="sortTable('total_from_center')" class="sortable">
                        من المركز
                        <i class="fas fa-sort sort-icon"></i>
                      </th>
                      <th @click="sortTable('total_to_center')" class="sortable">
                        إلى المركز
                        <i class="fas fa-sort sort-icon"></i>
                      </th>
                      <th @click="sortTable('net')" class="sortable">
                        صافي التدفق
                        <i class="fas fa-sort sort-icon"></i>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in sortedTableData"
                      :key="`${row.cost_center_code}-${row.account_code}`"
                    >
                      <td>{{ row.cost_center_code }}</td>
                      <td>{{ row.account_code }}</td>
                      <td class="number negative">{{ formatCurrency(row.total_from_center) }}</td>
                      <td class="number positive">{{ formatCurrency(row.total_to_center) }}</td>
                      <td class="number" :class="{ positive: row.net >= 0, negative: row.net < 0 }">
                        {{ formatCurrency(row.net) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Performance Tab -->
          <div v-if="activeTab === 'performance'" class="tab-panel">
            <div class="performance-section">
              <h3>Performance Metrics</h3>
              <div class="metrics-grid">
                <div v-if="isNormalMode && normalData" class="performance-card">
                  <h4>Normal Mode Metrics</h4>
                  <div class="metric-list">
                    <div class="metric-item">
                      <span>Total Processing Time:</span>
                      <span
                        >{{
                          normalData.performance_metrics.total_processing_time.toFixed(3)
                        }}s</span
                      >
                    </div>
                    <div class="metric-item">
                      <span>Counting Time:</span>
                      <span>{{ normalData.performance_metrics.counting_time.toFixed(3) }}s</span>
                    </div>
                    <div class="metric-item">
                      <span>Records Processed:</span>
                      <span>{{ normalData.performance_metrics.total_records_processed }}</span>
                    </div>
                    <div class="metric-item">
                      <span>Request Dates Retrieved:</span>
                      <span>{{ normalData.performance_metrics.request_dates_retrieved }}</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="flowData" class="performance-card">
                  <h4>{{ isSmartMode ? 'Smart' : 'All' }} Mode Metrics</h4>
                  <div class="metric-list">
                    <div class="metric-item">
                      <span>Total Processing Time:</span>
                      <span
                        >{{ flowData.performance_metrics.total_processing_time.toFixed(3) }}s</span
                      >
                    </div>
                    <div class="metric-item">
                      <span>Aggregation Time:</span>
                      <span>{{ flowData.performance_metrics.aggregation_time.toFixed(3) }}s</span>
                    </div>
                    <div class="metric-item">
                      <span>Cost Center Groups:</span>
                      <span>{{ flowData.performance_metrics.cost_center_groups }}</span>
                    </div>
                    <div class="metric-item">
                      <span>Account Code Groups:</span>
                      <span>{{ flowData.performance_metrics.account_code_groups }}</span>
                    </div>
                    <div class="metric-item">
                      <span>Total Combinations:</span>
                      <span>{{ flowData.performance_metrics.total_combinations }}</span>
                    </div>
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

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { useBudgetDashboardStore } from '@/stores/budgetDashboard'
import type { DashboardType, FlowRow } from '@/types/dashboard'
import {
  bucketDatesByDayCairo,
  toGroupedTotals,
  toHeatmapCells,
  toSankey,
  calculateTotalSums,
  formatCurrency,
  sortByKey,
} from '@/utils/transforms'
import { formatRelativeTimeCairo } from '@/utils/dateUtils'
import { exportToCsv } from '@/api/budget'

// Components
import EmptyState from '@/components/EmptyState.vue'
import StatusDonut from '@/components/charts/StatusDonut.vue'
import TransferCategories from '@/components/charts/TransferCategories.vue'
import PendingByLevel from '@/components/charts/PendingByLevel.vue'
import RequestsTimeline from '@/components/charts/RequestsTimeline.vue'
import CostCenterTotals from '@/components/charts/CostCenterTotals.vue'
import AccountCodeTotals from '@/components/charts/AccountCodeTotals.vue'
import FlowHeatmap from '@/components/charts/FlowHeatmap.vue'
import SankeyDiagram from '@/components/charts/SankeyDiagram.vue'

// Stores
const themeStore = useThemeStore()
const authStore = useAuthStore()
const dashboardStore = useBudgetDashboardStore()

// Reactive state
const selectedType = ref<DashboardType>('normal')
const sortColumn = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')
const activeTab = ref<string>('overview')

// Tab configuration
const availableTabs = computed(() => [
  { id: 'overview', label: 'نظرة عامة', icon: 'fas fa-chart-bar' },
  { id: 'transfers', label: 'التحويلات', icon: 'fas fa-project-diagram' },
  { id: 'flows', label: 'التدفقات', icon: 'fas fa-exchange-alt' },
  { id: 'data', label: 'البيانات', icon: 'fas fa-table' },
])

// Computed properties
const isDarkMode = computed(() => themeStore.darkMode)
const loading = computed(() => dashboardStore.loading)
const error = computed(() => dashboardStore.error)
const hasData = computed(() => dashboardStore.hasData)
const isEmpty = computed(() => dashboardStore.isEmpty)
const isNormalMode = computed(() => dashboardStore.isNormalMode)
const isSmartMode = computed(() => dashboardStore.isSmartMode)
const normalData = computed(() => dashboardStore.normalData)
const flowData = computed(() => dashboardStore.flowData)
const lastFetched = computed(() => dashboardStore.currentLastFetched)

const isAuthError = computed(
  () => error.value?.includes('Authentication') || error.value?.includes('401'),
)

// Data transformations
const timelineData = computed(() => {
  if (!normalData.value?.request_dates) return []
  return bucketDatesByDayCairo(normalData.value.request_dates)
})

const costCenterGrouped = computed(() => {
  if (!flowData.value?.cost_center_totals) return { labels: [], toSeries: [], fromSeries: [] }
  return toGroupedTotals(flowData.value.cost_center_totals, 'cost_center_code')
})

const accountCodeGrouped = computed(() => {
  if (!flowData.value?.account_code_totals) return { labels: [], toSeries: [], fromSeries: [] }
  return toGroupedTotals(flowData.value.account_code_totals, 'account_code')
})

const heatmapCells = computed(() => {
  if (!flowData.value?.filtered_combinations) return []
  return toHeatmapCells(flowData.value.filtered_combinations)
})

const sankeyData = computed(() => {
  if (!flowData.value?.filtered_combinations) return { nodes: [], links: [] }
  return toSankey(flowData.value.filtered_combinations)
})

const flowTotals = computed(() => {
  if (!flowData.value?.cost_center_totals) return { totalFrom: 0, totalTo: 0, net: 0 }
  return calculateTotalSums(flowData.value.cost_center_totals)
})

const sortedTableData = computed(() => {
  if (!flowData.value?.filtered_combinations) return []

  const dataWithNet = flowData.value.filtered_combinations.map((row) => ({
    ...row,
    net: row.total_to_center - row.total_from_center,
  }))

  if (sortColumn.value) {
    return sortByKey(
      dataWithNet,
      sortColumn.value as keyof (FlowRow & { net: number }),
      sortDirection.value,
    )
  }

  return dataWithNet
})

// Methods
const handleTypeChange = async () => {
  if (!authStore.token) return
  await dashboardStore.load(selectedType.value, authStore.token)
}

const handleRefresh = async () => {
  if (!authStore.token) return
  await dashboardStore.refresh(authStore.token)
}

const handleRetry = async () => {
  dashboardStore.clearError()
  if (!authStore.token) return
  await dashboardStore.load(selectedType.value, authStore.token)
}

const handleRelogin = () => {
  // Navigate to login page or show login modal
  // This would depend on your routing setup
  window.location.href = '/login'
}

const getErrorTitle = () => {
  if (isAuthError.value) return 'مطلوب المصادقة'
  if (error.value?.includes('500')) return 'خطأ في الخادم'
  return 'فشل الطلب'
}

const getTableTitle = () => {
  if (isNormalMode.value) return 'بيانات الجدول الزمني للطلبات'
  return 'بيانات مجموعات التدفق'
}

const exportTableData = () => {
  if (isNormalMode.value && normalData.value) {
    exportToCsv(timelineData.value, 'request-timeline')
  } else if (flowData.value) {
    exportToCsv(sortedTableData.value, 'flow-combinations')
  }
}

const sortTable = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

// Lifecycle
onMounted(async () => {
  if (!authStore.token) {
    console.warn('No auth token available')
    return
  }

  await dashboardStore.load(selectedType.value, authStore.token)
})

// Watch for type changes
watch(
  () => dashboardStore.currentType,
  (newType) => {
    selectedType.value = newType
  },
)
</script>

<style scoped>
/* Modern Glassmorphism Design */
.budget-dashboard {
  background: linear-gradient(
    135deg,
    rgba(248, 246, 248, 0.95) 0%,
    rgba(255, 246, 250, 0.95) 35%,
    rgba(240, 232, 242, 0.95) 70%,
    rgba(232, 213, 232, 0.95) 100%
  );
  min-height: 100vh;
  padding: 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow-x: hidden;
}

.budget-dashboard::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(225, 75, 106, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(138, 42, 68, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(225, 75, 106, 0.06) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

.budget-dashboard.dark-mode {
  background: linear-gradient(
    135deg,
    rgba(26, 22, 35, 0.95) 0%,
    rgba(36, 23, 38, 0.95) 35%,
    rgba(45, 27, 50, 0.95) 70%,
    rgba(54, 32, 64, 0.95) 100%
  );
  color: #f8e9f0;
}

.budget-dashboard.dark-mode::before {
  background:
    radial-gradient(circle at 20% 50%, rgba(225, 75, 106, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(217, 70, 239, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(225, 75, 106, 0.08) 0%, transparent 50%);
}

/* Scrollable Layout */
.scrollable-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  scroll-behavior: smooth;
}

/* Glass Section Base */
.glass-section {
  position: relative;
  animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  margin-bottom: 1rem;
}

.glass-section:nth-child(1) {
  animation-delay: 0.1s;
}
.glass-section:nth-child(2) {
  animation-delay: 0.2s;
}
.glass-section:nth-child(3) {
  animation-delay: 0.3s;
}
.glass-section:nth-child(4) {
  animation-delay: 0.4s;
}
.glass-section:nth-child(5) {
  animation-delay: 0.5s;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Glass Card Base */
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(225, 75, 106, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  opacity: 0.6;
}

.glass-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(225, 75, 106, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border-color: rgba(225, 75, 106, 0.4);
}

.dark-mode .glass-card {
  background: rgba(36, 23, 38, 0.4);
  border-color: rgba(225, 75, 106, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(225, 75, 106, 0.15),
    inset 0 1px 0 rgba(225, 75, 106, 0.2);
}

.dark-mode .glass-card:hover {
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 8px 24px rgba(225, 75, 106, 0.3),
    inset 0 1px 0 rgba(225, 75, 106, 0.4);
  border-color: rgba(225, 75, 106, 0.5);
}

/* Glass Button */
.glass-btn {
  background: rgba(225, 75, 106, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(225, 75, 106, 0.3);
  border-radius: 12px;
  color: #e14b6a;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-btn:hover {
  background: rgba(225, 75, 106, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(225, 75, 106, 0.2);
}

/* Glass Badge */
.glass-badge {
  background: rgba(225, 75, 106, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(225, 75, 106, 0.25);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: #e14b6a;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Dashboard Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  animation: fadeInDown 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dark-mode .dashboard-header {
  background: rgba(36, 23, 38, 0.4);
  border-color: rgba(225, 75, 106, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(225, 75, 106, 0.2);
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #e14b6a, #8a2a44, #e14b6a);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem;
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.dark-mode .dashboard-title {
  background: linear-gradient(135deg, #e14b6a, #d946ef, #e14b6a);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
}

.dashboard-subtitle {
  color: #8a2a44;
  font-size: 1.1rem;
  opacity: 0.9;
}

.dark-mode .dashboard-subtitle {
  color: rgba(225, 75, 106, 0.8);
}

.dashboard-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6d1a36;
}

.dark-mode .control-group label {
  color: #e14b6a;
}

.type-selector {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(225, 75, 106, 0.3);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  color: #6d1a36;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode .type-selector {
  background: rgba(45, 27, 50, 0.6);
  color: #e14b6a;
  border-color: rgba(225, 75, 106, 0.4);
}

.type-selector:focus {
  outline: none;
  border-color: #e14b6a;
  box-shadow: 0 0 0 4px rgba(225, 75, 106, 0.2);
  transform: scale(1.05);
}

.action-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

.refresh-btn {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(225, 75, 106, 0.3);
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 20px rgba(225, 75, 106, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.dark-mode .refresh-btn {
  background: linear-gradient(135deg, #e14b6a, #d946ef);
}

.spinning {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.last-fetched {
  font-size: 0.75rem;
  color: #8a2a44;
  font-style: italic;
  opacity: 0.8;
}

.dark-mode .last-fetched {
  color: rgba(225, 75, 106, 0.7);
}

/* Loading, Error, Empty States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  margin: 2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dark-mode .loading-container,
.dark-mode .error-container {
  background: rgba(36, 23, 38, 0.4);
  border-color: rgba(225, 75, 106, 0.3);
}

.loading-spinner,
.error-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), rgba(138, 42, 68, 0.2));
  border-radius: 50%;
  margin-bottom: 1.5rem;
  color: #e14b6a;
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.retry-btn,
.login-btn {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(225, 75, 106, 0.3);
}

.retry-btn:hover,
.login-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(225, 75, 106, 0.4);
}

/* Section Titles */
.section-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #6d1a36;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.dark-mode .section-title {
  color: #e14b6a;
}

.section-icon {
  font-size: 1.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), rgba(138, 42, 68, 0.2));
  border-radius: 12px;
  color: #e14b6a;
}

/* KPI Section */
.kpi-section {
  margin-bottom: 2rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.kpi-card {
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-left: 4px solid #e14b6a;
  position: relative;
}

.kpi-card::after {
  content: '';
  position: absolute;
  top: 10px;
  right: 10px;
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.3;
}

.kpi-card.approved {
  border-left-color: #10b981;
}
.kpi-card.pending {
  border-left-color: #f59e0b;
}
.kpi-card.rejected {
  border-left-color: #ef4444;
}
.kpi-card.inflow {
  border-left-color: #10b981;
}
.kpi-card.outflow {
  border-left-color: #ef4444;
}
.kpi-card.net.positive {
  border-left-color: #10b981;
}
.kpi-card.net.negative {
  border-left-color: #ef4444;
}

.kpi-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), rgba(138, 42, 68, 0.1));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e14b6a;
  font-size: 1.5rem;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 900;
  color: #6d1a36;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.dark-mode .kpi-value {
  color: #e14b6a;
}

.kpi-label {
  font-size: 0.875rem;
  color: #8a2a44;
  font-weight: 600;
  opacity: 0.9;
}

.dark-mode .kpi-label {
  color: rgba(225, 75, 106, 0.8);
}

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
}

.chart-card {
  padding: 2rem;
}

.chart-card.wide {
  grid-column: span 2;
}

.chart-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #6d1a36;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark-mode .chart-card h3 {
  color: #e14b6a;
}

.flow-visualization {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* Data Section */
.data-content {
  padding: 2rem;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.export-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.export-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(225, 75, 106, 0.2);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  background: rgba(225, 75, 106, 0.15);
  color: #8a2a44;
  font-weight: 700;
  text-align: left;
  padding: 1.25rem;
  border-bottom: 1px solid rgba(225, 75, 106, 0.2);
}

.dark-mode .data-table th {
  color: #e14b6a;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.data-table th.sortable:hover {
  background: rgba(225, 75, 106, 0.25);
}

.sort-icon {
  margin-left: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.data-table td {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(225, 75, 106, 0.1);
  color: #6d1a36;
  transition: background-color 0.3s ease;
}

.dark-mode .data-table td {
  color: rgba(225, 75, 106, 0.9);
}

.data-table tr:hover td {
  background: rgba(225, 75, 106, 0.08);
}

.data-table td.number {
  text-align: right;
  font-family: 'SF Mono', 'Monaco', 'Roboto Mono', monospace;
  font-weight: 600;
}

.data-table td.positive {
  color: #10b981;
}

.data-table td.negative {
  color: #ef4444;
}

/* Performance Section */
.performance-card {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.08), rgba(138, 42, 68, 0.05));
  border: 1px solid rgba(225, 75, 106, 0.2);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(8px);
}

.performance-card h4 {
  color: #6d1a36;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.dark-mode .performance-card h4 {
  color: #e14b6a;
}

.metric-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(225, 75, 106, 0.15);
  transition: all 0.3s ease;
}

.metric-item:last-child {
  border-bottom: none;
}

.metric-item:hover {
  padding-left: 0.5rem;
  background: rgba(225, 75, 106, 0.05);
  border-radius: 8px;
}

.metric-item span:first-child {
  color: #8a2a44;
  font-weight: 600;
}

.dark-mode .metric-item span:first-child {
  color: rgba(225, 75, 106, 0.8);
}

.metric-item span:last-child {
  color: #6d1a36;
  font-weight: 800;
  font-family: 'SF Mono', 'Monaco', 'Roboto Mono', monospace;
}

.dark-mode .metric-item span:last-child {
  color: #e14b6a;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .budget-dashboard {
    padding: 1.5rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .dashboard-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-card.wide {
    grid-column: span 1;
  }

  .flow-visualization {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .budget-dashboard {
    padding: 1rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .table-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .charts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .budget-dashboard {
    padding: 0.75rem;
  }

  .dashboard-header {
    padding: 1rem;
  }

  .glass-card {
    border-radius: 16px;
  }

  .kpi-card {
    padding: 1.5rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}

/* Smooth scroll for better UX */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(225, 75, 106, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
}
</style>
