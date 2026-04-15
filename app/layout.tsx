import React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"

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
      <body className="min-h-screen font-sans antialiased bg-background text-foreground">
        <Script id="bejas-theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('bejas:last-theme')||'current';var r=document.documentElement;r.setAttribute('data-app-theme',t);if(t==='current'){r.classList.add('dark')}else{r.classList.remove('dark')}}catch(e){}})();`}
        </Script>

        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(74,144,226,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,162,86,0.14),transparent_24%),linear-gradient(180deg,rgba(4,11,31,0.08),transparent_42%)] opacity-[0.8]" />
          <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
        </div>

        {children}

        <Analytics />
      </body>
    </html>
  )
}
