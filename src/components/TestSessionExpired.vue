<template>
  <div class="test-session">
    <button @click="triggerSessionExpired" class="test-btn">
      Test Session Expired Notification
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

function triggerSessionExpired() {
  console.log('Triggering session expired notification for testing...')
  authStore.handleSessionExpiry()
}
</script>

<style scoped>
.test-session {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
}

.test-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.test-btn:hover {
  background: #ff5252;
}
</style>
