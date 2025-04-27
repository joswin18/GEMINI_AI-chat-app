"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { ImagePlus, Send, Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types/chat"
import { ImagePreview } from "@/components/image-preview"
import { useSettings } from "@/app/context/settings-context"
import { useCommands } from "@/app/context/commands-context"

export function Chat() {
  const { userDP, aiDP } = useSettings()
  const { processCommand, userPreferences } = useCommands()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !selectedImage) || isLoading) return

    // Check if this is a command
    const commandResult = processCommand(input.trim())
    if (commandResult.isCommand) {
      // Handle special commands
      if (input.trim() === "/clear") {
        clearChat()
        return
      }

      // Add user message
      const userMessage: ChatMessage = {
        role: "user",
        content: input,
        id: Date.now().toString(),
      }

      // Add AI response for the command
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: commandResult.response || "Command processed",
        id: (Date.now() + 1).toString(),
      }

      setMessages((prev) => [...prev, userMessage, aiMessage])
      setInput("")
      return
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      id: Date.now().toString(),
      image: imagePreviewUrl,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("message", input)
      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      // Add user preferences to the request
      formData.append("userPreferences", JSON.stringify(userPreferences))
      formData.append("history", JSON.stringify(messages))

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      const decoder = new TextDecoder()
      let aiResponse = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        aiResponse += chunk

        // Update the AI message as chunks arrive
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]

          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content = aiResponse
          } else {
            newMessages.push({
              role: "assistant",
              content: aiResponse,
              id: Date.now().toString(),
            })
          }

          return newMessages
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          id: Date.now().toString(),
        },
      ])
    } finally {
      setIsLoading(false)
      setSelectedImage(null)
      setImagePreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[70vh]">
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          className="text-muted-foreground hover:text-foreground"
          disabled={messages.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Start a conversation with Gemini or type /help for commands
          </div>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} userDP={userDP} aiDP={aiDP} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      <Card className="p-4 rounded-t-none border-t-0">
        {imagePreviewUrl && (
          <ImagePreview
            url={imagePreviewUrl}
            onRemove={() => {
              setSelectedImage(null)
              setImagePreviewUrl(null)
            }}
          />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <div className="flex">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message or command (e.g., /help)..."
              className="flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
          </div>

          <div className="flex justify-between">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                title="Upload image"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            </div>

            <Button type="submit" disabled={isLoading || (!input.trim() && !selectedImage)}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="ml-2">Send</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
  userDP: string
  aiDP: string
}

function MessageBubble({ message, userDP, aiDP }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const isCommand = isUser && message.content.trim().startsWith("/")

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex gap-3 max-w-[80%]", isUser ? "flex-row-reverse" : "flex-row")}>
        <Avatar className="h-8 w-8 overflow-hidden">
          <img src={isUser ? userDP : aiDP} alt={isUser ? "User" : "AI"} className="h-full w-full object-cover" />
        </Avatar>

        <div
          className={cn(
            "rounded-lg p-4",
            isCommand
              ? "bg-gray-200 dark:bg-gray-700 text-foreground"
              : isUser
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          )}
        >
          {message.image && (
            <div className="mb-2">
              <img src={message.image || "/placeholder.svg"} alt="Uploaded content" className="max-h-60 rounded-md" />
            </div>
          )}
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    </div>
  )
}
