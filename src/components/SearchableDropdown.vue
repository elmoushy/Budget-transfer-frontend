<template>
  <div
    class="searchable-dropdown"
    :class="{ 'dark-mode': isDarkMode, rtl: isRTL, disabled: disabled }"
  >
    <div
      ref="dropdownTrigger"
      class="dropdown-trigger"
      @click="toggleDropdown"
      :class="{ 'dropdown-open': isOpen }"
    >
      <div class="selected-value">
        <span v-if="displayValue" class="value-text">{{ displayValue }}</span>
        <span v-else class="placeholder-text">{{ placeholder }}</span>
      </div>
      <div class="dropdown-icon" :class="{ 'icon-rotated': isOpen }">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>

    <!-- Portal the dropdown to document body to escape table stacking context -->
    <Teleport to="body" v-if="isOpen">
      <Transition name="dropdown">
        <div
          ref="dropdownPanel"
          class="dropdown-panel-portal"
          :style="{
            position: 'absolute',
            top: panelPosition.top + 'px',
            left: panelPosition.left + 'px',
            width: panelPosition.width + 'px',
            zIndex: 999999,
          }"
        >
          <div class="search-container">
            <div class="search-input-wrapper">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14 14L11.1 11.1"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                class="search-input"
                :placeholder="searchPlaceholder"
                @input="onSearchInput"
              />
              <button v-if="searchQuery" @click="clearSearch" class="clear-button">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="options-container">
            <div v-if="filteredOptions.length === 0" class="no-results">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
                <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.5" />
              </svg>
              <span>{{ noResultsText }}</span>
            </div>

            <div
              v-for="option in filteredOptions"
              :key="option.value"
              class="option-item"
              :class="{ 'option-selected': option.value === modelValue }"
              @click="selectOption(option)"
            >
              <div class="option-content">
                <div class="option-value">{{ option.value }}</div>
                <div v-if="option.label !== option.value" class="option-label">
                  {{ option.label }}
                </div>
              </div>
              <div v-if="option.value === modelValue" class="selected-indicator">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13.5 4.5L6 12L2.5 8.5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div v-if="isOpen" class="dropdown-overlay" @click="closeDropdown"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
  noResultsText: {
    type: String,
    default: 'No results found',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isDarkMode: {
    type: Boolean,
    default: false,
  },
  isRTL: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)
const dropdownTrigger = ref(null)
const dropdownPanel = ref(null)

// Add new reactive variables for positioning
const panelPosition = ref({ top: 0, left: 0, width: 0 })

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const option = props.options.find((opt) => opt.value === props.modelValue)
  return option ? option.value : props.modelValue
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options

  const query = searchQuery.value.toLowerCase()
  return props.options.filter(
    (option) =>
      option.value.toString().toLowerCase().includes(query) ||
      (option.label && option.label.toLowerCase().includes(query)),
  )
})

const toggleDropdown = () => {
  if (props.disabled) return

  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const calculatePosition = () => {
  if (!dropdownTrigger.value) return

  const rect = dropdownTrigger.value.getBoundingClientRect()
  const scrollY = window.scrollY || document.documentElement.scrollTop
  const scrollX = window.scrollX || document.documentElement.scrollLeft

  panelPosition.value = {
    top: rect.bottom + scrollY + 8,
    left: rect.left + scrollX,
    width: rect.width,
  }
}

const openDropdown = async () => {
  isOpen.value = true
  await nextTick()
  calculatePosition()
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
}

const selectOption = (option) => {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  closeDropdown()
}

const onSearchInput = () => {
  // Search functionality is handled by computed filteredOptions
}

const clearSearch = () => {
  searchQuery.value = ''
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.searchable-dropdown')) {
    closeDropdown()
  }
}

// Recalculate position on scroll and resize
const handlePositionUpdate = () => {
  if (isOpen.value) {
    calculatePosition()
  }
}

watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

onMounted(() => {
  window.addEventListener('scroll', handlePositionUpdate, true)
  window.addEventListener('resize', handlePositionUpdate)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handlePositionUpdate, true)
  window.removeEventListener('resize', handlePositionUpdate)
})
</script>

<style scoped>
.searchable-dropdown {
  position: relative;
  width: 100%;
  isolation: isolate;
  contain: layout style;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.dropdown-trigger::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s;
}

.dropdown-trigger:hover::before {
  left: 100%;
}

