<template>
  <div class="visualization-container" ref="container">
    <div class="visualization-header">
      <h3 class="visualization-title">{{ title }}</h3>
      <div class="visualization-controls">
        <button class="viz-control-btn" @click="switchView('bar')">
          <span class="viz-icon">📊</span> Bar
        </button>
        <button class="viz-control-btn" @click="switchView('pie')">
          <span class="viz-icon">🔄</span> Pie
        </button>
        <button class="viz-control-btn" @click="switchView('3d')">
          <span class="viz-icon">🧊</span> 3D
        </button>
      </div>
    </div>
    <div class="visualization-content" ref="vizContent">
      <div class="loading-visualization" v-if="loading">
        <div class="viz-spinner"></div>
        <p>Generating visualization...</p>
      </div>
      <canvas ref="canvas" v-show="!loading" class="visualization-canvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';

// Props
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: 'Budget Distribution'
  },
  colorScheme: {
    type: Array,
    default: () => [
      'rgba(0, 229, 255, 0.7)',
      'rgba(123, 44, 191, 0.7)',
      'rgba(255, 5, 146, 0.7)',
      'rgba(0, 255, 163, 0.7)',
      'rgba(255, 204, 0, 0.7)'
    ]
  }
});

// Refs
const container = ref(null);
const vizContent = ref(null);
const canvas = ref(null);
const loading = ref(true);
let chart = null;
const currentView = ref('bar');

// Methods
const switchView = (view) => {
  loading.value = true;
  currentView.value = view;
  
  // Destroy previous chart if it exists
  if (chart) {
    chart.destroy();
  }
  
  // Small delay to show loading animation
  setTimeout(() => {
    createChart();
  }, 500);
};

const createChart = async () => {
  if (!canvas.value) return;
  
  // Prepare data for visualization
  const labels = props.data.map(item => item.label || 'Unnamed');
  const values = props.data.map(item => item.value || 0);
  
  // Create background gradients
  const ctx = canvas.value.getContext('2d');
  const gradients = props.colorScheme.map(color => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    const rgbaColor = color.replace('0.7', '0.9');
    gradient.addColorStop(0, rgbaColor);
    gradient.addColorStop(1, color.replace('0.7', '0.4'));
    return gradient;
  });
  
  const backgroundColors = values.map((_, index) => 
    gradients[index % gradients.length]
  );
  
  // Chart configuration based on view type
  const chartConfig = {
    type: currentView.value === 'pie' ? 'doughnut' : 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: props.title,
        data: values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
        borderWidth: 2,
        borderRadius: 6,
        hoverOffset: 15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#e2e8f0',
            font: {
              family: 'Inter, sans-serif',
              size: 12
            },
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#e2e8f0',
          padding: 12,
          cornerRadius: 8,
          boxPadding: 8,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          caretSize: 6,
          displayColors: true,
          titleFont: {
            family: 'Inter, sans-serif',
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            family: 'Inter, sans-serif',
            size: 13
          },
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += new Intl.NumberFormat().format(context.raw);
              return label;
            }
          }
        }
      }
    }
  };
  
  // Specific options for bar chart
  if (currentView.value === 'bar') {
    chartConfig.options.scales = {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#e2e8f0',
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#e2e8f0',
          callback: function(value) {
            return new Intl.NumberFormat().format(value);
          },
          font: {
            family: 'Inter, sans-serif'
          }
        }
      }
    };
  }
  
  // Create 3D effect for the "3d" view (simulated with shadow and transforms)
  if (currentView.value === '3d') {
    chartConfig.type = 'bar';
    chartConfig.options.plugins.tooltip.callbacks.title = function(tooltipItems) {
      return `3D View: ${tooltipItems[0].label}`;
    };
    
    // Add 3D effect with shadows and perspective transform
    chartConfig.options.responsive = true;
    chartConfig.options.animation.animateScale = true;
    chartConfig.data.datasets[0].borderWidth = 0;
    chartConfig.data.datasets[0].borderRadius = 6;
    
    // Add shadow dataset for 3D effect
    chartConfig.data.datasets.push({
      label: 'Shadow',
      data: values.map(v => v * 0.1), // Shadow is 10% of the value
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderWidth: 0,
      borderRadius: 4,
      hoverOffset: 0,
      barPercentage: 1.05,
      categoryPercentage: 0.95,
      grouped: false
    });
    
    // Adjust bar appearance for 3D effect
    chartConfig.data.datasets[0].barPercentage = 0.9;
    chartConfig.data.datasets[0].categoryPercentage = 0.9;
    
    // Transform the canvas container for 3D perspective
    vizContent.value.style.transform = 'perspective(1000px) rotateX(10deg) rotateY(5deg)';
    vizContent.value.style.transformOrigin = 'center center';
  } else {
    // Reset transform for non-3D views
    vizContent.value.style.transform = 'none';
  }
  
  // Create the chart
  chart = new Chart(canvas.value, chartConfig);
  
  // Finish loading
  loading.value = false;
};

