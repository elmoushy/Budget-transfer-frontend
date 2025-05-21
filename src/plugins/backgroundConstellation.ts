// Three.js Background Constellation Effect
// This adds a subtle particle constellation effect to the application background

import * as THREE from 'three'

export default class BackgroundConstellation {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private particles: THREE.Points
  private connections: THREE.LineSegments | null = null
  private animationFrameId: number | null = null
  private container: HTMLElement
  private isDarkMode: boolean
  private rafBound: () => void
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 }
  private particlesData: { velocity: THREE.Vector3; connections: number[] }[] = []

  constructor(container: HTMLElement, isDarkMode: boolean = false) {
    this.container = container
    this.isDarkMode = isDarkMode

    // Set up scene
    this.scene = new THREE.Scene()

    // Set up camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000,
    )
    this.camera.position.z = 350

    // Set up renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1)
    this.container.appendChild(this.renderer.domElement)

    // Add mouse movement tracking for interactivity
    window.addEventListener('mousemove', this.handleMouseMove.bind(this))
    window.addEventListener('touchmove', this.handleTouchMove.bind(this))

    // Create particles
    const particlesCount = window.innerWidth < 768 ? 500 : 1000
    this.particles = this.createParticles(particlesCount)
    this.scene.add(this.particles)

    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this))

    // Bind animate to keep context
    this.rafBound = this.animate.bind(this)
  }

  // Handle mouse movement for interactivity
  handleMouseMove(event: MouseEvent) {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1
  }

  // Handle touch movement for mobile interactivity
  handleTouchMove(event: TouchEvent) {
    if (event.touches.length > 0) {
      // Convert touch position to normalized device coordinates (-1 to +1)
      this.mousePosition.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1
      this.mousePosition.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1
    }
  }

  createParticles(count: number): THREE.Points {
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesData = []
    this.particlesData = []

    // Create particles positions with some randomness
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 800
      const y = (Math.random() - 0.5) * 800
      const z = (Math.random() - 0.5) * 500

      particlesData.push(x, y, z)

      // Store additional particle data for animation
      this.particlesData.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
        ),
        connections: [],
      })
    }

    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesData, 3))

    // Create material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 1.5,
      sizeAttenuation: true,
      color: this.isDarkMode ? 0xffffff : 0x666666,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    })

    // Create connections between nearby particles
    this.createConnections(particlesGeometry)

    return new THREE.Points(particlesGeometry, particlesMaterial)
  }

  createConnections(particlesGeometry: THREE.BufferGeometry): void {
    const positions = particlesGeometry.attributes.position.array
    const lineGeometry = new THREE.BufferGeometry()
    const linePositions: number[] = []
    const lineIndices: number[] = []
    let lineCount = 0

    // Find connections between particles that are close to each other
    for (let i = 0; i < positions.length; i += 3) {
      const x1 = positions[i]
      const y1 = positions[i + 1]
      const z1 = positions[i + 2]

      for (let j = i + 3; j < positions.length; j += 3) {
        const x2 = positions[j]
        const y2 = positions[j + 1]
        const z2 = positions[j + 2]

        // Calculate distance between particles
        const distance = Math.sqrt(
          Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2),
        )

        // If particles are close enough, create a connection
        if (distance < 150) {
          linePositions.push(x1, y1, z1, x2, y2, z2)
          lineIndices.push(lineCount * 2, lineCount * 2 + 1)
          lineCount++

          // Store connection data for each particle
          const particleIndex1 = i / 3
          const particleIndex2 = j / 3

          this.particlesData[particleIndex1].connections.push(particleIndex2)
          this.particlesData[particleIndex2].connections.push(particleIndex1)
        }
      }
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
    lineGeometry.setIndex(new THREE.Uint16BufferAttribute(lineIndices, 1))

    const lineMaterial = new THREE.LineBasicMaterial({
      color: this.isDarkMode ? 0x444444 : 0xcccccc,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    })

    this.connections = new THREE.LineSegments(lineGeometry, lineMaterial)
    this.scene.add(this.connections)
  }

  // Handle window resize
  handleResize() {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }

  // Animation loop
  animate() {
    this.animationFrameId = requestAnimationFrame(this.rafBound)

    if (this.particles) {
      // Slow rotation of entire particle system
      this.particles.rotation.x += 0.0001
      this.particles.rotation.y += 0.0002

      // Move particles based on their velocity + update connections
      const positions = this.particles.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < this.particlesData.length; i++) {
        const ix = i * 3
        const iy = i * 3 + 1
        const iz = i * 3 + 2

        // Apply subtle movement based on velocity
        positions[ix] += this.particlesData[i].velocity.x
        positions[iy] += this.particlesData[i].velocity.y
        positions[iz] += this.particlesData[i].velocity.z

        // Create boundaries to keep particles in view
        if (positions[ix] < -400 || positions[ix] > 400) this.particlesData[i].velocity.x *= -1
        if (positions[iy] < -400 || positions[iy] > 400) this.particlesData[i].velocity.y *= -1
        if (positions[iz] < -250 || positions[iz] > 250) this.particlesData[i].velocity.z *= -1
      }

      // Update particle positions
      this.particles.geometry.attributes.position.needsUpdate = true

      // Update connections if they exist
      if (this.connections) {
        // Rotate connections to match particles
        this.connections.rotation.x = this.particles.rotation.x
        this.connections.rotation.y = this.particles.rotation.y

        // Update connection positions based on particle movement
        const connectionPositions = this.connections.geometry.attributes.position
          .array as Float32Array
        let connectionIndex = 0

        for (let i = 0; i < this.particlesData.length; i++) {
          const ix = i * 3
          const iy = i * 3 + 1
          const iz = i * 3 + 2

          const connections = this.particlesData[i].connections

          for (let j = 0; j < connections.length; j++) {
            if (i < connections[j]) {
              // Only update each connection once
              const jx = connections[j] * 3
              const jy = connections[j] * 3 + 1
              const jz = connections[j] * 3 + 2

              // Update first point of the line
              connectionPositions[connectionIndex++] = positions[ix]
              connectionPositions[connectionIndex++] = positions[iy]
              connectionPositions[connectionIndex++] = positions[iz]

              // Update second point of the line
              connectionPositions[connectionIndex++] = positions[jx]
              connectionPositions[connectionIndex++] = positions[jy]
              connectionPositions[connectionIndex++] = positions[jz]
            }
          }
        }

        // Mark connection geometry for update
        this.connections.geometry.attributes.position.needsUpdate = true
      }
    }

    this.renderer.render(this.scene, this.camera)
  }

  // Start animation
  start() {
    if (!this.animationFrameId) {
      this.animate()
    }
  }

  // Stop animation
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  // Update mode (light/dark)
  updateMode(isDarkMode: boolean) {
    this.isDarkMode = isDarkMode

    if (this.particles) {
      const material = this.particles.material as THREE.PointsMaterial
      material.color.set(isDarkMode ? 0xffffff : 0x666666)
    }
  }

  // Clean up
  dispose() {
    this.stop()
    window.removeEventListener('resize', this.handleResize.bind(this))

    if (this.particles) {
      this.scene.remove(this.particles)
      this.particles.geometry.dispose()
      ;(this.particles.material as THREE.Material).dispose()
    }

    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement)
      this.renderer.dispose()
    }
  }
}
