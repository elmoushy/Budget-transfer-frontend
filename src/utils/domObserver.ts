/**
 * A Vue directive to replace deprecated DOM mutation events with MutationObserver
 * This specifically targets the issue with Quill editor using DOMNodeInserted
 */

import type { Directive } from 'vue'

// Observer callback function type
type ObserverCallback = (mutations: MutationRecord[]) => void

// Observer options with defaults
const defaultOptions: MutationObserverInit = {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
}

/**
 * Creates and attaches a MutationObserver to the target element
 */
const createObserver = (
  el: HTMLElement,
  callback: ObserverCallback,
  options: MutationObserverInit = defaultOptions,
): MutationObserver => {
  const observer = new MutationObserver(callback)
  observer.observe(el, options)
  return observer
}

/**
 * Vue directive to attach a MutationObserver to an element
 */
export const vObserve: Directive = {
  // When the element is mounted to the DOM
  mounted(el, binding) {
    // If we have a value that's a function, use it as callback
    if (typeof binding.value === 'function') {
      const observer = createObserver(el, binding.value, binding.arg as MutationObserverInit)
      // Store the observer instance on the element
      el._observer = observer
    }
  },
  // When the element is unmounted
  unmounted(el) {
    // Disconnect the observer if it exists
    if (el._observer && el._observer instanceof MutationObserver) {
      el._observer.disconnect()
      delete el._observer
    }
  },
}

/**
 * Patch for Quill editor's DOMNodeInserted issue
 * Applies a no-op MutationObserver that simulates the behavior without using deprecated events
 */
export const patchQuillDOMEvents = (quillElement: HTMLElement | null) => {
  if (!quillElement) return

  // Find Quill root element (the editor container)
  const scrollContainer = quillElement.querySelector('.ql-editor')

  if (scrollContainer) {
    // Create observer with same behavior as original DOMNodeInserted listener
    createObserver(scrollContainer, () => {
      // This is intentionally empty as Quill just needs the event to happen
      // The original DOMNodeInserted handler was also empty
    })
  }
}
