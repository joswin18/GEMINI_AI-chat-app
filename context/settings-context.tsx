"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type SettingsContextType = {
  userDP: string
  aiDP: string
  theme: "dark" | "light" | "system"
  setUserDP: (url: string) => void
  setAiDP: (url: string) => void
  setTheme: (theme: "dark" | "light" | "system") => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Default images
  const defaultUserDP = "/avatars/user.png"
  const defaultAiDP = "/avatars/ai.png"

  const [userDP, setUserDP] = useState<string>(defaultUserDP)
  const [aiDP, setAiDP] = useState<string>(defaultAiDP)
  const [theme, setTheme] = useState<"dark" | "light" | "system">("light")
  const [mounted, setMounted] = useState(false)

  // Load settings from localStorage on client side
  useEffect(() => {
    setMounted(true)
    const storedUserDP = localStorage.getItem("userDP")
    const storedAiDP = localStorage.getItem("aiDP")
    const storedTheme = localStorage.getItem("theme") as "dark" | "light" | "system" | null

    if (storedUserDP) setUserDP(storedUserDP)
    if (storedAiDP) setAiDP(storedAiDP)
    if (storedTheme) setTheme(storedTheme)
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("userDP", userDP)
      localStorage.setItem("aiDP", aiDP)
      localStorage.setItem("theme", theme)

      // Apply theme to document
      const root = window.document.documentElement
      root.classList.remove("dark", "light")

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }
  }, [userDP, aiDP, theme, mounted])

  return (
    <SettingsContext.Provider value={{ userDP, aiDP, theme, setUserDP, setAiDP, setTheme }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
