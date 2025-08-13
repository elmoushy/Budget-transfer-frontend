<template>
  <div class="heatmap-container">
    <div class="heatmap-title">Cost Center × Account Flow Heatmap</div>
    <div class="heatmap-legend">
      <div class="legend-item">
        <div class="legend-color negative"></div>
        <span>Net Outflow</span>
      </div>
      <div class="legend-item">
        <div class="legend-color neutral"></div>
        <span>Balanced</span>
      </div>
      <div class="legend-item">
        <div class="legend-color positive"></div>
        <span>Net Inflow</span>
      </div>
    </div>
    <div ref="heatmapRef" class="heatmap-grid">
      <div
        v-for="cell in heatmapCells"
        :key="`${cell.x}-${cell.y}`"
        :class="['heatmap-cell', getCellClass(cell.value)]"
        :title="`CC ${cell.y} → AC ${cell.x}: Net ${cell.value.toLocaleString()} (To: ${cell.to.toLocaleString()}, From: ${cell.from.toLocaleString()})`"
        @click="showCellDetails(cell)"
      >
        <div class="cell-labels">
          <div class="cell-cc">CC {{ cell.y }}</div>
          <div class="cell-ac">AC {{ cell.x }}</div>
        </div>
        <div class="cell-value">{{ formatValue(cell.value) }}</div>
      </div>
    </div>

    <!-- Cell Details Modal -->
    <div v-if="selectedCell" class="cell-modal" @click="selectedCell = null">
      <div class="modal-content" @click.stop>
        <h4>Flow Details</h4>
        <div class="detail-row">
          <span>Cost Center:</span>
          <span>{{ selectedCell.y }}</span>
        </div>
        <div class="detail-row">
          <span>Account Code:</span>
          <span>{{ selectedCell.x }}</span>
        </div>
        <div class="detail-row">
          <span>Inflow (To):</span>
          <span class="positive">{{ selectedCell.to.toLocaleString() }}</span>
        </div>
        <div class="detail-row">
          <span>Outflow (From):</span>
          <span class="negative">{{ selectedCell.from.toLocaleString() }}</span>
        </div>
        <div class="detail-row total">
          <span>Net Flow:</span>
          <span :class="selectedCell.value >= 0 ? 'positive' : 'negative'">
            {{ selectedCell.value.toLocaleString() }}
          </span>
        </div>
        <button @click="selectedCell = null" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HeatmapCell } from '@/types/dashboard'

interface Props {
  heatmapCells: HeatmapCell[]
}

defineProps<Props>()

const heatmapRef = ref<HTMLDivElement>()
const selectedCell = ref<HeatmapCell | null>(null)

const getCellClass = (value: number): string => {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

const formatValue = (value: number): string => {
  if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M'
  }
  if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K'
  }
  return value.toString()
}

const showCellDetails = (cell: HeatmapCell) => {
  selectedCell.value = cell
}
</script>

<style scoped>
.heatmap-container {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark-mode .heatmap-container {
  background: rgba(36, 23, 38, 0.9);
}

.heatmap-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #6d1a36;
  margin-bottom: 1rem;
  text-align: center;
}

.dark-mode .heatmap-title {
  color: #e14b6a;
}

.heatmap-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6d1a36;
}

.dark-mode .legend-item {
  color: rgba(225, 75, 106, 0.9);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.legend-color.positive {
  background: #10b981;
}

.legend-color.negative {
  background: #ef4444;
}

.legend-color.neutral {
  background: #6b7280;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.heatmap-cell {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.heatmap-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.heatmap-cell.positive {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.2));
  border-color: #10b981;
}

.heatmap-cell.negative {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.2));
  border-color: #ef4444;
}

.heatmap-cell.neutral {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(107, 114, 128, 0.2));
  border-color: #6b7280;
}

.cell-labels {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.cell-cc,
.cell-ac {
  font-weight: 500;
}

.cell-value {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.dark-mode .cell-value {
  color: #f9fafb;
}

.cell-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.dark-mode .modal-content {
  background: #2d1b32;
  color: #f8e9f0;
}

.modal-content h4 {
  margin: 0 0 1.5rem 0;
  color: #6d1a36;
  text-align: center;
}

.dark-mode .modal-content h4 {
  color: #e14b6a;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dark-mode .detail-row {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.detail-row.total {
  border-bottom: none;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}

.close-btn {
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(225, 75, 106, 0.3);
}

.dark-mode .close-btn {
  background: linear-gradient(135deg, #e14b6a, #d946ef);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .heatmap-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .heatmap-legend {
    flex-direction: column;
    align-items: center;
  }
}
</style>
