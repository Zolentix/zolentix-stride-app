import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "Stride — Habit Tracker",
  description: "Track your habits and build streaks. Installable PWA by Zolentix.",
  manifest: "/manifest.json",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><meta name="theme-color" content="#0A0A0F" /></head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#0A0A0F] text-[#EDEDF2]`}>
        {children}
      </body>
    </html>
  )
}
