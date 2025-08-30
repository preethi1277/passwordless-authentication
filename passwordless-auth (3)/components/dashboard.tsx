"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TerminalCard } from "./terminal-card"
import { CodeInput } from "./code-input"
import { CodeButton } from "./code-button"
import { User, Shield, Key, LogOut, Lock, Unlock, Copy, Check, Database, Cpu, Crown } from "lucide-react"
import { SimpleFirebaseAuth } from "@/lib/firebase-simple-auth"

interface DashboardProps {
  user: { id: string; email: string; encryptionKey?: string }
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [testData, setTestData] = useState("")
  const [encryptedData, setEncryptedData] = useState("")
  const [decryptedData, setDecryptedData] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleEncrypt = async () => {
    if (!testData.trim() || !user.encryptionKey) return

    setIsProcessing(true)
    try {
      const encrypted = await SimpleFirebaseAuth.encryptData(testData, user.encryptionKey)
      setEncryptedData(encrypted)
      setDecryptedData("")
    } catch (error) {
      console.error("Encryption failed:", error)
    }
    setIsProcessing(false)
  }

  const handleDecrypt = async () => {
    if (!encryptedData.trim() || !user.encryptionKey) return

    setIsProcessing(true)
    try {
      const decrypted = await SimpleFirebaseAuth.decryptData(encryptedData, user.encryptionKey)
      setDecryptedData(decrypted)
    } catch (error) {
      console.error("Decryption failed:", error)
      setDecryptedData("Decryption failed")
    }
    setIsProcessing(false)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      onLogout()
    } catch (error) {
      console.error("Logout error:", error)
      onLogout() // Fallback logout
    }
  }

  return (
    <div className="relative z-10 min-h-[calc(100vh-80px)] p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 5 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(0, 191, 255, 0.3)",
                  "0 0 30px rgba(0, 191, 255, 0.5)",
                  "0 0 20px rgba(0, 191, 255, 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg flex items-center justify-center"
            >
              <Crown className="w-6 h-6 text-blue-400" />
            </motion.div>
            <div>
              <motion.h1
                className="text-2xl font-bold text-blue-100 font-mono"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(0, 191, 255, 0.5)",
                    "0 0 15px rgba(0, 191, 255, 0.3)",
                    "0 0 10px rgba(0, 191, 255, 0.5)",
                  ],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                <span className="text-blue-400">$</span> dashboard --user={user.email.split("@")[0]}
              </motion.h1>
              <p className="text-blue-300/70 font-mono text-sm">{`// Authenticated session in the network`}</p>
            </div>
          </div>

          <CodeButton variant="secondary" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Exit Session
          </CodeButton>
        </motion.div>

        {/* Status Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <TerminalCard title="user.json" delay={0.1}>
            <div className="p-4 space-y-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-300">
                <User className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-sm">Profile</span>
              </div>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-blue-300/70">email:</span>
                  <span className="text-blue-300">"{user.email}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300/70">status:</span>
                  <span className="text-blue-400">"authenticated"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300/70">uid:</span>
                  <span className="text-blue-300/70 text-xs">"{user.id.slice(0, 8)}..."</span>
                </div>
              </div>
            </div>
          </TerminalCard>

          {user.encryptionKey && (
            <TerminalCard title="encryption.key" delay={0.2}>
              <div className="p-4 space-y-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-blue-300">
                  <Key className="w-4 h-4 text-yellow-400" />
                  <span className="font-mono text-sm">Key Info</span>
                </div>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-blue-300/70">length:</span>
                    <span className="text-blue-300">{user.encryptionKey.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300/70">preview:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-blue-300/70 bg-blue-500/20 px-2 py-1 rounded">
                        {user.encryptionKey.slice(0, 8)}...
                      </code>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyToClipboard(user.encryptionKey!)}
                        className="text-blue-300/70 hover:text-blue-400 transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </TerminalCard>
          )}

          <TerminalCard title="security.log" delay={0.3}>
            <div className="p-4 space-y-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-300">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-sm">Security</span>
              </div>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-blue-300/70">encryption:</span>
                  <span className="text-blue-400">AES-256</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300/70">auth_method:</span>
                  <span className="text-blue-400">{user.encryptionKey ? "biometric" : "google_oauth"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300/70">session:</span>
                  <span className="text-green-400">active</span>
                </div>
              </div>
            </div>
          </TerminalCard>
        </div>

        {/* Encryption Lab */}
        {user.encryptionKey && (
          <TerminalCard title="crypto-lab.ts" delay={0.4}>
            <div className="p-6 space-y-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-blue-400" />
                <h3 className="text-blue-200 font-mono text-lg">Encryption Laboratory</h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <CodeInput
                    label="plaintext"
                    icon={<Database className="w-4 h-4 text-blue-400" />}
                    placeholder="Enter data to encrypt..."
                    value={testData}
                    onChange={(e) => setTestData(e.target.value)}
                  />
                  <CodeButton
                    onClick={handleEncrypt}
                    disabled={!testData.trim() || isProcessing}
                    loading={isProcessing}
                    className="w-full"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Encrypt
                  </CodeButton>
                </div>

                <div className="space-y-4">
                  <CodeInput
                    label="ciphertext"
                    icon={<Key className="w-4 h-4 text-blue-400" />}
                    placeholder="Encrypted output..."
                    value={encryptedData}
                    onChange={(e) => setEncryptedData(e.target.value)}
                    className="font-mono text-xs"
                  />
                  <CodeButton
                    onClick={handleDecrypt}
                    disabled={!encryptedData.trim() || isProcessing}
                    loading={isProcessing}
                    variant="secondary"
                    className="w-full"
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    Decrypt
                  </CodeButton>
                </div>
              </div>

              <AnimatePresence>
                {decryptedData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="bg-blue-500/20 border-blue-500/30 text-blue-300 backdrop-blur-sm">
                      <Check className="h-4 w-4" />
                      <AlertDescription className="font-mono text-sm">
                        <strong>Decrypted:</strong> {decryptedData}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TerminalCard>
        )}

        {/* Architecture Info */}
        <TerminalCard title="architecture.md" delay={0.5}>
          <div className="p-6 backdrop-blur-sm">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: User,
                  title: user.encryptionKey ? "Biometric Auth" : "Google OAuth",
                  desc: user.encryptionKey
                    ? "WebAuthn fingerprint authentication"
                    : "Google OAuth 2.0 with human verification",
                  tech: user.encryptionKey ? "WebAuthn API" : "Firebase Auth",
                },
                {
                  icon: Shield,
                  title: "Security Layer",
                  desc: "Multi-factor authentication with device binding",
                  tech: "Firebase Security",
                },
                {
                  icon: Key,
                  title: "Encryption",
                  desc: user.encryptionKey ? "AES-GCM with unique keys" : "Secure session management",
                  tech: "Web Crypto API",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="p-4 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded hover:border-blue-400/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <h4 className="font-mono text-blue-200 font-medium">{item.title}</h4>
                  </div>
                  <p className="text-blue-300/70 text-sm mb-2">{item.desc}</p>
                  <code className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">{item.tech}</code>
                </motion.div>
              ))}
            </div>
          </div>
        </TerminalCard>
      </div>
    </div>
  )
}
