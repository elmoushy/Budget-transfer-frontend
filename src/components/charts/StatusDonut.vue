<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

interface Props {
  approved: number
  pending: number
  rejected: number
}

const props = defineProps<Props>()

const chartRef = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartRef.value) return

  const data = [props.approved, props.pending, props.rejected]
  const labels = ['Approved', 'Pending', 'Rejected']

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#10b981', // green for approved
            '#f59e0b', // amber for pending
            '#ef4444', // red for rejected
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverBorderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12,
              weight: '500',
            },
          },
        },
        tooltip: {
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: (context: any) => {
              const label = context.label || ''
              const value = context.parsed
              const total = data.reduce((sum, val) => sum + val, 0)
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0
              return `${label}: ${value} (${percentage}%)`
            },
          },
        },
      },
      interaction: {
        intersect: false,
      },
    },
  }

  chartInstance = new Chart(chartRef.value, config)
}

const updateChart = () => {
  if (!chartInstance) return

  const data = [props.approved, props.pending, props.rejected]
  chartInstance.data.datasets[0].data = data
  chartInstance.update('none')
}

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

watch(
  () => [props.approved, props.pending, props.rejected],
  () => {
    updateChart()
  },
)
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 250px;
  width: 100%;
}
</style>
