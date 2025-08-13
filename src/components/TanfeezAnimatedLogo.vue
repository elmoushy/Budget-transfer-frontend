<template>
  <div class="tanfeez-logo-container" :class="{ animate: shouldAnimate }">
    <!-- Neon mist background -->
    <div class="neon-mist"></div>

    <!-- Logo letters with individual animations -->
    <div class="logo-wrapper">
      <div class="letter-container">
        <span class="letter letter-t" data-letter="T">T</span>
        <span class="letter letter-a" data-letter="A">A</span>
        <span class="letter letter-n" data-letter="N">N</span>
        <span class="letter letter-f" data-letter="F">F</span>
        <span class="letter letter-e" data-letter="E">E</span>
        <span class="letter letter-e2" data-letter="E">E</span>
        <span class="letter letter-z" data-letter="Z">Z</span>
      </div>

      <!-- Light trails for each letter -->
      <div class="light-trails">
        <div class="trail trail-t"></div>
        <div class="trail trail-a"></div>
        <div class="trail trail-n"></div>
        <div class="trail trail-f"></div>
        <div class="trail trail-e"></div>
        <div class="trail trail-e2"></div>
        <div class="trail trail-z"></div>
      </div>

      <!-- Pulsing outline -->
      <div class="pulse-outline"></div>

      <!-- Dynamic swoosh -->
      <div class="dynamic-swoosh"></div>

      <!-- Particle shimmer -->
      <div class="particle-shimmer">
        <div class="particle" v-for="n in 20" :key="n" :style="getParticleStyle(n)"></div>
      </div>

      <!-- Modern glass morphism backdrop -->
      <div class="glass-backdrop"></div>

      <!-- Floating orbs for extra visual appeal -->
      <div class="floating-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="orb orb-4"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TanfeezAnimatedLogo',
  props: {
    autoPlay: {
      type: Boolean,
      default: true,
    },
    loop: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      shouldAnimate: false,
      animationInterval: null as NodeJS.Timeout | null,
    }
  },
  mounted() {
    if (this.autoPlay) {
      this.startAnimation()
    }
  },
  beforeUnmount() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval)
    }
  },
  methods: {
    startAnimation() {
      this.shouldAnimate = true

      if (this.loop) {
        // Reset and loop every 4.5 seconds (4s animation + 0.5s pause)
        this.animationInterval = setInterval(() => {
          this.shouldAnimate = false
          setTimeout(() => {
            this.shouldAnimate = true
          }, 100)
        }, 4500)
      }
    },
    stopAnimation() {
      this.shouldAnimate = false
      if (this.animationInterval) {
        clearInterval(this.animationInterval)
        this.animationInterval = null
      }
    },
    getParticleStyle(index: number) {
      const angle = (index * 360) / 20
      const radius = 150 + Math.random() * 50
      const x = Math.cos((angle * Math.PI) / 180) * radius
      const y = Math.sin((angle * Math.PI) / 180) * radius

      return {
        '--particle-x': `${x}px`,
        '--particle-y': `${y}px`,
        '--particle-delay': `${index * 0.1}s`,
        '--particle-duration': `${2 + Math.random() * 2}s`,
      }
    },
  },
}
</script>

<style scoped>
.tanfeez-logo-container {
  position: relative;
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at center,
    rgba(15, 23, 42, 0.2),
    rgba(30, 41, 59, 0.1),
    transparent
  );
  overflow: hidden;
  perspective: 1200px;
}

/* Modern aurora background */
.neon-mist {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    rgba(139, 92, 246, 0.15) 0%,
    rgba(59, 130, 246, 0.12) 25%,
    rgba(34, 197, 94, 0.1) 50%,
    rgba(244, 63, 94, 0.08) 75%,
    transparent 100%
  );
  opacity: 0;
  filter: blur(25px);
  animation: none;
}

.animate .neon-mist {
  animation: mistReveal 4s ease-out forwards;
}

.logo-wrapper {
  position: relative;
  z-index: 10;
  transform-style: preserve-3d;
}

.letter-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.15em;
  font-family:
    'Inter',
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-weight: 800;
  font-size: 4.5rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  position: relative;
}

.letter {
  display: inline-block;
  opacity: 0;
  transform: translateZ(-60px) rotateX(20deg);
  background: linear-gradient(
    135deg,
    #f8fafc 0%,
    #e2e8f0 20%,
    #cbd5e1 40%,
    #94a3b8 60%,
    #64748b 80%,
    #475569 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow:
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.3),
    0 16px 32px rgba(0, 0, 0, 0.2);
  filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.4))
    drop-shadow(0 0 30px rgba(59, 130, 246, 0.2));
  position: relative;
  animation: none;
  transition: all 0.3s ease;
}

.letter:hover {
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))
    drop-shadow(0 0 40px rgba(59, 130, 246, 0.3));
  transform: translateY(-2px) scale(1.05);
}

