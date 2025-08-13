<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import type { ChartDataPoint } from '@/types/dashboard'

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
)

interface Props {
  timelineData: ChartDataPoint[]
}

const props = defineProps<Props>()

const chartRef = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartRef.value) return

  const labels = props.timelineData.map((d) => d.label)
  const data = props.timelineData.map((d) => d.count)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Requests per Day',
          data,
          borderColor: '#e14b6a',
          backgroundColor: 'rgba(225, 75, 106, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#e14b6a',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: (context: any) => {
              const date = context.label || ''
              const value = context.parsed.y
              return `${date}: ${value} requests`
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
            precision: 0,
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
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

  const labels = props.timelineData.map((d) => d.label)
  const data = props.timelineData.map((d) => d.count)

  chartInstance.data.labels = labels
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
  () => props.timelineData,
  () => {
    updateChart()
  },
  { deep: true },
)
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 250px;
  width: 100%;
}
</style>
