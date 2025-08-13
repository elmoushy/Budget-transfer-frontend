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

// Register Chart.js components
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface Props {
  far: number
  afr: number
  fad: number
}

const props = defineProps<Props>()

const chartRef = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartRef.value) return

  const data = [props.far, props.afr, props.fad]
  const labels = ['FAR', 'AFR', 'FAD']

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Transfer Categories',
          data,
          backgroundColor: [
            '#e14b6a', // FAR
            '#d946ef', // AFR
            '#c084fc', // FAD
          ],
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
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
              const label = context.label || ''
              const value = context.parsed.y
              const total = data.reduce((sum, val) => sum + val, 0)
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0
              return `${label}: ${value} (${percentage}%)`
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

  const data = [props.far, props.afr, props.fad]
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
  () => [props.far, props.afr, props.fad],
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
