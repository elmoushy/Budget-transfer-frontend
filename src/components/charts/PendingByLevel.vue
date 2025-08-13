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
  pendingByLevel: Record<string, number>
}

const props = defineProps<Props>()

const chartRef = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartRef.value) return

  // Sort levels naturally (Level1, Level2, etc.)
  const sortedEntries = Object.entries(props.pendingByLevel).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
  )

  const labels = sortedEntries.map(([level]) => level)
  const data = sortedEntries.map(([, count]) => count)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Pending Transfers',
          data,
          backgroundColor: '#f59e0b',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      indexAxis: 'y', // Horizontal bar chart
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
              const level = context.label || ''
              const value = context.parsed.x
              return `${level}: ${value} pending transfers`
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            precision: 0,
          },
        },
        y: {
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

  const sortedEntries = Object.entries(props.pendingByLevel).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
  )

  const labels = sortedEntries.map(([level]) => level)
  const data = sortedEntries.map(([, count]) => count)

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
  () => props.pendingByLevel,
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
