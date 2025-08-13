<!-- ChatBot.vue -->
<template>
  <div
    class="chatbot-container"
    ref="chatbotContainer"
    :style="chatbotStyles"
    :class="{ dragging: isDragging, 'robot-triggered': robotTriggered }"
  >
    <!-- Chatbot Toggle Button - Hidden initially until robot triggers it -->
    <Transition name="fade-scale">
      <button
        v-if="!isOpen && showToggle"
        @click="handleToggleClick"
        @mousedown="startDrag"
        @touchstart="startDrag"
        class="chatbot-toggle"
        :class="{ 'dark-theme': isDarkMode, dragging: isDragging }"
        aria-label="Open Chat"
      >
        <!-- <div class="chat-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"
              fill="currentColor"
            />
            <circle cx="7" cy="9" r="1.5" fill="currentColor" />
            <circle cx="12" cy="9" r="1.5" fill="currentColor" />
            <circle cx="17" cy="9" r="1.5" fill="currentColor" />
          </svg>
        </div> -->
        <img src="@/assets/img/chatbot image.png" alt="Chat Icon" class="chat-icon-img" />
        <div class="pulse-ring"></div>
        <!-- <div class="notification-badge" v-if="hasNewMessage"></div> -->
      </button>
    </Transition>

    <!-- Chat Panel -->
    <Transition name="slide-up">
      <div v-if="isOpen" class="chat-panel" :class="{ 'dark-theme': isDarkMode, rtl: isArabic }">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="header-content">
            <div class="bot-avatar">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9V3H7C5.9 3 5 3.9 5 5V9C5 10.1 5.9 11 7 11H9V21H11V11H13V21H15V11H17C18.1 11 19 10.1 19 9V7H21V9Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div class="bot-info">
              <h3 class="bot-name">{{ isArabic ? 'مساعد تنفيذ' : 'Tanfeez Assistant' }}</h3>
              <span class="bot-status">{{ isArabic ? 'متصل' : 'Online' }}</span>
            </div>
          </div>
          <button @click="toggleChat" class="close-button" aria-label="Close Chat">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" ref="messagesContainer">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="{ 'user-message': message.isUser, 'bot-message': !message.isUser }"
          >
            <div class="message-content">
              <!-- SQL Details Button (only for bot messages with SQL data) -->
              <div v-if="!message.isUser && message.sqlData" class="sql-details-button-container">
                <button
                  @click="openSqlModal(message.sqlData)"
                  class="sql-details-button"
                  :class="{ 'dark-theme': isDarkMode }"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM20 5H4V19H20V5ZM6 7H18V9H6V7ZM6 11H18V13H6V11ZM6 15H12V17H6V15Z"
                      fill="currentColor"
                    />
                  </svg>
                  {{ isArabic ? 'تفاصيل SQL' : 'SQL Details' }}
                </button>
              </div>

              <div class="message-text">{{ message.id === 1 ? initialMessage : message.text }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="message bot-message">
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="chat-input-container">
          <div class="input-wrapper">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              type="text"
              :placeholder="isArabic ? 'اكتب رسالتك...' : 'Type your message...'"
              class="chat-input"
              :disabled="isTyping"
            />
            <button
              @click="sendMessage"
              class="send-button"
              :disabled="!newMessage.trim() || isTyping"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- SQL Details Modal -->
    <Transition name="modal-fade">
      <div v-if="showSqlModal" class="sql-modal-overlay" @click="closeSqlModal">
        <div
          class="sql-modal-container"
          @click.stop
          :class="{ 'dark-theme': isDarkMode, rtl: isArabic }"
        >
          <!-- Modal Header -->
          <div class="sql-modal-header">
            <h2 class="sql-modal-title">
              {{ isArabic ? 'تفاصيل البيانات' : 'SQL Data Details' }}
            </h2>
            <button @click="closeSqlModal" class="sql-modal-close-button" aria-label="Close Modal">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="sql-modal-content">
            <div class="sql-table-container" v-html="currentSqlData"></div>
          </div>

          <!-- Modal Footer -->
          <div class="sql-modal-footer">
            <button @click="closeSqlModal" class="sql-modal-close-btn">
              {{ isArabic ? 'إغلاق' : 'Close' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { useRouter } from 'vue-router'

const themeStore = useThemeStore()
const router = useRouter()

const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')

const isOpen = ref(false)
const newMessage = ref('')
const isTyping = ref(false)
const hasNewMessage = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// Robot integration state
const showToggle = ref(true) // Initially show toggle button for robot animation
const robotTriggered = ref(false) // Track if robot triggered the chat

// SQL Modal state
const showSqlModal = ref(false)
const currentSqlData = ref('')

// Draggable functionality
const chatbotContainer = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const chatbotPosition = ref({ x: 10, y: 15 })
const containerBounds = ref({ width: 0, height: 0 })

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
  sqlData?: string // HTML table data from SQLBuilderAgent
}

const messages = ref<Message[]>([
  {
    id: 1,
    text: '',
    isUser: false,
    timestamp: new Date(),
  },
])

// Computed property for the initial message
const initialMessage = computed(() =>
  isArabic.value
    ? 'مرحباً! أنا مساعد تنفيذ. كيف يمكنني مساعدتك اليوم؟'
    : "Hello! I'm Tanfeez Assistant. How can I help you today?",
)

// Watch for language changes and update the initial message
watch(isArabic, () => {
  if (messages.value.length > 0 && messages.value[0].id === 1) {
    messages.value[0].text = initialMessage.value
  }
})

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    hasNewMessage.value = false
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// Draggable functionality
const startDrag = (event: MouseEvent | TouchEvent) => {
  if (isOpen.value) return // Don't allow dragging when chat is open

  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

  let currentScreenX: number
  let currentScreenY: number

  if (isArabic.value) {
    // RTL mode: position is from left
    currentScreenX = chatbotPosition.value.x
    currentScreenY = containerBounds.value.height - chatbotPosition.value.y - 80
  } else {
    // LTR mode: position is from right
    currentScreenX = containerBounds.value.width - chatbotPosition.value.x - 80
    currentScreenY = containerBounds.value.height - chatbotPosition.value.y - 80
  }

  dragStart.value = {
    x: clientX - currentScreenX,
    y: clientY - currentScreenY,
  }

  updateContainerBounds()

  // Don't set isDragging to true immediately - let handleDrag determine when to start dragging
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', handleDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)

  event.preventDefault()
}

const handleDrag = (event: MouseEvent | TouchEvent) => {
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

  let currentScreenX: number
  let currentScreenY: number

  if (isArabic.value) {
    // RTL mode: position is from left
    currentScreenX = chatbotPosition.value.x
    currentScreenY = containerBounds.value.height - chatbotPosition.value.y - 80
  } else {
    // LTR mode: position is from right
    currentScreenX = containerBounds.value.width - chatbotPosition.value.x - 80
    currentScreenY = containerBounds.value.height - chatbotPosition.value.y - 80
  }

  // Start dragging if we've moved more than 5 pixels
  const moved =
    Math.abs(clientX - (dragStart.value.x + currentScreenX)) > 5 ||
    Math.abs(clientY - (dragStart.value.y + currentScreenY)) > 5

  if (moved) {
    isDragging.value = true
  }

  if (!isDragging.value) return

  // Calculate new screen position (left, top)
  let newScreenX = clientX - dragStart.value.x
  let newScreenY = clientY - dragStart.value.y

  // Constrain to viewport bounds
  const maxScreenX = containerBounds.value.width - 80 // 80px is the button width
  const maxScreenY = containerBounds.value.height - 80 // 80px is the button height

  newScreenX = Math.max(0, Math.min(newScreenX, maxScreenX))
  newScreenY = Math.max(0, Math.min(newScreenY, maxScreenY))

  if (isArabic.value) {
    // RTL mode: store as left position
    const newX = newScreenX
    const newY = containerBounds.value.height - newScreenY - 80
    chatbotPosition.value = { x: newX, y: newY }
  } else {
    // LTR mode: convert back to right/bottom coordinates
    const newX = containerBounds.value.width - newScreenX - 80
    const newY = containerBounds.value.height - newScreenY - 80
    chatbotPosition.value = { x: newX, y: newY }
  }

  console.log(`Dragging to: ${chatbotPosition.value.x}, ${chatbotPosition.value.y}`)
  event.preventDefault()
}

const stopDrag = () => {
  const wasDragging = isDragging.value

  // Clean up event listeners
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDrag)

  // Snap to edges if close enough and was actually dragging
  if (wasDragging) {
    snapToEdges()
  }

  // Reset dragging state after a small delay to prevent immediate click
  setTimeout(() => {
    isDragging.value = false
  }, 10)

  return wasDragging
}

const handleToggleClick = () => {
  // Only open chat if we're not currently dragging
  if (!isDragging.value) {
    toggleChat()
  }
}

const snapToEdges = () => {
  const snapThreshold = 50
  const { x, y } = chatbotPosition.value
  const { width, height } = containerBounds.value

  let newX = x
  let newY = y

  if (isArabic.value) {
    // RTL mode: x is left position
    const screenX = x
    const screenY = height - y - 60

    // Snap to left or right edge
    if (screenX < snapThreshold) {
      newX = 21 // Snap to left edge (21px margin for RTL)
    } else if (screenX > width - 80 - snapThreshold) {
      newX = width - 80 - 24 // Snap to right edge (24px margin)
    }

    // Snap to top or bottom edge
    if (screenY < snapThreshold) {
      newY = height - 24 - 80 // Snap to top edge (24px margin)
    } else if (screenY > height - 80 - snapThreshold) {
      newY = 24 // Snap to bottom edge (24px margin)
    }
  } else {
    // LTR mode: x is right position
    const screenX = width - x - 60
    const screenY = height - y - 60

    // Snap to left or right edge
    if (screenX < snapThreshold) {
      newX = width - 24 - 80 // Snap to left edge (24px margin)
    } else if (screenX > width - 80 - snapThreshold) {
      newX = 24 // Snap to right edge (24px margin)
    }

    // Snap to top or bottom edge
    if (screenY < snapThreshold) {
      newY = height - 24 - 80 // Snap to top edge (24px margin)
    } else if (screenY > height - 80 - snapThreshold) {
      newY = 24 // Snap to bottom edge (24px margin)
    }
  }

  chatbotPosition.value = { x: newX, y: newY }
}

const updateContainerBounds = () => {
  containerBounds.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

// Computed styles for positioning
const chatbotStyles = computed(() => {
  if (isArabic.value) {
    // RTL mode: use left positioning
    return {
      left: `${chatbotPosition.value.x}px`,
      bottom: `${chatbotPosition.value.y}px`,
      transition: isDragging.value ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }
  } else {
    // LTR mode: use right positioning
    return {
      right: `${chatbotPosition.value.x}px`,
      bottom: `${chatbotPosition.value.y}px`,
      transition: isDragging.value ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }
})

const sendMessage = async () => {
  if (!newMessage.value.trim() || isTyping.value) return

  const userMessage: Message = {
    id: Date.now(),
    text: newMessage.value,
    isUser: true,
    timestamp: new Date(),
  }

  messages.value.push(userMessage)
  newMessage.value = ''

  nextTick(() => {
    scrollToBottom()
  })

  isTyping.value = true

  try {
    // Send request to backend using environment variable
    const apiUrl = import.meta.env.VITE_API_CHATBOT_URL || 'http://localhost:8080'
    const response = await fetch(`${apiUrl}/chatbot/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_input: userMessage.text }),
    })
    const data = await response.json()
    let botText = ''
    let pageToNavigate = null
    let sqlData = null

    if (data && data.status === 'success' && data.response) {
      if (data.response.GeneralQAAgent) {
        botText = data.response.GeneralQAAgent
      }
      if (data.response.PageNavigatorAgent) {
        pageToNavigate = data.response.PageNavigatorAgent
      }
      if (data.response.SQLBuilderAgent) {
        sqlData = data.response.SQLBuilderAgent
      }
    } else {
      botText = isArabic.value
        ? 'حدث خطأ أثناء معالجة الطلب.'
        : 'An error occurred while processing your request.'
    }

    // Add bot message
    if (botText) {
      messages.value.push({
        id: Date.now() + 1,
        text: botText,
        isUser: false,
        timestamp: new Date(),
        sqlData: sqlData || undefined,
      })
    }

    // If PageNavigatorAgent exists, check if route exists and navigate
    if (pageToNavigate) {
      // Check if route exists
      const matchedRoute = router.getRoutes().find((r) => r.path === pageToNavigate)
      if (matchedRoute) {
        router.push(pageToNavigate)
      }
    }
  } catch (error) {
    console.error('Chat error:', error)
    messages.value.push({
      id: Date.now() + 2,
      text: isArabic.value ? 'تعذر الاتصال بالخادم.' : 'Failed to connect to the server.',
      isUser: false,
      timestamp: new Date(),
    })
  } finally {
    isTyping.value = false
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// SQL Modal functions
const openSqlModal = (sqlData: string) => {
  currentSqlData.value = sqlData
  showSqlModal.value = true
}

const closeSqlModal = () => {
  showSqlModal.value = false
  currentSqlData.value = ''
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString(isArabic.value ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  // Initialize container bounds
  updateContainerBounds()

  // Set initial position based on language
  if (isArabic.value) {
    chatbotPosition.value = { x: 21, y: 15 } // Default RTL position
  } else {
    chatbotPosition.value = { x: 10, y: 15 } // Default LTR position
  }

  // Set initial message based on language
  messages.value[0].text = initialMessage.value

  // Update bounds on window resize
  window.addEventListener('resize', updateContainerBounds)

  // Simulate receiving a new message after some time (for demo)
  setTimeout(() => {
    if (!isOpen.value) {
      hasNewMessage.value = true
    }
  }, 10000)
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('resize', updateContainerBounds)
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.chatbot-container {
  position: fixed !important;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chatbot-container.dragging {
  transition: none !important;
  z-index: 1001;
}

.chatbot-container.dragging * {
  pointer-events: none;
}

/* Chatbot Toggle Button */
.chatbot-toggle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 32px rgba(138, 42, 68, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  touch-action: none;
}

.chatbot-toggle.dragging {
  cursor: grabbing;
  transform: scale(1.1);
  box-shadow:
    0 12px 40px rgba(138, 42, 68, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  z-index: 1002;
}

.chatbot-toggle.dark-theme {
  background: linear-gradient(135deg, #6d1a36, #e14b6a);
  box-shadow:
    0 8px 32px rgba(225, 75, 106, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.chatbot-toggle.dark-theme.dragging {
  box-shadow:
    0 12px 40px rgba(225, 75, 106, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.chatbot-toggle:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow:
    0 12px 40px rgba(138, 42, 68, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.chatbot-toggle.dark-theme:hover {
  box-shadow:
    0 12px 40px rgba(225, 75, 106, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.chat-icon {
  color: white;
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.chat-icon-img {
  width: 72px;
  height: 60px;
  position: relative;
  z-index: 1004;
  transition: transform 0.3s ease;
  border-radius: 2px;
  object-fit: cover;
}

.chatbot-toggle:hover .chat-icon {
  transform: scale(1.1);
}

.chatbot-toggle:hover .chat-icon-img {
  transform: scale(1.1);
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(225, 75, 106, 0.6);
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse-notification 2s infinite;
}

/* Chat Panel */
.chat-panel {
  width: 380px;
  height: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  bottom: 80px;
  right: 0;
}

.chat-panel.dark-theme {
  background: rgba(30, 41, 59, 0.95);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.chat-panel.rtl {
  right: auto;
  left: 0;
}

/* Chat Header */
.chat-header {
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 20px 20px 0 0;
}

.chat-panel.dark-theme .chat-header {
  background: linear-gradient(135deg, #6d1a36, #e14b6a);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bot-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.bot-info {
  display: flex;
  flex-direction: column;
}

.bot-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.bot-status {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 2px;
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* Chat Messages */
.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(248, 250, 252, 0.5);
}

.chat-panel.dark-theme .chat-messages {
  background: rgba(15, 23, 42, 0.5);
}

.message {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.user-message {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.bot-message .message-text {
  background: rgba(255, 255, 255, 0.8);
  color: #374151;
  border-bottom-left-radius: 4px;
}

.user-message .message-text {
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-panel.dark-theme .bot-message .message-text {
  background: rgba(71, 85, 105, 0.8);
  color: #e2e8f0;
}

.message-time {
  font-size: 11px;
  opacity: 0.6;
  margin-top: 4px;
  padding: 0 16px;
}

.user-message .message-time {
  text-align: right;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  border-bottom-left-radius: 4px;
}

.chat-panel.dark-theme .typing-indicator {
  background: rgba(71, 85, 105, 0.8);
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing-bounce 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

/* Chat Input */
.chat-input-container {
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.chat-panel.dark-theme .chat-input-container {
  background: rgba(30, 41, 59, 0.8);
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  background: rgba(255, 255, 255, 0.8);
  color: #374151;
  transition: all 0.2s ease;
}

.chat-panel.dark-theme .chat-input {
  background: rgba(71, 85, 105, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.3);
  color: #e2e8f0;
}

.chat-input:focus {
  border-color: #e14b6a;
  box-shadow: 0 0 0 3px rgba(225, 75, 106, 0.1);
}

.chat-input::placeholder {
  color: #9ca3af;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.send-button:not(:disabled):hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(225, 75, 106, 0.3);
}

/* Scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.chat-panel.dark-theme .chat-messages::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

/* Animations */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes pulse-notification {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes typing-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .chat-panel {
    width: calc(100vw - 32px);
    height: calc(100vh - 120px);
    bottom: 80px;
    right: 0;
    left: 0;
    margin: 0 16px;
  }

  .chatbot-toggle {
    width: 70px;
    height: 70px;
  }

  .chat-icon svg {
    width: 20px;
    height: 20px;
  }

  .chat-icon-img {
    width: 62px;
    height: 52px;
  }
}

/* Visual feedback for dragging */
.chatbot-container.dragging .chatbot-toggle .pulse-ring {
  display: none;
}

.chatbot-container.dragging .chatbot-toggle {
  animation: drag-glow 0.5s ease-in-out infinite alternate;
}

@keyframes drag-glow {
  from {
    box-shadow:
      0 12px 40px rgba(138, 42, 68, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  to {
    box-shadow:
      0 16px 50px rgba(225, 75, 106, 0.7),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
}

/* SQL Details Button */
.sql-details-button-container {
  margin-bottom: 8px;
}

.sql-details-button {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.sql-details-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.sql-details-button.dark-theme {
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
  box-shadow: 0 2px 4px rgba(30, 64, 175, 0.3);
}

.sql-details-button.dark-theme:hover {
  box-shadow: 0 4px 8px rgba(30, 64, 175, 0.4);
}

/* SQL Modal */
.sql-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.sql-modal-container {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sql-modal-container.dark-theme {
  background: rgba(30, 41, 59, 0.98);
  border: 1px solid rgba(71, 85, 105, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.sql-modal-header {
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  color: white;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px 16px 0 0;
}

.sql-modal-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.sql-modal-close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.sql-modal-close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.sql-modal-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: rgba(248, 250, 252, 0.8);
}

.sql-modal-container.dark-theme .sql-modal-content {
  background: rgba(15, 23, 42, 0.8);
}

.sql-table-container {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sql-table-container table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.sql-modal-container.dark-theme .sql-table-container table {
  background: rgba(71, 85, 105, 0.8);
}

.sql-table-container table th,
.sql-table-container table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 14px;
}

.sql-modal-container.dark-theme .sql-table-container table th,
.sql-modal-container.dark-theme .sql-table-container table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.sql-table-container table th {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  font-weight: 600;
  color: #374151;
}

.sql-modal-container.dark-theme .sql-table-container table th {
  background: linear-gradient(135deg, #475569, #64748b);
  color: #f1f5f9;
}

.sql-table-container table tr:hover {
  background: rgba(59, 130, 246, 0.05);
}

.sql-modal-container.dark-theme .sql-table-container table tr:hover {
  background: rgba(59, 130, 246, 0.1);
}

.sql-modal-footer {
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end;
}

.sql-modal-container.dark-theme .sql-modal-footer {
  background: rgba(30, 41, 59, 0.8);
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.sql-modal-close-btn {
  background: linear-gradient(135deg, #6b7280, #9ca3af);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.sql-modal-close-btn:hover {
  background: linear-gradient(135deg, #4b5563, #6b7280);
  transform: translateY(-1px);
}

/* RTL Support for Modal */
.sql-modal-container.rtl {
  direction: rtl;
}

.sql-modal-container.rtl .sql-table-container table th,
.sql-modal-container.rtl .sql-table-container table td {
  text-align: right;
}

.sql-modal-container.rtl .sql-modal-footer {
  justify-content: flex-start;
}

/* Modal Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .sql-modal-container,
.modal-fade-leave-to .sql-modal-container {
  transform: scale(0.9) translateY(20px);
}

/* Responsive Design for SQL Modal */
@media (max-width: 768px) {
  .sql-modal-container {
    width: 95%;
    max-height: 90vh;
  }

  .sql-modal-header {
    padding: 16px 20px;
  }

  .sql-modal-title {
    font-size: 16px;
  }

  .sql-modal-content {
    padding: 20px;
  }

  .sql-table-container table th,
  .sql-table-container table td {
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* Scrollbar for modal content */
.sql-modal-content::-webkit-scrollbar {
  width: 6px;
}

.sql-modal-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.sql-modal-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.sql-modal-container.dark-theme .sql-modal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sql-modal-container.dark-theme .sql-modal-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
}
</style>
