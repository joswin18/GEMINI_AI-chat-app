export type MessageRole = "user" | "assistant"

export interface ChatMessage {
  role: MessageRole
  content: string
  id: string
  image?: string | null
}
