"use client"

import { useState, useEffect } from "react"

interface TypingEffectProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  cursorClassName?: string
}

export function TypingEffect({ text, speed = 100, delay = 0, className, cursorClassName }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, speed)

      return () => clearInterval(typingInterval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, speed, delay])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <span className={className}>
      {displayedText}
      <span
        className={`inline-block w-2 h-6 bg-blue-400 ml-1 align-middle ${cursorClassName} ${
          showCursor ? "opacity-100" : "opacity-0"
        }`}
        style={{ transition: "opacity 0.5s ease-in-out" }}
      />
    </span>
  )
}
