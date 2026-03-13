import "./globals.css"

import React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "BEJAS - Blockchain Enabled Judicial Analytics System",
  description:
    "Secure case management system for Lesotho judiciary with blockchain technology and AES-256 encryption",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "min-h-screen font-sans antialiased",
          "bg-background text-foreground",
        ].join(" ")}
      >
        {/* Subtle global background polish */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 opacity-[0.55] dark:opacity-[0.65]" />
        </div>

        {children}

        <Analytics />
      </body>
    </html>
  )
}

