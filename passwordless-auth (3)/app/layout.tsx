import type React from "react"
import type { Metadata } from "next"
import { Space_Mono, Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { InteractiveBackground } from "@/components/interactive-background"
import { CustomCursor } from "@/components/custom-cursor"
import { Footer } from "@/components/footer"

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "LinkLet - Next-Gen Passwordless Authentication",
  description: "Enterprise-grade passwordless authentication with biometric security and advanced threat protection.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceMono.variable} ${inter.variable} antialiased`}>
        <CustomCursor />
        <InteractiveBackground />
        <div className="relative z-10">
          <Navbar />
          <main className="min-h-screen pt-20">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
