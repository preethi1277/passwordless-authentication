"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CodeInput } from "./code-input"
import { CodeButton } from "./code-button"
import { TerminalCard } from "./terminal-card"
import { Fingerprint, Mail, AlertCircle, Key } from "lucide-react"
import { SimpleFirebaseAuth } from "@/lib/firebase-simple-auth"

interface BiometricAuthProps {
  onAuthSuccess: (user: { id: string; email: string; encryptionKey: string }) => void
}

export function BiometricAuth({ onAuthSuccess }: BiometricAuthProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"email" | "biometric">("email")
  const [encryptionKey, setEncryptionKey] = useState("")

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError("")

    try {
      if (!SimpleFirebaseAuth.validateEmail(email)) {
        throw new Error("Invalid email format")
      }

      if (await SimpleFirebaseAuth.isRateLimited(email)) {
        throw new Error("Rate limited. Try again later.")
      }

      await new Promise((resolve) => setTimeout(resolve, 800))
      setStep("biometric")
    } catch (error: any) {
      setError(error.message)
    }

    setIsLoading(false)
  }

  const handleBiometricAuth = async () => {
    setIsLoading(true)
    setError("")

    try {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      const hasTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0

      if (!isMobileDevice || !hasTouchScreen) {
        throw new Error("Mobile device with fingerprint sensor required")
      }

      if (!window.PublicKeyCredential) {
        throw new Error("WebAuthn not supported")
      }

      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (!available) {
        throw new Error("Biometric authentication unavailable")
      }

      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32),
        rp: {
          name: "LinkLet System",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(email),
          name: email,
          displayName: email,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: "none",
      }

      let credential: any
      let isNewUser = false

      try {
        credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions,
        })
        isNewUser = true
      } catch (createError: any) {
        if (createError.name === "InvalidStateError") {
          const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
            challenge: new Uint8Array(32),
            allowCredentials: [],
            timeout: 60000,
            userVerification: "required",
            rpId: window.location.hostname,
          }

          credential = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions,
          })
          isNewUser = false
        } else {
          throw createError
        }
      }

      if (credential) {
        const credentialId = credential.id
        let result

        if (isNewUser) {
          result = await SimpleFirebaseAuth.registerUser(email, credentialId, deviceInfo)
        } else {
          result = await SimpleFirebaseAuth.validateUser(email, credentialId, deviceInfo)
        }

        if (result.success && result.encryptionKey) {
          setEncryptionKey(result.encryptionKey)

          await new Promise((resolve) => setTimeout(resolve, 1000))

          onAuthSuccess({
            id: email,
            email: email,
            encryptionKey: result.encryptionKey,
          })
        } else {
          throw new Error(result.error || "Authentication failed")
        }
      }
    } catch (error: any) {
      console.error("Biometric authentication failed:", error)

      let errorMessage = "Fingerprint authentication failed"

      if (error.name === "NotAllowedError") {
        errorMessage = "Authentication cancelled by user"
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Biometric authentication not supported"
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
    }

    setIsLoading(false)
  }

  if (step === "email") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="space-y-2">
          <p className="text-red-500 font-mono text-sm">
            <span className="text-red-400">1.</span> Email validation
          </p>
          <p className="text-gray-300 font-mono text-xs ml-4">{`// Enter your email address`}</p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <CodeInput
            label="email"
            icon={<Mail className="w-4 h-4 text-red-500" />}
            type="email"
            placeholder="user@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Alert variant="destructive" className="bg-red-500/20 border-red-500/30 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-mono text-sm">Error: {error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <CodeButton type="submit" loading={isLoading} className="w-full">
            {isLoading ? "Validating..." : "Continue"}
          </CodeButton>
        </form>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="space-y-2">
        <p className="text-red-500 font-mono text-sm">
          <span className="text-red-400">2.</span> Biometric authentication
        </p>
        <p className="text-gray-300 font-mono text-xs ml-4">{`// Use fingerprint sensor to authenticate`}</p>
      </div>

      <TerminalCard className="bg-red-500/10 backdrop-blur-sm">
        <div className="p-4 text-center">
          <motion.div
            animate={{
              scale: isLoading ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isLoading ? Number.POSITIVE_INFINITY : 0,
            }}
            className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-lg mb-4"
          >
            <Fingerprint className={`w-8 h-8 ${isLoading ? "text-yellow-400" : "text-red-500"}`} />
          </motion.div>

          <p className="text-white font-mono text-sm mb-2">
            {isLoading ? "Authenticating..." : "Ready for fingerprint"}
          </p>
          <p className="text-gray-300 font-mono text-xs">Place finger on sensor</p>
        </div>
      </TerminalCard>

      <AnimatePresence>
        {encryptionKey && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-red-500/20 border-red-500/30 text-red-300">
              <Key className="h-4 w-4" />
              <AlertDescription className="font-mono text-sm">
                <strong>Key generated:</strong>
                <br />
                <code className="text-xs bg-red-500/30 px-2 py-1 rounded mt-1 inline-block">
                  {encryptionKey.slice(0, 32)}...
                </code>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Alert variant="destructive" className="bg-red-500/20 border-red-500/30 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-mono text-sm">Error: {error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <CodeButton onClick={handleBiometricAuth} loading={isLoading} className="w-full">
          {isLoading ? "Processing..." : "Authenticate"}
        </CodeButton>

        <CodeButton variant="secondary" onClick={() => setStep("email")} className="w-full" disabled={isLoading}>
          Back
        </CodeButton>
      </div>
    </motion.div>
  )
}
