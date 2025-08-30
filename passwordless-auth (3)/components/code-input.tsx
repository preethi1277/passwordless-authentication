"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { forwardRef } from "react"

interface CodeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
}

export const CodeInput = forwardRef<HTMLInputElement, CodeInputProps>(
  ({ label, icon, className = "", ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        {label && (
          <label className="text-sm font-mono text-white flex items-center gap-2">
            {icon}
            <span className="text-red-500">{label}</span>
          </label>
        )}
        <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Input ref={ref} className={`linklet-input h-11 ${className}`} {...props} />
        </motion.div>
      </motion.div>
    )
  },
)

CodeInput.displayName = "CodeInput"
