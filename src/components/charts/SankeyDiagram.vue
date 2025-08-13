<template>
  <div class="sankey-container">
    <div class="sankey-title">Money Flow Sankey Diagram</div>
    <div class="sankey-description">
      Flow visualization showing money transfers between accounts and cost centers
    </div>
    <div class="sankey-placeholder">
      <div class="placeholder-icon">
        <i class="fas fa-project-diagram"></i>
      </div>
      <h4>Sankey Diagram</h4>
      <p>This would show bi-directional flows between Cost Centers and Account Codes.</p>
      <p>
        <strong>Implementation Note:</strong> Requires chartjs-chart-sankey plugin for full
        functionality.
      </p>

      <!-- Simplified flow representation -->
      <div class="simplified-flows">
        <div class="flow-summary">
          <h5>Flow Summary:</h5>
          <div class="flow-stats">
            <div class="stat-item">
              <span class="stat-label">Total Nodes:</span>
              <span class="stat-value">{{ totalNodes }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Links:</span>
              <span class="stat-value">{{ totalLinks }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Flow Value:</span>
              <span class="stat-value">{{ totalFlowValue.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="flow-legend">
          <div class="legend-item">
            <div class="legend-line inflow"></div>
            <span>Inflows (Account → Cost Center)</span>
          </div>
          <div class="legend-item">
            <div class="legend-line outflow"></div>
            <span>Outflows (Cost Center → Account)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SankeyData } from '@/types/dashboard'

interface Props {
  sankeyData: SankeyData
}

const props = defineProps<Props>()

const totalNodes = computed(() => props.sankeyData.nodes.length)
const totalLinks = computed(() => props.sankeyData.links.length)
const totalFlowValue = computed(() =>
  props.sankeyData.links.reduce((sum, link) => sum + link.value, 0),
)
</script>

<style scoped>
.sankey-container {
  width: 100%;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.dark-mode .sankey-container {
  background: rgba(36, 23, 38, 0.9);
}

.sankey-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #6d1a36;
  margin-bottom: 0.5rem;
}

.dark-mode .sankey-title {
  color: #e14b6a;
}

.sankey-description {
  font-size: 0.875rem;
  color: #8a2a44;
  margin-bottom: 1.5rem;
}

.dark-mode .sankey-description {
  color: rgba(225, 75, 106, 0.8);
}

.sankey-placeholder {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(225, 75, 106, 0.05);
  border: 2px dashed rgba(225, 75, 106, 0.2);
  border-radius: 8px;
  padding: 2rem;
}

.dark-mode .sankey-placeholder {
  background: rgba(225, 75, 106, 0.1);
  border-color: rgba(225, 75, 106, 0.3);
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(225, 75, 106, 0.1);
  border-radius: 50%;
  color: #e14b6a;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.dark-mode .placeholder-icon {
  background: rgba(225, 75, 106, 0.2);
}

.sankey-placeholder h4 {
  color: #6d1a36;
  margin-bottom: 1rem;
}

.dark-mode .sankey-placeholder h4 {
  color: #e14b6a;
}

.sankey-placeholder p {
  color: #8a2a44;
  margin-bottom: 0.5rem;
  max-width: 400px;
}

.dark-mode .sankey-placeholder p {
  color: rgba(225, 75, 106, 0.8);
}

.simplified-flows {
  margin-top: 2rem;
  width: 100%;
  max-width: 500px;
}

.flow-summary {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.dark-mode .flow-summary {
  background: rgba(45, 27, 50, 0.8);
}

.flow-summary h5 {
  color: #6d1a36;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.dark-mode .flow-summary h5 {
  color: #e14b6a;
}

.flow-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dark-mode .stat-item {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: 500;
  color: #8a2a44;
}

.dark-mode .stat-label {
  color: rgba(225, 75, 106, 0.8);
}

.stat-value {
  font-weight: 700;
  color: #6d1a36;
}

.dark-mode .stat-value {
  color: #e14b6a;
}

.flow-legend {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6d1a36;
}

.dark-mode .legend-item {
  color: rgba(225, 75, 106, 0.9);
}

.legend-line {
  width: 40px;
  height: 4px;
  border-radius: 2px;
}

.legend-line.inflow {
  background: linear-gradient(90deg, #10b981, #059669);
}

.legend-line.outflow {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

@media (max-width: 768px) {
  .flow-stats {
    grid-template-columns: 1fr;
  }

  .sankey-placeholder {
    padding: 1rem;
  }
}
</style>
