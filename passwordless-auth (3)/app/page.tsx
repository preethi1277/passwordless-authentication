"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Shield, Key, Zap, UserCheck, Globe, Lock, ArrowRight, CheckCircle, LinkIcon } from "lucide-react"
import { TerminalCard } from "@/components/terminal-card"
import { CodeButton } from "@/components/code-button"
import { NetworkBackground } from "@/components/network-background"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const [typingText, setTypingText] = useState("")
  const [messageIndex, setMessageIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)

  const statusMessages = [
    "Initializing LinkLet security protocol...",
    "Biometric sensors: [ACTIVE]",
    "Threat detection: [ENABLED]",
    "Security level: [MAXIMUM]",
    "LinkLet ready for authentication.",
  ]

  useEffect(() => {
    const typeWriter = () => {
      if (messageIndex >= statusMessages.length) {
        setMessageIndex(0)
        setCharIndex(0)
        setTypingText("")
        return
      }

      const currentMessage = statusMessages[messageIndex]

      if (charIndex < currentMessage.length) {
        setTypingText(currentMessage.substring(0, charIndex + 1))
        setCharIndex(charIndex + 1)
        setTimeout(typeWriter, 50)
      } else {
        setCharIndex(0)
        setMessageIndex(messageIndex + 1)
        setTimeout(typeWriter, 2000)
      }
    }

    const timeout = setTimeout(typeWriter, 1500)
    return () => clearTimeout(timeout)
  }, [messageIndex, charIndex])

  const features = [
    {
      icon: Shield,
      title: "Military-Grade Security",
      description:
        "Advanced encryption and biometric authentication protect your digital identity with enterprise-level security.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Authenticate in milliseconds with our optimized biometric recognition and streamlined OAuth flows.",
    },
    {
      icon: UserCheck,
      title: "Zero Passwords",
      description: "Eliminate password vulnerabilities entirely with our passwordless authentication system.",
    },
    {
      icon: Key,
      title: "Hardware Security",
      description:
        "Leverage device-native security features for unbreakable authentication that never leaves your device.",
    },
    {
      icon: Globe,
      title: "Universal Access",
      description:
        "Seamless experience across all devices and platforms with intelligent authentication method selection.",
    },
    {
      icon: Lock,
      title: "Privacy First",
      description:
        "Your biometric data stays on your device. We never store or transmit sensitive authentication data.",
    },
  ]

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "< 100ms", label: "Auth Speed" },
    { value: "256-bit", label: "Encryption" },
    { value: "0", label: "Breaches" },
  ]

  return (
    <div className="relative">
      {/* Hero Section with Network Background */}
      <section id="home" className="min-h-screen flex items-center py-20 relative overflow-hidden">
        <NetworkBackground />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full text-sm font-mono text-red-400"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Next-Generation Security
                  </motion.div>

                  <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                    <span className="linklet-title">Passwordless</span>
                    <br />
                    <span className="text-white">Authentication</span>
                    <br />
                    <span className="linklet-title">Reimagined</span>
                  </h1>

                  <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                    Experience the future of digital security with LinkLet's biometric authentication, AI-powered threat
                    detection, and zero-password convenience. Built for enterprises that demand both security and user
                    experience.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/how-it-works">
                    <CodeButton className="group">
                      Try LinkLet Free
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </CodeButton>
                  </Link>
                  <CodeButton variant="secondary">View Documentation</CodeButton>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                      className="text-center backdrop-blur-sm bg-black/20 rounded-lg p-3 border border-red-500/20"
                    >
                      <div className="text-2xl font-bold linklet-title">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Terminal Demo */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative"
              >
                <TerminalCard title="linklet-system.log" className="animate-glow-pulse backdrop-blur-sm bg-black/40">
                  <div className="space-y-4 font-mono text-sm">
                    <div className="text-red-500">
                      {typingText}
                      <span className="typing-cursor"></span>
                    </div>

                    <div className="space-y-2 text-gray-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>WebAuthn API initialized</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Biometric sensors detected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Encryption keys generated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Firebase connection secure</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <div className="text-red-500">$ linklet --status</div>
                      <div className="text-green-400">✓ All systems operational</div>
                    </div>
                  </div>
                </TerminalCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 bg-gray-900/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="linklet-title">Why Choose</span> LinkLet?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built by security experts for the modern enterprise. Every feature designed with both security and user
              experience in mind.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <TerminalCard className="h-full text-center group">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                      <feature.icon className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </TerminalCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="linklet-title">How It</span> Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Three simple steps to the most secure authentication experience you've ever used.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Device Detection",
                description:
                  "LinkLet automatically detects your device capabilities and selects the optimal authentication method.",
              },
              {
                step: "02",
                title: "Secure Authentication",
                description: "Use biometric sensors on mobile or secure OAuth on desktop with human verification.",
              },
              {
                step: "03",
                title: "Instant Access",
                description: "Gain immediate access with hardware-backed security and encrypted session management.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <TerminalCard className="text-center relative">
                  <div className="space-y-4">
                    <div className="text-6xl font-bold text-red-500/20 absolute top-4 right-6">{step.step}</div>
                    <div className="relative z-10 space-y-4">
                      <div className="w-12 h-12 mx-auto bg-red-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {step.step}
                      </div>
                      <h3 className="text-xl font-bold text-white">{step.title}</h3>
                      <p className="text-gray-300">{step.description}</p>
                    </div>
                  </div>
                </TerminalCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <Link href="/how-it-works">
              <CodeButton className="group">
                Experience LinkLet Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </CodeButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-900/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="linklet-title">Enterprise</span> Benefits
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover why leading organizations trust LinkLet for their most critical security needs.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {[
                "Reduce security breaches by 99.7%",
                "Eliminate password-related support tickets",
                "Improve user login speed by 10x",
                "Achieve compliance with zero effort",
                "Scale authentication across any platform",
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg text-white">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <TerminalCard title="security-metrics.json" className="animate-float">
                <div className="space-y-4 font-mono text-sm">
                  <div className="text-red-500">"security_metrics": {"{"}</div>
                  <div className="ml-4 space-y-2 text-gray-400">
                    <div>
                      "breach_attempts": <span className="text-green-400">0</span>,
                    </div>
                    <div>
                      "auth_success_rate": <span className="text-green-400">"99.97%"</span>,
                    </div>
                    <div>
                      "avg_login_time": <span className="text-green-400">"87ms"</span>,
                    </div>
                    <div>
                      "user_satisfaction": <span className="text-green-400">"98.4%"</span>,
                    </div>
                    <div>
                      "compliance_score": <span className="text-green-400">"100%"</span>
                    </div>
                  </div>
                  <div className="text-red-500">{"}"}</div>
                </div>
              </TerminalCard>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
