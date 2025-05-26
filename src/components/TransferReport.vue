<template>
  <div class="report-modal-overlay" v-if="show" @click="closeModal">
    <div class="report-modal-content" @click.stop>
      <div class="report-modal-header">
        <h2>{{ isArabic ? 'تقرير المناقلة' : 'Transfer Report' }}</h2>
        <button class="modal-close-btn" @click="closeModal">×</button>
      </div>

      <div class="report-modal-body">
        <!-- Loading state -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>{{ isArabic ? 'جاري التحميل...' : 'Loading...' }}</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <p>{{ isArabic ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading data' }}</p>
          <button class="btn-retry" @click="loadReportData">
            {{ isArabic ? 'إعادة المحاولة' : 'Retry' }}
          </button>
        </div>

        <!-- Report content -->
        <div v-else class="report-content">
          <!-- Summary section -->
          <div class="report-summary">
            <h3>{{ isArabic ? 'ملخص' : 'Summary' }}</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">
                  {{ isArabic ? 'رقم المعاملة:' : 'Transaction ID:' }}
                </div>
                <div class="summary-value">{{ reportData.summary?.transaction_id }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">
                  {{ isArabic ? 'عدد المناقلات:' : 'Total Transfers:' }}
                </div>
                <div class="summary-value">{{ reportData.summary?.total_transfers }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">
                  {{ isArabic ? 'مجموع المناقلات (من):' : 'Total From:' }}
                </div>
                <div class="summary-value">{{ formatNumber(reportData.summary?.total_from) }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">
                  {{ isArabic ? 'مجموع المناقلات (إلى):' : 'Total To:' }}
                </div>
                <div class="summary-value">{{ formatNumber(reportData.summary?.total_to) }}</div>
              </div>
              <div class="summary-item">
                <!-- <div class="summary-label">{{ isArabic ? 'الحالة:' : 'Status:' }}</div> -->
                <!-- <div class="summary-value status-badge" :class="getStatusClass()">
                  {{ formatStatus(reportData.status?.status) }}
                </div> -->
              </div>
              <div class="summary-item">
                <!-- <div class="summary-label">{{ isArabic ? 'متوازن:' : 'Balanced:' }}</div>
                <div class="summary-value">
                  <span v-if="reportData.summary?.balanced" class="balanced-true">
                    {{ isArabic ? 'نعم' : 'Yes' }}
                  </span>
                  <span v-else class="balanced-false">
                    {{ isArabic ? 'لا' : 'No' }}
                  </span>
                </div> -->
              </div>
            </div>
          </div>

          <!-- Transfers table -->
          <div class="report-transfers">
            <h3>{{ isArabic ? 'تفاصيل المناقلات' : 'Transfer Details' }}</h3>
            <table class="transfers-table">
              <thead>
                <tr>
                  <th>{{ isArabic ? '#' : '#' }}</th>
                  <th>{{ isArabic ? 'رقم البند' : 'Cost Center Code' }}</th>
                  <th>{{ isArabic ? 'اسم البند' : 'Cost Center Name' }}</th>
                  <th>{{ isArabic ? 'رقم الحساب' : 'Account Code' }}</th>
                  <th>{{ isArabic ? 'اسم الحساب' : 'Account Name' }}</th>
                  <th>{{ isArabic ? 'من' : 'From' }}</th>
                  <th>{{ isArabic ? 'إلى' : 'To' }}</th>
                  <th>{{ isArabic ? 'الموازنة المعتمدة' : 'Approved Budget' }}</th>
                  <th>{{ isArabic ? 'الحالى' : 'Actual' }}</th>
                  <th>{{ isArabic ? 'الموازنة المتاحة' : 'Available Budget' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(transfer, index) in reportData.transfers" :key="transfer.transfer_id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ transfer.cost_center_code }}</td>
                  <td>{{ formatCostCenterName(transfer.cost_center_name) }}</td>
                  <td>{{ transfer.account_code }}</td>
                  <td>{{ transfer.account_name }}</td>
                  <td class="number-cell">{{ formatNumber(transfer.from_center) }}</td>
                  <td class="number-cell">{{ formatNumber(transfer.to_center) }}</td>
                  <td class="number-cell">{{ formatNumber(transfer.approved_budget) }}</td>
                  <td class="number-cell">{{ formatNumber(transfer.actual) }}</td>
                  <td class="number-cell">{{ formatNumber(transfer.available_budget) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Export options -->
          <div class="export-options">
            <h3>{{ isArabic ? 'تصدير التقرير' : 'Export Report' }}</h3>
            <div class="export-buttons">
              <!-- <button class="btn-export btn-excel" @click="exportToExcel">
                <span class="export-icon">📊</span> {{ isArabic ? 'تصدير إلى Excel' : 'Export to Excel' }}
              </button> -->
              <button class="btn-export btn-pdf" @click="exportToPDF">
                <span class="export-icon">📄</span>
                {{ isArabic ? 'تصدير إلى PDF' : 'Export to PDF' }}
              </button>
              <!-- <button class="btn-export btn-word" @click="exportToWord">
                <span class="export-icon">📝</span> {{ isArabic ? 'تصدير إلى Word' : 'Export to Word' }}
              </button> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable' // Make sure this import is present
import html2canvas from 'html2canvas'
import transferService from '@/services/TransferService'
import { useThemeStore } from '@/stores/themeStore'
import logoImage from '@/assets/img/lightidea_logo.png' // Import the logo image

export default {
  name: 'TransferReport',
  props: {
    show: Boolean,
    transactionId: {
      type: [Number, String],
      required: true,
    },
  },
  setup(props, { emit }) {
    const themeStore = useThemeStore()
    const isArabic = () => themeStore.language === 'ar'

    const loading = ref(false)
    const error = ref(false)
    const reportData = ref({
      summary: {},
      transfers: [],
      status: {},
    })

    const loadReportData = async () => {
      if (!props.transactionId) {
        error.value = true
        return
      }

      loading.value = true
      error.value = false

      try {
        const data = await transferService.getTransferDetails(props.transactionId)

        if (data && data.transfers) {
          reportData.value = data
        } else {
          console.error('Invalid data structure received:', data)
          error.value = true
        }
      } catch (err) {
        console.error('Failed to load report data:', err)
        error.value = true
      } finally {
        loading.value = false
      }
    }

    // Add a watcher for the show prop to load data when the modal becomes visible
    watch(
      () => props.show,
      (newValue) => {
        if (newValue === true) {
          loadReportData()
        }
      },
    )

    // Keep the onMounted hook to handle the initial state
    onMounted(() => {
      if (props.show) {
        loadReportData()
      }
    })

    const closeModal = () => {
      emit('close')
    }

    const formatNumber = (value) => {
      if (value === null || value === undefined) return '-'
      return new Intl.NumberFormat(isArabic() ? 'ar-SA' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    }

    const formatCostCenterName = (name) => {
      if (!name) return '-'
      // Remove the code prefix if it exists (e.g., "C0102001: ")
      return name.includes(':') ? name.split(':')[1].trim() : name
    }

    const formatStatus = (status) => {
      if (!status) return isArabic() ? 'غير معروف' : 'Unknown'

      if (isArabic()) {
        switch (status) {
          case 'approved':
            return 'معتمد'
          case 'is rejected':
            return 'مرفوض'
          case 'watting for approval':
            return 'في انتظار الموافقة'
          case 'not yet sent for approval':
            return 'لم يتم الإرسال للموافقة'
          default:
            return status
        }
      } else {
        switch (status) {
          case 'watting for approval':
            return 'Waiting for approval'
          default:
            return status.charAt(0).toUpperCase() + status.slice(1)
        }
      }
    }

    const getStatusClass = () => {
      const status = reportData.value?.status?.status
      if (!status) return ''

      switch (status) {
        case 'approved':
          return 'status-approved'
        case 'is rejected':
          return 'status-rejected'
        case 'watting for approval':
          return 'status-waiting'
        case 'not yet sent for approval':
          return 'status-not-sent'
        default:
          return ''
      }
    }

    /* Add the dictionary for internationalization and helper function */
    const dict = {
      ar: {
        SUMMARY_TITLE: 'ملخص التقرير',
        SUMMARY_SHEET: 'ملخص',
        DETAIL_SHEET: 'تفاصيل المناقلات',
        TRANSACTION_ID: 'رقم المعاملة',
        TOTAL_TRANSFERS: 'عدد المناقلات',
        TOTAL_FROM: 'إجمالي من',
        TOTAL_TO: 'إجمالي إلى',
        STATUS: 'الحالة',
        BALANCED: 'متوازن',
        YES: 'نعم',
        NO: 'لا',
        CC_CODE: 'رقم البند',
        CC_NAME: 'اسم البند',
        ACC_CODE: 'رقم الحساب',
        ACC_NAME: 'اسم الحساب',
        FROM: 'من',
        TO: 'إلى',
        APPROVED: 'الموازنة المعتمدة',
        ACTUAL: 'الحالي',
        AVAILABLE: 'الموازنة المتاحة',
        ENCUMBRANCE: 'الارتباط',
        TOTAL_LABEL: 'المجموع',
        FILE_PREFIX: 'تقرير_المناقلات',
      },
      en: {
        SUMMARY_TITLE: 'Report Summary',
        SUMMARY_SHEET: 'Summary',
        DETAIL_SHEET: 'Transfer Details',
        TRANSACTION_ID: 'Transaction ID',
        TOTAL_TRANSFERS: 'Total Transfers',
        TOTAL_FROM: 'Total From',
        TOTAL_TO: 'Total To',
        STATUS: 'Status',
        BALANCED: 'Balanced',
        YES: 'Yes',
        NO: 'No',
        CC_CODE: 'Cost Center Code',
        CC_NAME: 'Cost Center Name',
        ACC_CODE: 'Account Code',
        ACC_NAME: 'Account Name',
        FROM: 'From',
        TO: 'To',
        APPROVED: 'Approved Budget',
        ACTUAL: 'Actual',
        AVAILABLE: 'Available Budget',
        ENCUMBRANCE: 'Encumbrance',
        TOTAL_LABEL: 'Total',
        FILE_PREFIX: 'Transfer_Report',
      },
    }

    const safeName = (n) => (n.length > 31 ? n.slice(0, 30) : n).replace(/[/\\?*[\]:]/g, '')

    const exportToPDF = async () => {
      if (
        loading.value ||
        error.value ||
        !reportData.value.transfers ||
        reportData.value.transfers.length === 0
      ) {
        alert(
          isArabic()
            ? 'لا توجد بيانات لتصديرها أو البيانات لا تزال قيد التحميل.'
            : 'No data to export or data is still loading.',
        )
        return
      }

      try {
        console.log('Starting PDF generation using html2canvas...')
        const rtl = isArabic()

        // Calculate totals for the footer
        const totalFrom = reportData.value.summary?.total_from || 0
        const totalTo = reportData.value.summary?.total_to || 0
        const totalApprovedBudget = reportData.value.transfers.reduce(
          (sum, item) => sum + (parseFloat(item.approved_budget) || 0),
          0,
        )
        const totalActual = reportData.value.transfers.reduce(
          (sum, item) => sum + (parseFloat(item.actual) || 0),
          0,
        )
        const totalAvailableBudget = reportData.value.transfers.reduce(
          (sum, item) => sum + (parseFloat(item.available_budget) || 0),
          0,
        )

        // Get the absolute URL for the logo image
        const logoUrl = new URL(logoImage, import.meta.url).href

        const htmlReportContent = `
      <div id="pdf-export-content" lang="${rtl ? 'ar' : 'en'}" style="direction: ${rtl ? 'rtl' : 'ltr'}; font-family: ${rtl ? 'Tahoma, Arial, sans-serif' : "Arial, 'Helvetica Neue', Helvetica, sans-serif"}; width: 1050px; background-color: #fff; padding: 20px; box-sizing: border-box;">
      <style>
        body { margin: 0; }
        #pdf-export-content h1, #pdf-export-content h2 {
        /* Font will be inherited from #pdf-export-content */
        color: #333;
        margin-top: 0;
        margin-bottom: 10px;
        text-align: ${rtl ? 'right' : 'left'};
        }
        #pdf-export-content h1 { font-size: 22px; margin-bottom: 15px; }
        #pdf-export-content h2 { font-size: 16px; margin-top: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;}
        .summary-section { margin-bottom: 15px; padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 4px; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 15px; }
        .summary-item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
        .summary-label { font-weight: bold; color: #555; margin-${rtl ? 'left' : 'right'}: 8px; }
        .summary-value { text-align: ${rtl ? 'left' : 'right'}; }
        .status-badge {
        padding: 2px 7px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: bold;
        color: white;
        display: inline-block;
        text-transform: capitalize;
        }
        .status-approved { background-color: #28a745; }
        .status-rejected { background-color: #dc3545; }
        .status-waiting { background-color: #ffc107; color: #333; }
        .status-not-sent { background-color: #6c757d; }
        .balanced-true { color: #28a745; font-weight: bold; }
        .balanced-false { color: #dc3545; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
        th, td { border: 1px solid #ddd; padding: 5px 7px; text-align: ${rtl ? 'right' : 'left'}; vertical-align: top; }
        th { background-color: #f0f0f0; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .number-cell { text-align: ${rtl ? 'left' : 'right'}; }
        tfoot td { font-weight: bold; background-color: #e9e9e9; }
        .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .logo-container { ${rtl ? 'margin-left' : 'margin-right'}: 20px; }
        .report-title { flex: 1; }
      </style>

      <div class="report-header">
        <div class="logo-container">
          <img src="${logoUrl}" alt="Logo" style="max-height: 70px; max-width: 200px;" />
        </div>
        <div class="report-title">
          <th style="font-size: 42px; color: #333; font-weight: bold; margin-top: 0; margin-bottom: 15px; text-align: ${rtl ? 'right' : 'left'}; display: block; width: 100%;">${rtl ? 'تقرير المناقلة' : 'Transfer Report'}</th>
        </div>
      </div>

      <div class="summary-section">
        <th style="font-size: 42px; color: #333; font-weight: bold; margin-top: 0; margin-bottom: 15px; text-align: ${rtl ? 'right' : 'left'}; display: block; width: 100%;">${rtl ? 'ملخص' : 'Summary'}</th>

        <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">${rtl ? 'رقم المعاملة:' : 'Transaction ID:'}</span>
          <span class="summary-value">${reportData.value.summary?.transaction_id || '-'}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">${rtl ? 'عدد المناقلات:' : 'Total Transfers:'}</span>
          <span class="summary-value">${reportData.value.summary?.total_transfers || '-'}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">${rtl ? 'مجموع المناقلات (من):' : 'Total From:'}</span>
          <span class="summary-value number-cell">${formatNumber(reportData.value.summary?.total_from)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">${rtl ? 'مجموع المناقلات (إلى):' : 'Total To:'}</span>
          <span class="summary-value number-cell">${formatNumber(reportData.value.summary?.total_to)}</span>
        </div>
        </div>
      </div>

      <div class="details-section">
              <th style="font-size: 42px; color: #333; font-weight: bold; margin-top: 0; margin-bottom: 15px; text-align: ${rtl ? 'right' : 'left'}; display: block; width: 100%;">${rtl ? 'تفاصيل المناقلات' : 'Transfer Details'}</th>
        <table>
        <thead>
          <tr>
          <th>#</th>
          <th>${rtl ? 'رقم البند' : 'Cost Center Code'}</th>
          <th>${rtl ? 'اسم البند' : 'Cost Center Name'}</th>
          <th>${rtl ? 'رقم الحساب' : 'Account Code'}</th>
          <th>${rtl ? 'اسم الحساب' : 'Account Name'}</th>
          <th class="number-cell">${rtl ? 'من' : 'From'}</th>
          <th class="number-cell">${rtl ? 'إلى' : 'To'}</th>
          <th class="number-cell">${rtl ? 'الموازنة المعتمدة' : 'Approved Budget'}</th>
          <th class="number-cell">${rtl ? 'الحالى' : 'Actual'}</th>
          <th class="number-cell">${rtl ? 'الموازنة المتاحة' : 'Available Budget'}</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.value.transfers
            .map(
              (item, index) => `
          <tr>
          <td>${index + 1}</td>
          <td>${item.cost_center_code || '-'}</td>
          <td>${formatCostCenterName(item.cost_center_name)}</td>
          <td>${item.account_code || '-'}</td>
          <td>${item.account_name || '-'}</td>
          <td class="number-cell">${formatNumber(item.from_center)}</td>
          <td class="number-cell">${formatNumber(item.to_center)}</td>
          <td class="number-cell">${formatNumber(item.approved_budget)}</td>
          <td class="number-cell">${formatNumber(item.actual)}</td>
          <td class="number-cell">${formatNumber(item.available_budget)}</td>
          </tr>
          `,
            )
            .join('')}
        </tbody>
        <tfoot>
          <tr>
          <td colspan="5" style="text-align: ${rtl ? 'right' : 'left'}; font-weight: bold;">${rtl ? 'المجموع' : 'Total'}</td>
          <td class="number-cell">${formatNumber(totalFrom)}</td>
          <td class="number-cell">${formatNumber(totalTo)}</td>
          <td class="number-cell">${formatNumber(totalApprovedBudget)}</td>
          <td class="number-cell">${formatNumber(totalActual)}</td>
          <td class="number-cell">${formatNumber(totalAvailableBudget)}</td>
          </tr>
        </tfoot>
        </table>
      </div>
      </div>
      `

        const tempDiv = document.createElement('div')
        tempDiv.style.position = 'absolute'
        tempDiv.style.left = '-9999px' // Position off-screen
        tempDiv.style.top = '-9999px'
        tempDiv.style.width = '1050px' // Width for html2canvas rendering
        tempDiv.innerHTML = htmlReportContent
        document.body.appendChild(tempDiv)

        const contentElement = tempDiv.querySelector('#pdf-export-content')
        if (!contentElement) {
          document.body.removeChild(tempDiv)
          throw new Error('Could not find #pdf-export-content element for rendering.')
        }

        const canvas = await html2canvas(contentElement, {
          scale: 2, // Higher scale for better resolution
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        })

        document.body.removeChild(tempDiv)

        const imgData = canvas.toDataURL('image/png')

        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        })

        const imgProps = pdf.getImageProperties(imgData)
        const pdfPageWidth = pdf.internal.pageSize.getWidth()
        const pdfPageHeight = pdf.internal.pageSize.getHeight()

        const imgRenderedHeight = (imgProps.height * pdfPageWidth) / imgProps.width

        let heightLeft = imgRenderedHeight
        let yPositionOnPdf = 0

        pdf.addImage(imgData, 'PNG', 0, yPositionOnPdf, pdfPageWidth, imgRenderedHeight)
        heightLeft -= pdfPageHeight

        while (heightLeft > 0) {
          yPositionOnPdf -= pdfPageHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, yPositionOnPdf, pdfPageWidth, imgRenderedHeight)
          heightLeft -= pdfPageHeight
        }

        pdf.save(`Transfer_Report_${props.transactionId}.pdf`)
        console.log('PDF generated successfully using html2canvas')
      } catch (error) {
        console.error('Error generating PDF with html2canvas:', error)
        alert(
          isArabic()
            ? 'حدث خطأ أثناء إنشاء ملف PDF. يرجى التحقق من وحدة التحكم للحصول على التفاصيل.'
            : 'Could not generate PDF. Please check console for details.',
        )
      }
    }

    return {
      loading,
      error,
      reportData,
      isArabic,
      loadReportData,
      closeModal,
      formatNumber,
      formatCostCenterName,
      formatStatus,
      getStatusClass,
      exportToPDF,
    }
  },
}
</script>

<style scoped>
.report-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.report-modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.report-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f5f5;
  border-radius: 8px 8px 0 0;
}

.report-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: #000;
}

.report-modal-body {
  padding: 20px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.btn-retry {
  padding: 8px 16px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 15px;
}

.report-summary {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.status-rejected {
  background-color: #dc3545;
}

.status-waiting {
  background-color: #ffc107;
  color: #212529;
}

.status-not-sent {
  background-color: #6c757d;
}

.balanced-true {
  color: #28a745;
  font-weight: bold;
}

.balanced-false {
  color: #dc3545;
  font-weight: bold;
}

.transfers-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.transfers-table th,
.transfers-table td {
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
}

.transfers-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.transfers-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.transfers-table tr:hover {
  background-color: #f1f1f1;
}

.number-cell {
  text-align: right;
}

.export-options {
  margin-top: 30px;
}

.export-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn-export {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition:
    background-color 0.2s,
    transform 0.1s;
}

.btn-export:hover {
  transform: translateY(-2px);
}

.btn-export:active {
  transform: translateY(0px);
}

.export-icon {
  margin-right: 8px;
}

.btn-excel {
  background-color: #1d6f42;
  color: white;
}

.btn-excel:hover {
  background-color: #185a35;
}

.btn-pdf {
  background-color: #f40f02;
  color: white;
}

.btn-pdf:hover {
  background-color: #d30a00;
}

.btn-word {
  background-color: #2b579a;
  color: white;
}

.btn-word:hover {
  background-color: #204072;
}

/* RTL Support */
:host-context([dir='rtl']) .summary-grid,
:host-context([dir='rtl']) .export-buttons {
  direction: rtl;
}

:host-context([dir='rtl']) .transfers-table th,
:host-context([dir='rtl']) .transfers-table td {
  text-align: right;
}

:host-context([dir='rtl']) .number-cell {
  text-align: left;
}

:host-context([dir='rtl']) .export-icon {
  margin-right: 0;
  margin-left: 8px;
}
</style>
