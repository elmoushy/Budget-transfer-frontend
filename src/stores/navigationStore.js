import { defineStore } from 'pinia'

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    // Track which page was the source of navigation
    sourceComponent: null,
    // Additional navigation metadata if needed
    navigationParams: {},
  }),

  actions: {
    setNavigationSource(source, params = {}) {
      this.sourceComponent = source
      this.navigationParams = params
    },

    clearNavigationSource() {
      this.sourceComponent = null
      this.navigationParams = {}
    },
  },
})