// Resize chart when container changes size
const resizeChart = () => {
  if (chart) {
    chart.resize();
  }
};

// Watch for data changes
watch(
  () => props.data,
  () => {
    if (chart) {
      chart.destroy();
    }
    nextTick(() => {
      createChart();
    });
  },
  { deep: true }
);

// Initialize
onMounted(() => {
  // Create ResizeObserver to handle container resizing
  const resizeObserver = new ResizeObserver(() => {
    resizeChart();
  });
  
  if (container.value) {
    resizeObserver.observe(container.value);
  }
  
  // Initial chart creation
  createChart();
  
  // Cleanup
  return () => {
    if (chart) {
      chart.destroy();
    }
    if (container.value) {
      resizeObserver.unobserve(container.value);
    }
  };
});
</script>

<style scoped>
.visualization-container {
  background: rgba(15, 23, 42, 0.7);
  background-clip: padding-box;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 229, 255, 0.15);
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  perspective: 1000px;
}

.visualization-container:hover {
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.7);
  transform: translateY(-3px) rotateX(2deg);
}

.visualization-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 3px;
  background: linear-gradient(to bottom, #00e5ff, #ff0592);
  background-clip: padding-box;
  border-radius: 16px 0 0 16px;
  opacity: 0.8;
  box-shadow: 0 0 15px 3px rgba(0, 229, 255, 0.3);
}

.visualization-container::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, 
    transparent 0%, 
    rgba(0, 229, 255, 0.05) 25%, 
    rgba(123, 44, 191, 0.05) 75%, 
    transparent 100%);
  background-clip: padding-box;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.visualization-container:hover::after {
  opacity: 1;
  animation: shimmer 5s infinite linear;
}

.visualization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.visualization-title {
  margin: 0;
  color: #e2e8f0;
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(90deg, #ffffff, #00e5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.visualization-controls {
  display: flex;
  gap: 0.75rem;
}

.viz-control-btn {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.85rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.viz-control-btn:hover {
  background: rgba(0, 229, 255, 0.15);
  border-color: rgba(0, 229, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}

.viz-icon {
  font-size: 1rem;
}

.visualization-content {
  padding: 1.5rem;
  height: 400px;
  position: relative;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.visualization-canvas {
  width: 100%;
  height: 100%;
}

.loading-visualization {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(5px);
  color: #e2e8f0;
}

.viz-spinner {
  position: relative;
  width: 50px;
  height: 50px;
  margin-bottom: 1.5rem;
}

.viz-spinner::before,
.viz-spinner::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  border: 3px solid transparent;
  animation: rotate 2s linear infinite;
}

.viz-spinner::before {
  width: 100%;
  height: 100%;
  border-top-color: #00e5ff;
  border-left-color: #00e5ff;
  top: 0;
  left: 0;
  animation-duration: 1.5s;
}

.viz-spinner::after {
  width: 80%;
  height: 80%;
  border-bottom-color: #ff0592;
  border-right-color: #ff0592;
  top: 10%;
  left: 10%;
  animation-duration: 2s;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes shimmer {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Dark mode adjustments */
:global(.dark-mode) .visualization-container {
  background: rgba(7, 9, 23, 0.8);
}

:global(.dark-mode) .viz-control-btn {
  background: rgba(7, 9, 23, 0.8);
  color: #e2e8f0;
}

:global(.dark-mode) .viz-control-btn:hover {
  background: rgba(123, 44, 191, 0.15);
  border-color: rgba(123, 44, 191, 0.3);
  box-shadow: 0 0 10px rgba(123, 44, 191, 0.3);
}
</style>