/* Individual letter animations */
.animate .letter-t {
  animation: letterReveal 0.8s ease-out 0.2s forwards;
}
.animate .letter-a {
  animation: letterReveal 0.8s ease-out 0.4s forwards;
}
.animate .letter-n {
  animation: letterReveal 0.8s ease-out 0.6s forwards;
}
.animate .letter-f {
  animation: letterReveal 0.8s ease-out 0.8s forwards;
}
.animate .letter-e {
  animation: letterReveal 0.8s ease-out 1s forwards;
}
.animate .letter-e2 {
  animation: letterReveal 0.8s ease-out 1.2s forwards;
}
.animate .letter-z {
  animation: letterReveal 0.8s ease-out 1.4s forwards;
}

/* Light trails */
.light-trails {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.trail {
  position: absolute;
  width: 4px;
  height: 70px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(139, 92, 246, 0.9) 15%,
    rgba(59, 130, 246, 1) 40%,
    rgba(34, 197, 94, 0.8) 65%,
    rgba(244, 63, 94, 0.6) 85%,
    transparent 100%
  );
  border-radius: 50%;
  opacity: 0;
  filter: blur(0.5px);
  box-shadow:
    0 0 15px rgba(139, 92, 246, 0.7),
    0 0 30px rgba(59, 130, 246, 0.5),
    0 0 45px rgba(34, 197, 94, 0.3);
  animation: none;
}

.animate .trail-t {
  animation: lightTrail 0.6s ease-out 0.1s forwards;
  left: 8%;
}
.animate .trail-a {
  animation: lightTrail 0.6s ease-out 0.3s forwards;
  left: 22%;
}
.animate .trail-n {
  animation: lightTrail 0.6s ease-out 0.5s forwards;
  left: 36%;
}
.animate .trail-f {
  animation: lightTrail 0.6s ease-out 0.7s forwards;
  left: 50%;
}
.animate .trail-e {
  animation: lightTrail 0.6s ease-out 0.9s forwards;
  left: 64%;
}
.animate .trail-e2 {
  animation: lightTrail 0.6s ease-out 1.1s forwards;
  left: 78%;
}
.animate .trail-z {
  animation: lightTrail 0.6s ease-out 1.3s forwards;
  left: 92%;
}

/* Modern pulsing outline */
.pulse-outline {
  position: absolute;
  top: -15px;
  left: -25px;
  right: -25px;
  bottom: -15px;
  border: 2px solid transparent;
  border-radius: 20px;
  opacity: 0;
  animation: none;
  background: linear-gradient(
    45deg,
    rgba(139, 92, 246, 0.3),
    rgba(59, 130, 246, 0.3),
    rgba(34, 197, 94, 0.3),
    rgba(244, 63, 94, 0.3)
  );
  background-size: 400% 400%;
}

.animate .pulse-outline {
  animation: pulseOutline 1s ease-out 2.2s forwards;
}

/* Dynamic rainbow swoosh */
.dynamic-swoosh {
  position: absolute;
  top: 50%;
  left: -120px;
  width: 250px;
  height: 6px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(139, 92, 246, 0.8) 15%,
    rgba(59, 130, 246, 0.9) 35%,
    rgba(34, 197, 94, 1) 50%,
    rgba(244, 63, 94, 0.9) 65%,
    rgba(251, 146, 60, 0.8) 85%,
    transparent 100%
  );
  border-radius: 50%;
  transform: translateY(-50%) rotate(-3deg);
  opacity: 0;
  filter: blur(0.5px);
  box-shadow: 0 0 25px rgba(139, 92, 246, 0.5);
  animation: none;
}

.animate .dynamic-swoosh {
  animation: swooshEffect 1.2s ease-out 3s forwards;
}

/* Particle shimmer */
.particle-shimmer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.9) 0%,
    rgba(59, 130, 246, 0.7) 40%,
    rgba(34, 197, 94, 0.5) 70%,
    transparent 100%
  );
  border-radius: 50%;
  opacity: 0;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: none;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
}

.animate .particle {
  animation: particleFloat var(--particle-duration) ease-out var(--particle-delay) forwards;
}

/* Modern glass morphism backdrop */
.glass-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px) saturate(150%);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.1);
  opacity: 0;
  animation: none;
}

.animate .glass-backdrop {
  animation: backdropFadeIn 1s ease-out 2s forwards;
}

/* Floating orbs */
.floating-orbs {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 40%,
    transparent 100%
  );
  animation: orbFloat 6s ease-in-out infinite;
}

.orb-1 {
  width: 60px;
  height: 60px;
  top: 10%;
  left: 20%;
  animation-delay: 0s;
}

.orb-2 {
  width: 80px;
  height: 80px;
  top: 30%;
  left: 70%;
  animation-delay: 1.2s;
}

.orb-3 {
  width: 100px;
  height: 100px;
  top: 60%;
  left: 10%;
  animation-delay: 2.4s;
}

.orb-4 {
  width: 40px;
  height: 40px;
  top: 80%;
  left: 50%;
  animation-delay: 3.6s;
}

