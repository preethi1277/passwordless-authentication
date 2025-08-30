"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BiometricAuth } from "./biometric-auth"
import { GoogleAuth } from "./google-auth"
import { Dashboard } from "./dashboard"
import { TerminalCard } from "./terminal-card"
import { Smartphone, Monitor, Code2 } from "lucide-react"

export function AuthWrapper() {
  const [isMobile, setIsMobile] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string; encryptionKey?: string } | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("authenticated_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }

    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      const isSmallScreen = window.innerWidth <= 768
      const hasTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0

      setIsMobile(isMobileDevice && hasTouchScreen && isSmallScreen)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleAuthSuccess = (userData: { id: string; email: string; encryptionKey?: string }) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem("authenticated_user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("authenticated_user")
  }

  if (isAuthenticated && user) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg mb-4 shadow-2xl"
            style={{ boxShadow: "0 10px 30px rgba(255, 0, 0, 0.3)" }}
          >
            <Code2 className="w-8 h-8 text-red-500" />
          </motion.div>

          <motion.h1
            className="text-3xl font-bold text-white mb-2 font-mono"
            animate={{
              textShadow: [
                "0 0 10px rgba(255, 0, 0, 0.5)",
                "0 0 20px rgba(255, 0, 0, 0.3)",
                "0 0 10px rgba(255, 0, 0, 0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <span className="text-red-500">$</span> linklet --secure
          </motion.h1>

          <p className="text-gray-300 font-mono text-sm">{`// Cybernetic authentication system`}</p>
        </motion.div>

        {/* Auth Card */}
        <TerminalCard
          title={isMobile ? "mobile-auth.ts" : "desktop-auth.ts"}
          delay={0.2}
          className="backdrop-blur-sm bg-black/40"
        >
          <div className="p-6">
            {/* Device Type Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 mb-6 p-3 bg-red-500/10 backdrop-blur-sm rounded border border-red-500/20"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 backdrop-blur-sm rounded border border-red-500/30">
                {isMobile ? (
                  <Smartphone className="w-5 h-5 text-red-500" />
                ) : (
                  <Monitor className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-white font-mono text-sm font-medium">
                  {isMobile ? "Mobile Device" : "Desktop Environment"}
                </p>
                <p className="text-gray-300 font-mono text-xs">
                  {isMobile ? "Biometric authentication enabled" : "Google OAuth with human verification"}
                </p>
              </div>
            </motion.div>

            {/* Auth Component */}
            <AnimatePresence mode="wait">
              {isMobile ? (
                <motion.div
                  key="biometric"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BiometricAuth onAuthSuccess={handleAuthSuccess} />
                </motion.div>
              ) : (
                <motion.div
                  key="google"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GoogleAuth onAuthSuccess={handleAuthSuccess} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TerminalCard>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-gray-300 font-mono text-xs flex items-center justify-center gap-2 backdrop-blur-sm bg-black/20 rounded-lg p-2 border border-red-500/20">
            <Code2 className="w-4 h-4" />
            Powered by WebAuthn & Firebase Auth
          </p>
        </motion.div>
      </div>
    </div>
  )
}
