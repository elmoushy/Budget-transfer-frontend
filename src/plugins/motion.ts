import type { App, DirectiveBinding } from 'vue'

// Track if plugin has been installed
let installed = false

export default {
  install(app: App) {
    // Check if already installed to prevent duplicate registration
    if (installed) {
      return
    }

    installed = true

    app.directive('my-motion', {
      mounted(el: HTMLElement, _binding: DirectiveBinding) {
        // Fallback in case the main plugin directive doesn't work
        el.classList.add('motion-ready')
      },
    })
  },
}
