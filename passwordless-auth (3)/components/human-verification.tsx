"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CodeButton } from "./code-button"
import { Shield, RefreshCw, CheckCircle } from "lucide-react"

interface HumanVerificationProps {
  onVerified: () => void
}

export function HumanVerification({ onVerified }: HumanVerificationProps) {
  const [question, setQuestion] = useState({ text: "", answer: 0 })
  const [userAnswer, setUserAnswer] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")

  const generateQuestion = () => {
    const operations = [
      { type: "add", symbol: "+" },
      { type: "subtract", symbol: "-" },
      { type: "multiply", symbol: "×" },
    ]

    const operation = operations[Math.floor(Math.random() * operations.length)]
    let num1, num2, answer, text

    switch (operation.type) {
      case "add":
        num1 = Math.floor(Math.random() * 20) + 1
        num2 = Math.floor(Math.random() * 20) + 1
        answer = num1 + num2
        text = `${num1} ${operation.symbol} ${num2}`
        break
      case "subtract":
        num1 = Math.floor(Math.random() * 30) + 10
        num2 = Math.floor(Math.random() * num1) + 1
        answer = num1 - num2
        text = `${num1} ${operation.symbol} ${num2}`
        break
      case "multiply":
        num1 = Math.floor(Math.random() * 9) + 2
        num2 = Math.floor(Math.random() * 9) + 2
        answer = num1 * num2
        text = `${num1} ${operation.symbol} ${num2}`
        break
      default:
        num1 = 5
        num2 = 3
        answer = 8
        text = "5 + 3"
    }

    setQuestion({ text, answer })
    setUserAnswer("")
    setError("")
  }

  useEffect(() => {
    generateQuestion()
  }, [])

  const handleVerify = () => {
    const answer = Number.parseInt(userAnswer)
    if (answer === question.answer) {
      setIsVerified(true)
      setError("")
      setTimeout(() => {
        onVerified()
      }, 1000)
    } else {
      setError("Incorrect answer. Please try again.")
      generateQuestion()
    }
  }

  if (isVerified) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4"
        >
          <CheckCircle className="w-8 h-8 text-white" />
        </motion.div>
        <p className="text-green-400 font-mono text-sm">Human verification complete</p>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-400" />
          <span className="text-blue-300 font-mono text-sm">Human Verification</span>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-4">
          <p className="text-blue-300/70 font-mono text-sm mb-3">Solve this simple equation:</p>
          <div className="text-2xl font-mono text-white mb-4">{question.text} = ?</div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="flex-1 bg-blue-500/20 border border-blue-500/30 text-white font-mono text-center py-2 px-3 rounded focus:border-blue-400/60 focus:ring-blue-400/20 focus:outline-none transition-all duration-300"
              placeholder="Answer"
              onKeyPress={(e) => e.key === "Enter" && handleVerify()}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={generateQuestion}
              className="p-2 text-blue-300/70 hover:text-blue-400 transition-colors"
              title="Generate new question"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-400 font-mono text-sm mb-4"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <CodeButton onClick={handleVerify} disabled={!userAnswer.trim()} className="w-full">
          Verify
        </CodeButton>
      </div>
    </motion.div>
  )
}
