import type { App, DirectiveBinding } from 'vue'

// Define interface to extend HTMLElement with the _motionObserver property
interface CustomHTMLElement extends HTMLElement {
  _motionObserver?: IntersectionObserver
}

interface MotionOptions {
  type?: 'fade' | 'slide' | 'scale' | 'rotate' | 'blur' | 'glide'
  duration?: number
  delay?: number
  easing?: string
  once?: boolean
  threshold?: number
}

// Track if plugin has been installed
let installed = false

// Default options
const defaultOptions: MotionOptions = {
  type: 'fade',
  duration: 800,
  delay: 0,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth, exponential curve
  once: true,
  threshold: 0.1,
}

export default {
  install(app: App) {
    // Check if already installed to prevent duplicate registration
    if (installed) {
      return
    }

    installed = true

    // Initialize IntersectionObserver for entry animations if supported
    const supportsIntersectionObserver = 'IntersectionObserver' in window

    app.directive('motion', {
      mounted(el: CustomHTMLElement, binding: DirectiveBinding<MotionOptions>) {
        // Get options from directive binding or use defaults
        const options = { ...defaultOptions, ...binding.value }

        // Apply initial state
        el.style.opacity = '0'
        el.style.transition = `opacity ${options.duration}ms ${options.easing} ${options.delay}ms,
                              transform ${options.duration}ms ${options.easing} ${options.delay}ms,
                              filter ${options.duration}ms ${options.easing} ${options.delay}ms`
        el.style.willChange = 'opacity, transform'

        // Apply type-specific initial state
        switch (options.type) {
          case 'slide':
            el.style.transform = 'translateY(20px)'
            break
          case 'scale':
            el.style.transform = 'scale(0.95)'
            break
          case 'rotate':
            el.style.transform = 'rotate(-5deg) scale(0.95)'
            break
          case 'blur':
            el.style.filter = 'blur(10px)'
            break
          case 'glide':
            el.style.transform = 'translateX(-20px) translateY(10px)'
            break
          default: // 'fade' is default
            break
        }

        if (!supportsIntersectionObserver) {
          // Fallback for browsers without IntersectionObserver
          setTimeout(() => {
            el.style.opacity = '1'
            el.style.transform = 'none'
            el.style.filter = 'none'
          }, 100)
          return
        }

        // Create IntersectionObserver for smooth entry
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setTimeout(() => {
                  el.style.opacity = '1'
                  el.style.transform = 'none'
                  el.style.filter = 'none'
                }, options.delay)

                if (options.once) {
                  observer.unobserve(el)
                }
              } else if (!options.once) {
                el.style.opacity = '0'

                // Reset type-specific state when out of view
                switch (options.type) {
                  case 'slide':
                    el.style.transform = 'translateY(20px)'
                    break
                  case 'scale':
                    el.style.transform = 'scale(0.95)'
                    break
                  case 'rotate':
                    el.style.transform = 'rotate(-5deg) scale(0.95)'
                    break
                  case 'blur':
                    el.style.filter = 'blur(10px)'
                    break
                  case 'glide':
                    el.style.transform = 'translateX(-20px) translateY(10px)'
                    break
                  default: // 'fade' is default
                    break
                }
              }
            })
          },
          {
            threshold: options.threshold,
            rootMargin: '0px',
          },
        )

        observer.observe(el)

        // Store observer reference for cleanup
        el._motionObserver = observer
      },

      beforeUnmount(el: CustomHTMLElement) {
        // Clean up observer
        if (el._motionObserver) {
          el._motionObserver.disconnect()
        }
      },
    })

    // Also keep the old directive for backward compatibility
    app.directive('my-motion', {
      mounted(el: HTMLElement, _binding: DirectiveBinding) {
        el.classList.add('motion-ready')
      },
    })
  },
}
