// Magnetic section snapping utility for frictionless navigation

interface SectionConfig {
  threshold?: number // Threshold for snapping - default 0.3
  smoothness?: number // Smoothness factor for scrolling - default 0.1
  sectionClass?: string // CSS class for section elements - default 'snap-section'
}

export default class MagneticSectionSnap {
  private container: HTMLElement
  private sections: HTMLElement[] = []
  private currentSection: number = 0
  private scrolling: boolean = false
  private previousScrollY: number = 0
  private scrollTimeout: number | null = null
  private config: Required<SectionConfig>
  private scrollHandler: (e: Event) => void
  private resizeHandler: () => void
  private wheelHandler: (e: WheelEvent) => void
  private touchStartY: number = 0
  private touchMoveHandler: (e: TouchEvent) => void
  private touchStartHandler: (e: TouchEvent) => void
  private touchEndHandler: (e: TouchEvent) => void

  constructor(container: HTMLElement, config: SectionConfig = {}) {
    this.container = container
    this.config = {
      threshold: config.threshold ?? 0.3,
      smoothness: config.smoothness ?? 0.1,
      sectionClass: config.sectionClass ?? 'snap-section',
    }

    // Bind handlers to preserve context
    this.scrollHandler = this.handleScroll.bind(this)
    this.resizeHandler = this.refreshSections.bind(this)
    this.wheelHandler = this.handleWheel.bind(this)
    this.touchMoveHandler = this.handleTouchMove.bind(this)
    this.touchStartHandler = this.handleTouchStart.bind(this)
    this.touchEndHandler = this.handleTouchEnd.bind(this)
  }

  public initialize(): void {
    // Find all section elements
    this.refreshSections()

    // Add event listeners
    window.addEventListener('scroll', this.scrollHandler, { passive: true })
    window.addEventListener('resize', this.resizeHandler)
    window.addEventListener('wheel', this.wheelHandler, { passive: false })

    // Touch events for mobile
    window.addEventListener('touchstart', this.touchStartHandler, { passive: true })
    window.addEventListener('touchmove', this.touchMoveHandler, { passive: false })
    window.addEventListener('touchend', this.touchEndHandler, { passive: true })

    // Set initial section based on scroll position
    this.updateCurrentSection()
  }

  public refreshSections(): void {
    // Get all sections
    this.sections = Array.from(
      this.container.querySelectorAll(`.${this.config.sectionClass}`),
    ) as HTMLElement[]

    // Update current section
    this.updateCurrentSection()
  }

  private updateCurrentSection(): void {
    const scrollY = window.scrollY
    const windowHeight = window.innerHeight

    // Find which section is most in view
    let maxVisibility = 0
    let maxVisibilityIndex = 0

    this.sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect()
      const sectionTop = rect.top
      const sectionHeight = rect.height

      // Calculate how much of the section is visible
      const visibleTop = Math.max(0, sectionTop)
      const visibleBottom = Math.min(windowHeight, sectionTop + sectionHeight)
      const visibleHeight = Math.max(0, visibleBottom - visibleTop)

      // Calculate visibility as a percentage of section height
      const visibility = visibleHeight / sectionHeight

      if (visibility > maxVisibility) {
        maxVisibility = visibility
        maxVisibilityIndex = index
      }
    })

    this.currentSection = maxVisibilityIndex
  }

  private handleScroll(e: Event): void {
    // Update previous scroll position
    this.previousScrollY = window.scrollY

    // Clear existing timeout
    if (this.scrollTimeout !== null) {
      window.clearTimeout(this.scrollTimeout)
    }

    // Set a timeout to check if scrolling has stopped
    this.scrollTimeout = window.setTimeout(() => {
      this.scrolling = false
      this.snapToNearestSection()
    }, 100)
  }

  private handleWheel(e: WheelEvent): void {
    // If already scrolling, don't interfere
    if (this.scrolling) return

    // Determine direction
    const direction = e.deltaY > 0 ? 1 : -1

    // Check if we should switch sections
    const section = this.sections[this.currentSection]
    
    if (!section) {
      console.warn(`Section at index ${this.currentSection} is undefined. Total sections: ${this.sections.length}`);
      return; // Exit early if section is undefined
    }
    
    const rect = section.getBoundingClientRect()
    const threshold = rect.height * this.config.threshold

    // If near the edge of the section, switch to the next one
    if (
      (direction > 0 && rect.bottom - threshold <= window.innerHeight) ||
      (direction < 0 && rect.top + threshold >= 0)
    ) {
      e.preventDefault()

      const targetIndex = Math.max(
        0,
        Math.min(this.sections.length - 1, this.currentSection + direction),
      )
      if (targetIndex !== this.currentSection) {
        this.scrollTo(targetIndex)
      }
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      this.touchStartY = e.touches[0].clientY
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    // If already scrolling, don't interfere
    if (this.scrolling || e.touches.length !== 1) return

    const touchY = e.touches[0].clientY
    const direction = this.touchStartY > touchY ? 1 : -1

    // Check if we should switch sections
    const section = this.sections[this.currentSection]
    const rect = section.getBoundingClientRect()
    const threshold = rect.height * this.config.threshold

    // If near the edge of the section, switch to the next one
    if (
      (direction > 0 && rect.bottom - threshold <= window.innerHeight) ||
      (direction < 0 && rect.top + threshold >= 0)
    ) {
      const diff = Math.abs(this.touchStartY - touchY)

      // Only trigger if the movement is significant enough
      if (diff > 30) {
        e.preventDefault()

        const targetIndex = Math.max(
          0,
          Math.min(this.sections.length - 1, this.currentSection + direction),
        )
        if (targetIndex !== this.currentSection) {
          this.scrollTo(targetIndex)
          this.touchStartY = touchY // Reset to prevent multiple triggers
        }
      }
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    this.snapToNearestSection()
  }

  private snapToNearestSection(): void {
    // Find nearest section based on current scroll position
    const scrollY = window.scrollY
    const windowHeight = window.innerHeight

    let nearestIndex = 0
    let minDistance = Infinity

    this.sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect()
      const sectionMiddle = rect.top + rect.height / 2
      const distanceToMiddle = Math.abs(sectionMiddle - windowHeight / 2)

      if (distanceToMiddle < minDistance) {
        minDistance = distanceToMiddle
        nearestIndex = index
      }
    })

    // Snap to nearest section if it's not current section
    if (nearestIndex !== this.currentSection) {
      this.scrollTo(nearestIndex)
    }
  }

  private scrollTo(index: number): void {
    if (index < 0 || index >= this.sections.length) return

    this.scrolling = true
    this.currentSection = index

    const section = this.sections[index]
    const sectionTop = section.offsetTop

    // Use smooth scrolling for a better user experience
    window.scrollTo({
      top: sectionTop,
      behavior: 'smooth',
    })
  }

  public destroy(): void {
    // Remove event listeners
    window.removeEventListener('scroll', this.scrollHandler)
    window.removeEventListener('resize', this.resizeHandler)
    window.removeEventListener('wheel', this.wheelHandler)
    window.removeEventListener('touchstart', this.touchStartHandler)
    window.removeEventListener('touchmove', this.touchMoveHandler)
    window.removeEventListener('touchend', this.touchEndHandler)

    // Clear timeout if any
    if (this.scrollTimeout !== null) {
      window.clearTimeout(this.scrollTimeout)
    }
  }
}
