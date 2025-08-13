import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const darkMode = ref(localStorage.getItem('darkMode') === 'true')
  const language = ref(localStorage.getItem('language') || 'en')

  function setDarkMode(isDark: boolean) {
    darkMode.value = isDark
    localStorage.setItem('darkMode', isDark.toString())
    applyTheme()
  }

  function setLanguage(lang: string) {
    language.value = lang
    localStorage.setItem('language', lang)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  function applyTheme() {
    if (darkMode.value) {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  }

  // Initialize on store creation
  applyTheme()
  document.documentElement.dir = language.value === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = language.value

  return {
    darkMode,
    language,
    setDarkMode,
    setLanguage,
  }
})
