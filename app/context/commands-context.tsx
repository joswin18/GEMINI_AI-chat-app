"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Command {
  name: string
  description: string
  trigger: string
  response: string
}

export interface UserPreferences {
  name: string
  interests: string[]
  preferredResponseStyle: string
}

interface CommandsContextType {
  commands: Command[]
  userPreferences: UserPreferences
  addCommand: (command: Command) => void
  removeCommand: (trigger: string) => void
  updateCommand: (trigger: string, command: Command) => void
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  processCommand: (input: string) => { isCommand: boolean; response?: string }
}

const defaultCommands: Command[] = [
  {
    name: "Help",
    description: "Show available commands",
    trigger: "/help",
    response: "Available commands:\n/help - Show this help message\n/clear - Clear chat history",
  },
  {
    name: "Clear",
    description: "Clear chat history",
    trigger: "/clear",
    response: "Chat history cleared!",
  },
]

const defaultPreferences: UserPreferences = {
  name: "User",
  interests: [],
  preferredResponseStyle: "helpful and concise",
}

const CommandsContext = createContext<CommandsContextType | undefined>(undefined)

export function CommandsProvider({ children }: { children: ReactNode }) {
  const [commands, setCommands] = useState<Command[]>(defaultCommands)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences)
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on client side
  useEffect(() => {
    setMounted(true)
    const storedCommands = localStorage.getItem("userCommands")
    const storedPreferences = localStorage.getItem("userPreferences")

    if (storedCommands) {
      try {
        const parsedCommands = JSON.parse(storedCommands)
        setCommands([...defaultCommands, ...parsedCommands])
      } catch (e) {
        console.error("Failed to parse stored commands", e)
      }
    }

    if (storedPreferences) {
      try {
        const parsedPreferences = JSON.parse(storedPreferences)
        setUserPreferences({ ...defaultPreferences, ...parsedPreferences })
      } catch (e) {
        console.error("Failed to parse stored preferences", e)
      }
    }
  }, [])

  // Save to localStorage when changes occur
  useEffect(() => {
    if (mounted) {
      // Only save custom commands (not default ones)
      const customCommands = commands.filter(
        (cmd) => !defaultCommands.some((defaultCmd) => defaultCmd.trigger === cmd.trigger),
      )
      localStorage.setItem("userCommands", JSON.stringify(customCommands))
      localStorage.setItem("userPreferences", JSON.stringify(userPreferences))
    }
  }, [commands, userPreferences, mounted])

  const addCommand = (command: Command) => {
    setCommands((prev) => {
      // Don't add if trigger already exists
      if (prev.some((cmd) => cmd.trigger === command.trigger)) {
        return prev
      }
      return [...prev, command]
    })
  }

  const removeCommand = (trigger: string) => {
    // Don't allow removing default commands
    if (defaultCommands.some((cmd) => cmd.trigger === trigger)) {
      return
    }
    setCommands((prev) => prev.filter((cmd) => cmd.trigger !== trigger))
  }

  const updateCommand = (trigger: string, command: Command) => {
    setCommands((prev) => prev.map((cmd) => (cmd.trigger === trigger ? command : cmd)))
  }

  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    setUserPreferences((prev) => ({ ...prev, ...preferences }))
  }

  const processCommand = (input: string): { isCommand: boolean; response?: string } => {
    if (!input.startsWith("/")) {
      return { isCommand: false }
    }

    // Special handling for help command to dynamically list all commands
    if (input.trim() === "/help") {
      const helpText = commands.map((cmd) => `${cmd.trigger} - ${cmd.description}`).join("\n")
      return { isCommand: true, response: `Available commands:\n${helpText}` }
    }

    const command = commands.find((cmd) => input.trim().startsWith(cmd.trigger))
    if (command) {
      return { isCommand: true, response: command.response }
    }

    return { isCommand: false }
  }

  return (
    <CommandsContext.Provider
      value={{
        commands,
        userPreferences,
        addCommand,
        removeCommand,
        updateCommand,
        updateUserPreferences,
        processCommand,
      }}
    >
      {children}
    </CommandsContext.Provider>
  )
}

export function useCommands() {
  const context = useContext(CommandsContext)
  if (context === undefined) {
    throw new Error("useCommands must be used within a CommandsProvider")
  }
  return context
}
