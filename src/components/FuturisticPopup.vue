<template>
  <Teleport to="body">
    <transition name="popup-fade">
      <div v-if="show" class="futuristic-popup-overlay" @click="handleOverlayClick">
        <div
          class="futuristic-popup-container"
          :class="[`type-${type}`, { 'dark-mode': isDarkMode }]"
          @click.stop
        >
          <div class="popup-glow-effect"></div>

          <div class="popup-header">
            <h3 class="popup-title">{{ title }}</h3>
            <button v-if="showCloseButton" class="popup-close" @click="closePopup">×</button>
          </div>

          <div class="popup-body">
            <div class="popup-icon-container">
              <div class="popup-icon">
                <check-icon v-if="type === 'success'" class="icon-svg" />
                <alert-triangle-icon v-else-if="type === 'error'" class="icon-svg" />
                <alert-circle-icon v-else-if="type === 'warning'" class="icon-svg" />
                <info-icon v-else class="icon-svg" />
              </div>
              <div class="popup-pulse"></div>
            </div>

            <div class="popup-content">{{ message }}</div>
          </div>

          <div v-if="showConfirmButton" class="popup-footer">
            <button class="popup-button" @click="closePopup">
              {{ confirmButtonText }}
              <div class="button-glow"></div>
            </button>
          </div>

          <div class="popup-corner top-left"></div>
          <div class="popup-corner top-right"></div>
          <div class="popup-corner bottom-left"></div>
          <div class="popup-corner bottom-right"></div>

          <div v-if="timer > 0" class="popup-timer">
            <div class="popup-timer-bar" :style="timerStyle"></div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { CheckIcon, AlertTriangleIcon, InfoIcon, AlertCircleIcon } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    required: true,
  },
  timer: {
    type: Number,
    default: 0,
  },
  showConfirmButton: {
    type: Boolean,
    default: false,
  },
  confirmButtonText: {
    type: String,
    default: 'OK',
  },
  showCloseButton: {
    type: Boolean,
    default: false,
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:show', 'confirm'])

const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.darkMode)

const autoCloseTimer = null
const timerStarted = ref(Date.now())
const timerRemaining = ref(props.timer)

const timerStyle = computed(() => {
  if (props.timer <= 0) return { width: '0%' }
  const percent = (timerRemaining.value / props.timer) * 100
  return { width: `${percent}%` }
})

const updateTimer = () => {
  if (props.timer <= 0) return

  const elapsed = Date.now() - timerStarted.value
  timerRemaining.value = Math.max(0, props.timer - elapsed)

  if (timerRemaining.value > 0) {
    requestAnimationFrame(updateTimer)
  } else {
    closePopup()
  }
}

const handleOverlayClick = () => {
  if (props.closeOnClickOutside) {
    closePopup()
  }
}

const closePopup = () => {
  emit('update:show', false)
  emit('confirm')
}

watch(
  () => props.show,
  (newValue) => {
    if (newValue && props.timer > 0) {
      timerStarted.value = Date.now()
      timerRemaining.value = props.timer
      requestAnimationFrame(updateTimer)
    }
  },
)

onMounted(() => {
  if (props.show && props.timer > 0) {
    timerStarted.value = Date.now()
    timerRemaining.value = props.timer
    requestAnimationFrame(updateTimer)
  }
})

onBeforeUnmount(() => {
  if (autoCloseTimer) clearTimeout(autoCloseTimer)
})
</script>

<style scoped>
.futuristic-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
}

.futuristic-popup-container {
  position: relative;
  width: 90%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: popup-appear 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.dark-mode.futuristic-popup-container {
  background: rgba(25, 25, 35, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  color: #e2e2e2;
}

.popup-glow-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  border-radius: 50%;
  z-index: 0;
  opacity: 0;
  animation: glow-pulse 4s ease-in-out infinite alternate;
}

.type-success .popup-glow-effect {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 70%);
}

.type-error .popup-glow-effect {
  background: radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0) 70%);
}

.type-warning .popup-glow-effect {
  background: radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0) 70%);
}

.type-info .popup-glow-effect {
  background: radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, rgba(79, 70, 229, 0) 70%);
}

.dark-mode .popup-glow-effect {
  opacity: 1;
}

.popup-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.2rem 1.5rem 0.5rem;
  z-index: 2;
}

