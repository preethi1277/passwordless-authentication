"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { Terminal } from "lucide-react"

interface TerminalCardProps {
  children: ReactNode
  className?: string
  delay?: number
  title?: string
}

export function TerminalCard({ children, className = "", delay = 0, title }: TerminalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`linklet-card group ${className}`}
    >
      {title && (
        <div className="linklet-card-header">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-red-500" />
              <span className="text-sm font-mono text-white">{title}</span>
            </div>
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </motion.div>
  )
}
