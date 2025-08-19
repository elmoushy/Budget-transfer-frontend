<!-- FooterBar.vue -->
<template>
  <footer class="footer" :class="{ 'dark-theme': isDarkMode }">
    <!-- Bottom Bar -->
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <div class="footer-links-bottom">
          <span
            >© {{ currentYear }}
            {{
              isArabic
                ? 'شركة Light Idea. جميع الحقوق محفوظة.'
                : 'Light Idea Company. All rights reserved.'
            }}</span
          >
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #fff6fa 0%, #f8f6f8 25%, #e4c9d6 60%, #8a2a44 100%);
  color: #1a1423;
  margin-top: auto;
  border-top: 1px solid rgba(228, 201, 214, 0.3);
  position: relative;
  overflow: hidden;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.08), transparent);
  animation: footer-shimmer 4s infinite;
  z-index: 1;
}

.footer.dark-theme {
  background: linear-gradient(135deg, #241726 0%, #18131a 25%, #51203c 60%, #6d1a36 100%);
  color: #f8e9f0;
  border-top: 1px solid rgba(81, 32, 60, 0.4);
}

.footer.dark-theme::before {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.15), transparent);
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 24px 24px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 48px;
  position: relative;
  z-index: 2;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Company Info Section */
.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo-img {
  width: 32px;
  height: auto;
  filter: drop-shadow(0 0 8px rgba(138, 42, 68, 0.2));
  transition: all 0.3s ease;
  border-radius: 6px;
}

.footer.dark-theme .logo-img {
  filter: drop-shadow(0 0 8px rgba(167, 56, 92, 0.3));
}

.company-name {
  font-weight: 700;
  font-size: 18px;
  background: linear-gradient(135deg, #6d1a36, #8a2a44, #e14b6a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
}

.company-description {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.8;
  margin: 0;
}

/* Quick Links Section */
.footer-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #6d1a36;
}

.footer.dark-theme .footer-title {
  color: #e14b6a;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-link {
  color: inherit;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  opacity: 0.8;
  position: relative;
  padding: 4px 0;
}

.footer-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, #e14b6a, #8a2a44);
  transition: width 0.3s ease;
}

.footer-link:hover {
  opacity: 1;
  color: #e14b6a;
  transform: translateX(4px);
}

.footer-link:hover::before {
  width: 100%;
}

/* Contact Info Section */
.contact-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.contact-item:hover {
  opacity: 1;
  transform: translateX(4px);
}

.contact-item svg {
  color: #e14b6a;
  flex-shrink: 0;
}

/* Footer Bottom */
.footer-bottom {
  border-top: 1px solid rgba(228, 201, 214, 0.2);
  background: rgba(255, 246, 250, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.footer.dark-theme .footer-bottom {
  border-top: 1px solid rgba(81, 32, 60, 0.3);
  background: rgba(36, 23, 38, 0.3);
}

.footer-bottom-content {
  max-width: auto;
  margin: 0 auto;
  padding: 26px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  opacity: 0.7;
}

.footer-links-bottom {
  display: flex;
  gap: 16px;
}

.footer-link-small {
  color: inherit;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.footer-link-small:hover {
  color: #e14b6a;
  background: rgba(225, 75, 106, 0.1);
}

/* Animations */
@keyframes footer-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .footer-container {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .contact-info {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 32px 20px 20px;
  }

  .footer-bottom-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .footer-links-bottom {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 24px 16px 16px;
  }

  .footer-logo {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .company-name {
    font-size: 16px;
  }

  .contact-item {
    flex-direction: column;
    text-align: center;
    gap: 4px;
  }
}

/* RTL Support */
[dir='rtl'] .footer-link:hover {
  transform: translateX(-4px);
}

[dir='rtl'] .contact-item:hover {
  transform: translateX(-4px);
}

[dir='rtl'] .footer-links-bottom {
  flex-direction: row-reverse;
}

/* Smooth transitions for theme switching */
.footer,
.footer * {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
