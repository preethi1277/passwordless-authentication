"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { forwardRef } from "react"
import { Loader2 } from "lucide-react"

interface CodeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "google"
  loading?: boolean
  children: React.ReactNode
}

export const CodeButton = forwardRef<HTMLButtonElement, CodeButtonProps>(
  ({ variant = "primary", loading, children, className = "", ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "primary":
          return "linklet-button"
        case "secondary":
          return "linklet-button-secondary"
        case "danger":
          return "bg-red-600 hover:bg-red-700 text-white"
        case "google":
          return "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
        default:
          return "linklet-button"
      }
    }

    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
        <Button
          ref={ref}
          className={`h-11 font-mono font-semibold transition-all duration-300 ${getVariantClasses()} ${className}`}
          disabled={loading}
          {...props}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {children}
        </Button>
      </motion.div>
    )
  },
)

CodeButton.displayName = "CodeButton"
