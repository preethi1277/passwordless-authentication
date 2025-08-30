"use client"

import { AuthWrapper } from "@/components/auth-wrapper"
import { motion } from "framer-motion"
import { TerminalCard } from "@/components/terminal-card"
import { NetworkBackground } from "@/components/network-background"
import { Fingerprint, User } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="relative min-h-screen">
      <NetworkBackground />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 font-mono">
            <span className="linklet-title">How LinkLet</span> <span className="text-white">Works</span>
          </h1>
          <p className="text-gray-300 text-lg font-mono backdrop-blur-sm bg-black/20 rounded-lg p-4 border border-red-500/20">
            Experience our innovative passwordless authentication system firsthand. Depending on your device, you'll be
            guided through either biometric fingerprint login or Google OAuth with a simple human verification.
          </p>
        </motion.div>

        <div className="max-w-md mx-auto">
          <AuthWrapper />
        </div>

        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <TerminalCard title="Mobile Authentication" delay={0.1} className="backdrop-blur-sm bg-black/40">
            <motion.div
              className="p-6 space-y-4 font-mono text-gray-300"
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(255, 0, 0, 0.3)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 text-red-500">
                <Fingerprint className="w-5 h-5" />
                <h3 className="text-xl font-bold">Biometric Fingerprint</h3>
              </div>
              <p>
                On mobile devices, LinkLet leverages the WebAuthn API to provide secure, hardware-backed fingerprint
                authentication. Your biometric data never leaves your device, ensuring maximum privacy and security.
              </p>
              <p>
                Upon successful authentication, a unique encryption key is generated and stored securely, allowing for
                client-side data encryption.
              </p>
            </motion.div>
          </TerminalCard>

          <TerminalCard title="Desktop Authentication" delay={0.2} className="backdrop-blur-sm bg-black/40">
            <motion.div
              className="p-6 space-y-4 font-mono text-gray-300"
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(255, 0, 0, 0.3)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 text-red-500">
                <User className="w-5 h-5" />
                <h3 className="text-xl font-bold">Google OAuth & Verification</h3>
              </div>
              <p>
                For desktop users, LinkLet integrates with Google OAuth for a familiar and convenient sign-in
                experience. This is coupled with a simple human verification step to prevent automated access.
              </p>
              <p>
                Your Google account provides a robust identity layer, and our system ensures your session is secure and
                protected against unauthorized access.
              </p>
            </motion.div>
          </TerminalCard>
        </div>
      </div>
    </div>
  )
}
