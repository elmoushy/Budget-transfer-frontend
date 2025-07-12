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
        <div class="chat-icon">
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
        </div>
        <div class="pulse-ring"></div>
        <div class="notification-badge" v-if="hasNewMessage"></div>
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
              <div class="message-text">{{ message.text }}</div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
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

// Draggable functionality
const chatbotContainer = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const chatbotPosition = ref({ x: 14, y: 40 }) // Initial position (right: 24px, bottom: 200px - above footer)
const containerBounds = ref({ width: 0, height: 0 })

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

const messages = ref<Message[]>([
  {
    id: 1,
    text: isArabic.value
      ? 'مرحباً! أنا مساعد تنفيذ. كيف يمكنني مساعدتك اليوم؟'
      : "Hello! I'm Tanfeez Assistant. How can I help you today?",
    isUser: false,
    timestamp: new Date(),
  },
])

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

  // Convert current position (right, bottom) to screen coordinates (left, top)
  const currentScreenX = containerBounds.value.width - chatbotPosition.value.x - 60
  const currentScreenY = containerBounds.value.height - chatbotPosition.value.y - 60

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

  // Convert current position to screen coordinates for movement detection
  const currentScreenX = containerBounds.value.width - chatbotPosition.value.x - 60
  const currentScreenY = containerBounds.value.height - chatbotPosition.value.y - 60

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
  const maxScreenX = containerBounds.value.width - 60 // 60px is the button width
  const maxScreenY = containerBounds.value.height - 60 // 60px is the button height

  newScreenX = Math.max(0, Math.min(newScreenX, maxScreenX))
  newScreenY = Math.max(0, Math.min(newScreenY, maxScreenY))

  // Convert back to right/bottom coordinates
  const newX = containerBounds.value.width - newScreenX - 60
  const newY = containerBounds.value.height - newScreenY - 60

  chatbotPosition.value = { x: newX, y: newY }

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

  // Convert to screen coordinates for easier calculation
  const screenX = width - x - 60
  const screenY = height - y - 60

  // Snap to left or right edge
  if (screenX < snapThreshold) {
    newX = width - 24 - 60 // Snap to left edge (24px margin)
  } else if (screenX > width - 60 - snapThreshold) {
    newX = 24 // Snap to right edge (24px margin)
  }

  // Snap to top or bottom edge
  if (screenY < snapThreshold) {
    newY = height - 24 - 60 // Snap to top edge (24px margin)
  } else if (screenY > height - 60 - snapThreshold) {
    newY = 24 // Snap to bottom edge (24px margin)
  }

  chatbotPosition.value = { x: newX, y: newY }
}

const updateContainerBounds = () => {
  containerBounds.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

// Calculate footer height to position chatbot above it
const getFooterHeight = (): number => {
  const footer = document.querySelector('footer')
  return footer ? footer.offsetHeight + 24 : 200 // Add 24px margin above footer
}

// Update chatbot position to be above footer
const updateChatbotPositionForFooter = () => {
  const footerHeight = getFooterHeight()
  // Only update if current position is too low (closer to bottom than footer height)
  if (chatbotPosition.value.y < footerHeight) {
    chatbotPosition.value.y = footerHeight
  }
}

// Computed styles for positioning
const chatbotStyles = computed(() => ({
  right: `${chatbotPosition.value.x}px`,
  bottom: `${chatbotPosition.value.y}px`,
  transition: isDragging.value ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}))

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
    // Send request to backend
    const response = await fetch('http://localhost:8000/chatbot/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_input: userMessage.text }),
    })
    const data = await response.json()
    let botText = ''
    let pageToNavigate = null
    if (data && data.status === 'success' && data.response) {
      if (data.response.GeneralQAAgent) {
        botText = data.response.GeneralQAAgent
      }
      if (data.response.PageNavigatorAgent) {
        pageToNavigate = data.response.PageNavigatorAgent
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
  } catch (err) {
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

const getBotResponse = (userInput: string): string => {
  const input = userInput.toLowerCase()

  if (isArabic.value) {
    if (input.includes('مساعدة') || input.includes('help')) {
      return 'يمكنني مساعدتك في: إدارة التحويلات، معلومات الحسابات، تتبع الطلبات، والاستفسارات العامة.'
    } else if (input.includes('تحويل') || input.includes('transfer')) {
      return 'لإجراء تحويل جديد، توجه إلى قسم "التحويلات" في القائمة الرئيسية.'
    } else if (input.includes('حساب') || input.includes('account')) {
      return 'يمكنك عرض معلومات حسابك من خلال قسم "إدارة الحسابات".'
    } else {
      return 'شكراً لك على رسالتك. كيف يمكنني مساعدتك أكثر؟'
    }
  } else {
    if (input.includes('help')) {
      return 'I can assist you with: Transfer management, account information, request tracking, and general inquiries.'
    } else if (input.includes('transfer')) {
      return 'To create a new transfer, navigate to the "Transfers" section in the main menu.'
    } else if (input.includes('account')) {
      return 'You can view your account information through the "Account Management" section.'
    } else {
      return 'Thank you for your message. How can I assist you further?'
    }
  }
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

  // Wait for DOM to be fully rendered, then adjust chatbot position for footer
  nextTick(() => {
    setTimeout(() => {
      updateChatbotPositionForFooter()
    }, 100) // Small delay to ensure footer is rendered
  })

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
  width: 60px;
  height: 60px;
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

.chatbot-toggle:hover .chat-icon {
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
    width: 50px;
    height: 50px;
  }

  .chat-icon svg {
    width: 20px;
    height: 20px;
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
</style>
