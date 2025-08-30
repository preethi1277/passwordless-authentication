"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  directionX: number
  directionY: number
  size: number
  color: string
  baseAlpha: number
  alpha: number
}

interface Mouse {
  x: number | null
  y: number | null
  radius: number
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef<Mouse>({ x: null, y: null, radius: 120 })
  const timeRef = useRef(0)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX
      mouseRef.current.y = event.clientY
    }

    const handleMouseOut = () => {
      mouseRef.current.x = null
      mouseRef.current.y = null
    }

    class ParticleClass implements Particle {
      x: number
      y: number
      directionX: number
      directionY: number
      size: number
      color: string
      baseAlpha: number
      alpha: number

      constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
        this.x = x
        this.y = y
        this.directionX = directionX
        this.directionY = directionY
        this.size = size
        this.color = color
        this.baseAlpha = 0.1 + Math.random() * 0.15
        this.alpha = this.baseAlpha
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
        ctx.fillStyle = `rgba(255, 0, 0, ${this.alpha})`
        ctx.fill()
      }

      update() {
        if (!canvas) return

        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX
        }
        if (this.y > canvas.height || this.y < 0) {
          this.directionY = -this.directionY
        }

        // Subtle pulsing effect
        this.alpha = this.baseAlpha + Math.sin(timeRef.current * 0.02 + this.x * 0.005) * this.baseAlpha * 0.5

        // Mouse interaction
        const mouse = mouseRef.current
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < mouse.radius) {
            this.alpha = Math.min(0.8, this.alpha + (1 - distance / mouse.radius) * 0.6)
          }
        }

        this.x += this.directionX
        this.y += this.directionY
        this.draw()
      }
    }

    const initParticles = () => {
      particlesRef.current = []
      const numberOfParticles = Math.min(80, (canvas.height * canvas.width) / 15000)
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 1.5 + 0.5
        const x = Math.random() * (canvas.width - size * 2 - size * 2) + size * 2
        const y = Math.random() * (canvas.height - size * 2 - size * 2) + size * 2
        const directionX = Math.random() * 0.3 - 0.15
        const directionY = Math.random() * 0.3 - 0.15
        const color = "#ff0000"
        particlesRef.current.push(new ParticleClass(x, y, directionX, directionY, size, color))
      }
    }

    const connect = () => {
      if (!ctx || !canvas) return
      for (let a = 0; a < particlesRef.current.length; a++) {
        for (let b = a; b < particlesRef.current.length; b++) {
          const particleA = particlesRef.current[a]
          const particleB = particlesRef.current[b]
          const distance =
            (particleA.x - particleB.x) * (particleA.x - particleB.x) +
            (particleA.y - particleB.y) * (particleB.y - particleB.y)

          if (distance < (canvas.width / 8) * (canvas.height / 8)) {
            const combinedAlpha = particleA.alpha * particleB.alpha
            const opacityValue = Math.min(0.3, combinedAlpha) * (1 - distance / 25000)
            if (opacityValue > 0) {
              ctx.strokeStyle = `rgba(255, 0, 0, ${opacityValue})`
              ctx.lineWidth = 0.8
              ctx.beginPath()
              ctx.moveTo(particleA.x, particleA.y)
              ctx.lineTo(particleB.x, particleB.y)
              ctx.stroke()
            }
          }
        }
      }
    }

    const animate = () => {
      if (!ctx || !canvas) return
      animationRef.current = requestAnimationFrame(animate)

      // Pure black background
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      timeRef.current++

      for (let i = 0; i < particlesRef.current.length; i++) {
        particlesRef.current[i].update()
      }
      connect()
    }

    resizeCanvas()
    animate()

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseout", handleMouseOut)
    window.addEventListener("resize", resizeCanvas)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseout", handleMouseOut)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}