.popup-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #1a1a2e, #4a0d20);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.dark-mode .popup-title {
  background: linear-gradient(135deg, #f0f0f0, #a0a0b8);
  -webkit-background-clip: text;
  background-clip: text;
}

.popup-close {
  position: absolute;
  right: 1rem;
  top: 1rem;
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.popup-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.dark-mode .popup-close:hover {
  background: rgba(255, 255, 255, 0.15);
}

.popup-body {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  z-index: 2;
  position: relative;
}

.popup-icon-container {
  position: relative;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  margin-right: 16px;
}

.popup-icon {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.type-success .popup-icon {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.type-error .popup-icon {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.type-warning .popup-icon {
  background: linear-gradient(135deg, #fbbf24, #d97706);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.type-info .popup-icon {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.dark-mode.type-success .popup-icon {
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
}

.dark-mode.type-error .popup-icon {
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
}

.dark-mode.type-warning .popup-icon {
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.5);
}

.dark-mode.type-info .popup-icon {
  box-shadow: 0 0 15px rgba(79, 70, 229, 0.5);
}

.icon-svg {
  color: white;
  width: 24px;
  height: 24px;
}

.popup-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  z-index: 1;
  animation: pulse 2s ease-out infinite;
}

.type-success .popup-pulse {
  background: rgba(16, 185, 129, 0.3);
}

.type-error .popup-pulse {
  background: rgba(239, 68, 68, 0.3);
}

.type-warning .popup-pulse {
  background: rgba(251, 191, 36, 0.3);
}

.type-info .popup-pulse {
  background: rgba(79, 70, 229, 0.3);
}

.popup-content {
  flex: 1;
  font-size: 1rem;
  line-height: 1.5;
  z-index: 2;
}

.popup-footer {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.popup-button {
  position: relative;
  min-width: 100px;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #6d1a36, #4a0d20);
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(109, 26, 54, 0.25);
}

.dark-mode .popup-button {
  background: linear-gradient(135deg, #8a2a46, #6d1a36);
  box-shadow: 0 4px 12px rgba(109, 26, 54, 0.5);
}

.popup-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(109, 26, 54, 0.3);
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  transition: all 0.6s ease;
}

.popup-button:hover .button-glow {
  left: 100%;
}

.popup-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  opacity: 0;
  animation: corner-appear 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.top-left {
  top: 0;
  left: 0;
  border-top: 2px solid;
  border-left: 2px solid;
  animation-delay: 0.1s;
}

.top-right {
  top: 0;
  right: 0;
  border-top: 2px solid;
  border-right: 2px solid;
  animation-delay: 0.2s;
}

.bottom-left {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid;
  border-left: 2px solid;
  animation-delay: 0.3s;
}

.bottom-right {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid;
  border-right: 2px solid;
  animation-delay: 0.4s;
}

.type-success .popup-corner {
  border-color: #10b981;
}

.type-error .popup-corner {
  border-color: #ef4444;
}

.type-warning .popup-corner {
  border-color: #fbbf24;
}

.type-info .popup-corner {
  border-color: #6366f1;
}

.popup-timer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.dark-mode .popup-timer {
  background: rgba(255, 255, 255, 0.1);
}

.popup-timer-bar {
  height: 100%;
  background: linear-gradient(90deg, #6d1a36, #4a0d20);
  transition: width 0.1s linear;
}

.dark-mode .popup-timer-bar {
  background: linear-gradient(90deg, #8a2a46, #6d1a36);
}

/* Animations */
@keyframes popup-appear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  80% {
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

@keyframes corner-appear {
  0% {
    opacity: 0;
    width: 0;
    height: 0;
  }
  100% {
    opacity: 1;
    width: 12px;
    height: 12px;
  }
}

@keyframes glow-pulse {
  0% {
    transform: rotate(0deg);
    opacity: 0.3;
  }
  100% {
    transform: rotate(360deg);
    opacity: 0.5;
  }
}

/* Transition */
.popup-fade-enter-active {
  animation: popup-appear 0.3s ease-out;
}

.popup-fade-leave-active {
  animation: popup-disappear 0.2s ease-in forwards;
}

@keyframes popup-disappear {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}

@media (max-width: 480px) {
  .futuristic-popup-container {
    max-width: 90%;
  }
}
</style>
