<template>
  <div class="empty-state">
    <div class="empty-icon">
      <i :class="iconClass"></i>
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>
    <button v-if="actionText" @click="$emit('action')" class="empty-action">
      {{ actionText }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  iconClass?: string
  actionText?: string
}

withDefaults(defineProps<Props>(), {
  title: 'No Data Available',
  description: 'There is no data to display at the moment.',
  iconClass: 'fas fa-chart-bar',
  actionText: '',
})

defineEmits<{
  action: []
}>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 2px dashed rgba(138, 42, 68, 0.2);
  min-height: 200px;
}

.dark-mode .empty-state {
  background: rgba(36, 23, 38, 0.5);
  border-color: rgba(225, 75, 106, 0.2);
}

.empty-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(225, 75, 106, 0.1);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  color: #e14b6a;
  font-size: 1.5rem;
}

.dark-mode .empty-icon {
  background: rgba(225, 75, 106, 0.2);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #6d1a36;
  margin-bottom: 0.5rem;
}

.dark-mode .empty-title {
  color: #e14b6a;
}

.empty-description {
  color: #8a2a44;
  margin-bottom: 1.5rem;
  max-width: 300px;
}

.dark-mode .empty-description {
  color: rgba(225, 75, 106, 0.8);
}

.empty-action {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(225, 75, 106, 0.3);
}

.dark-mode .empty-action {
  background: linear-gradient(135deg, #e14b6a, #d946ef);
}
</style>