/* Keyframe animations */
@keyframes mistReveal {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(0deg);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    opacity: 0.7;
    transform: scale(1) rotate(360deg);
  }
}

@keyframes letterReveal {
  0% {
    opacity: 0;
    transform: translateZ(-60px) rotateX(20deg) translateY(30px) rotateY(-15deg);
  }
  40% {
    opacity: 0.6;
    transform: translateZ(-20px) rotateX(10deg) translateY(15px) rotateY(-5deg);
  }
  70% {
    opacity: 0.9;
    transform: translateZ(5px) rotateX(2deg) translateY(-3px) rotateY(2deg);
  }
  100% {
    opacity: 1;
    transform: translateZ(0px) rotateX(0deg) translateY(0px) rotateY(0deg);
  }
}

@keyframes lightTrail {
  0% {
    opacity: 0;
    transform: translateY(100px) scaleY(0);
  }
  20% {
    opacity: 0.8;
    transform: translateY(50px) scaleY(0.5);
  }
  50% {
    opacity: 1;
    transform: translateY(0px) scaleY(1);
  }
  80% {
    opacity: 0.6;
    transform: translateY(-20px) scaleY(0.8);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) scaleY(0.3);
  }
}

@keyframes pulseOutline {
  0% {
    opacity: 0;
    border-color: transparent;
    transform: scale(0.9);
    background-position: 0% 50%;
  }
  25% {
    opacity: 0.8;
    border-color: rgba(139, 92, 246, 0.6);
    transform: scale(1.08);
    background-position: 50% 50%;
    box-shadow:
      0 0 30px rgba(139, 92, 246, 0.4),
      inset 0 0 30px rgba(59, 130, 246, 0.2);
  }
  50% {
    opacity: 1;
    border-color: rgba(59, 130, 246, 0.8);
    transform: scale(1.05);
    background-position: 100% 50%;
  }
  75% {
    opacity: 0.6;
    border-color: rgba(34, 197, 94, 0.6);
    transform: scale(1.02);
    background-position: 150% 50%;
  }
  100% {
    opacity: 0;
    border-color: transparent;
    transform: scale(1);
    background-position: 200% 50%;
  }
}

@keyframes swooshEffect {
  0% {
    opacity: 0;
    left: -120px;
    transform: translateY(-50%) rotate(-3deg) scaleX(0.3);
    filter: hue-rotate(0deg);
  }
  25% {
    opacity: 0.9;
    left: 25%;
    transform: translateY(-50%) rotate(-1deg) scaleX(1);
    filter: hue-rotate(90deg);
  }
  50% {
    opacity: 1;
    left: 50%;
    transform: translateY(-50%) rotate(0deg) scaleX(1.3);
    filter: hue-rotate(180deg);
  }
  75% {
    opacity: 0.7;
    left: 75%;
    transform: translateY(-50%) rotate(1deg) scaleX(1.1);
    filter: hue-rotate(270deg);
  }
  100% {
    opacity: 0;
    left: calc(100% + 120px);
    transform: translateY(-50%) rotate(3deg) scaleX(0.3);
    filter: hue-rotate(360deg);
  }
}

@keyframes particleFloat {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) translate(0, 0) scale(0);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) translate(var(--particle-x), var(--particle-y)) scale(1);
  }
  80% {
    opacity: 0.8;
    transform: translate(-50%, -50%) translate(var(--particle-x), var(--particle-y)) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translate(var(--particle-x), var(--particle-y)) scale(0);
  }
}

@keyframes orbFloat {
  0% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Parallax camera effect */
.animate .logo-wrapper {
  animation: parallaxPan 4s ease-out forwards;
}

@keyframes parallaxPan {
  0% {
    transform: translateZ(-100px) scale(1.1);
  }
  100% {
    transform: translateZ(0px) scale(1);
  }
}

/* Enhanced 3D depth and lighting */
.animate .letter-container {
  animation: logoSettle 4s ease-out forwards;
}

@keyframes logoSettle {
  0% {
    filter: brightness(0.7) contrast(1.2);
  }
  70% {
    filter: brightness(1.1) contrast(1.1);
  }
  100% {
    filter: brightness(1) contrast(1);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .letter-container {
    font-size: 3rem;
  }

  .tanfeez-logo-container {
    height: 140px;
  }

  .trail {
    height: 50px;
    width: 3px;
  }
}

@media (max-width: 480px) {
  .letter-container {
    font-size: 2.2rem;
  }

  .tanfeez-logo-container {
    height: 100px;
  }

  .trail {
    height: 35px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .letter {
    background: linear-gradient(135deg, #ffffff, #f1f5f9, #e2e8f0);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .trail {
    background: linear-gradient(180deg, transparent, #6366f1, #3b82f6, #10b981, transparent);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate .letter {
    animation: letterRevealSimple 0.6s ease-out forwards;
  }

  .animate .trail,
  .animate .pulse-outline,
  .animate .dynamic-swoosh,
  .animate .particle {
    animation: none;
    opacity: 0.3;
  }

  @keyframes letterRevealSimple {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
