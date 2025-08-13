<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import type { GroupedTotals } from '@/types/dashboard'

// Register Chart.js components
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface Props {
  groupedData: GroupedTotals
}

const props = defineProps<Props>()

const chartRef = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartRef.value) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = {
    type: 'bar',
    data: {
      labels: props.groupedData.labels,
      datasets: [
        {
          label: 'To Account',
          data: props.groupedData.toSeries,
          backgroundColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'From Account',
          data: props.groupedData.fromSeries,
          backgroundColor: '#ef4444',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: (context: any) => {
              const label = context.dataset.label || ''
              const value = context.parsed.y
              return `${label}: ${value.toLocaleString()}`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: function (value: any) {
              return (value as number).toLocaleString()
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    },
  }

  chartInstance = new Chart(chartRef.value, config)
}

const updateChart = () => {
  if (!chartInstance) return

  chartInstance.data.labels = props.groupedData.labels
  chartInstance.data.datasets[0].data = props.groupedData.toSeries
  chartInstance.data.datasets[1].data = props.groupedData.fromSeries
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
  () => props.groupedData,
  () => {
    updateChart()
  },
  { deep: true },
)
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