.dropdown-trigger:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.dropdown-open {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.selected-value {
  flex: 1;
  text-align: left;
}

.value-text {
  color: #1f2937;
  font-weight: 500;
  font-size: 14px;
}

.placeholder-text {
  color: #9ca3af;
  font-size: 14px;
}

.dropdown-icon {
  color: #6b7280;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
}

.icon-rotated {
  transform: rotate(180deg);
}

.dropdown-panel-portal {
  background: #ffffff;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  backdrop-filter: blur(10px);
  min-height: 300px;
  max-height: 400px;
  transform-origin: top center;
}

/* Copy all dropdown panel styles to portal version */
.dropdown-panel-portal .search-container {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(145deg, #f8f9fa, #ffffff);
  flex-shrink: 0;
}

.dropdown-panel-portal .search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.dropdown-panel-portal .search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
}

.dropdown-panel-portal .search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 14px;
  background: #ffffff;
  transition: all 0.3s ease;
  outline: none;
}

.dropdown-panel-portal .search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dropdown-panel-portal .clear-button {
  position: absolute;
  right: 8px;
  padding: 4px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-panel-portal .clear-button:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.dropdown-panel-portal .options-container {
  max-height: 280px;
  min-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
  flex: 1;
}

.dropdown-panel-portal .options-container::-webkit-scrollbar {
  width: 6px;
}

.dropdown-panel-portal .options-container::-webkit-scrollbar-track {
  background: #f9fafb;
}

.dropdown-panel-portal .options-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.dropdown-panel-portal .options-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dropdown-panel-portal .option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f9fafb;
}

.dropdown-panel-portal .option-item:hover {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  transform: translateX(4px);
}

.dropdown-panel-portal .option-selected {
  background: linear-gradient(145deg, #eff6ff, #dbeafe) !important;
  color: #1d4ed8;
  font-weight: 500;
}

.dropdown-panel-portal .option-content {
  flex: 1;
}

.dropdown-panel-portal .option-value {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.dropdown-panel-portal .option-label {
  font-size: 12px;
  color: #6b7280;
}

.dropdown-panel-portal .selected-indicator {
  color: #1d4ed8;
  display: flex;
  align-items: center;
}

.dropdown-panel-portal .no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #9ca3af;
  text-align: center;
}

.dropdown-panel-portal .no-results svg {
  margin-bottom: 8px;
  opacity: 0.5;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999998;
  background: transparent;
}

/* Dropdown animation */
.dropdown-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* Dark mode styles */
.dark-mode .dropdown-trigger {
  background: linear-gradient(145deg, #374151, #4b5563);
  border-color: #4b5563;
  color: #f9fafb;
}

.dark-mode .dropdown-trigger:hover {
  border-color: #60a5fa;
  box-shadow: 0 4px 16px rgba(96, 165, 250, 0.15);
}

.dark-mode .value-text {
  color: #f9fafb;
}

.dark-mode .placeholder-text {
  color: #9ca3af;
}

.dark-mode .dropdown-panel-portal {
  background: #374151;
  border-color: #4b5563;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
}

.dark-mode .dropdown-panel-portal .search-container {
  background: linear-gradient(145deg, #4b5563, #374151);
  border-bottom-color: #4b5563;
}

.dark-mode .dropdown-panel-portal .search-input {
  background: #4b5563;
  border-color: #6b7280;
  color: #f9fafb;
}

.dark-mode .dropdown-panel-portal .search-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.dark-mode .dropdown-panel-portal .option-item {
  color: #f9fafb;
  border-bottom-color: #4b5563;
}

.dark-mode .dropdown-panel-portal .option-item:hover {
  background: linear-gradient(145deg, #4b5563, #6b7280);
}

.dark-mode .dropdown-panel-portal .option-selected {
  background: linear-gradient(145deg, #1e3a8a, #3730a3) !important;
  color: #93c5fd;
}

.dark-mode .dropdown-panel-portal .option-label {
  color: #9ca3af;
}

.dark-mode .dropdown-panel-portal .no-results {
  color: #9ca3af;
}

/* RTL styles */
.rtl .dropdown-panel-portal .search-icon {
  left: auto;
  right: 12px;
}

.rtl .dropdown-panel-portal .search-input {
  padding: 12px 40px 12px 16px;
}

.rtl .dropdown-panel-portal .clear-button {
  right: auto;
  left: 8px;
}

.rtl .dropdown-panel-portal .option-item:hover {
  transform: translateX(-4px);
}

/* Disabled state */
.disabled .dropdown-trigger {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.disabled .dropdown-trigger:hover {
  transform: none;
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dark-mode.disabled .dropdown-trigger {
  background: #4b5563;
  border-color: #6b7280;
  color: #9ca3af;
}
</style>
