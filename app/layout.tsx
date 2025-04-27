import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SettingsProvider } from "@/app/context/settings-context"
import { CommandsProvider } from "@/app/context/commands-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gemini Chat App",
  description: "Chat with Google Gemini 2.0 Flash AI"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SettingsProvider>
          <CommandsProvider>{children}</CommandsProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
