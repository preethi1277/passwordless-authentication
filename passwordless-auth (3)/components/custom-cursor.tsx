"use client"

import { useEffect, useRef } from "react"

export function CustomCursor() {
  const cursorRingRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const dotRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const animateCursor = () => {
      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = `${mouseRef.current.x}px`
        cursorRingRef.current.style.top = `${mouseRef.current.y}px`
      }

      dotRef.current.x += (mouseRef.current.x - dotRef.current.x) * 0.2
      dotRef.current.y += (mouseRef.current.y - dotRef.current.y) * 0.2

      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${dotRef.current.x}px`
        cursorDotRef.current.style.top = `${dotRef.current.y}px`
      }

      requestAnimationFrame(animateCursor)
    }

    const handleMouseEnter = () => {
      cursorRingRef.current?.classList.add("hover")
    }

    const handleMouseLeave = () => {
      cursorRingRef.current?.classList.remove("hover")
    }

    document.addEventListener("mousemove", handleMouseMove)
    animateCursor()

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .card, [role="button"]')
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter)
      el.addEventListener("mouseleave", handleMouseLeave)
    })

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter)
        el.removeEventListener("mouseleave", handleMouseLeave)
      })
    }
  }, [])

  return (
    <>
      <div ref={cursorRingRef} className="cursor-ring" />
      <div ref={cursorDotRef} className="cursor-dot" />
    </>
  )
}
