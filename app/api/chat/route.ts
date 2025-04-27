import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const message = formData.get("message") as string
    const image = formData.get("image") as File | null
    const historyString = formData.get("history") as string
    const userPreferencesString = formData.get("userPreferences") as string | null

    const history = historyString ? JSON.parse(historyString) : []
    const userPreferences = userPreferencesString ? JSON.parse(userPreferencesString) : null

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Prepare chat history for Gemini
    const chatHistory = history.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    // Start a chat session with generation config
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    })

    // Prepare content parts
    const parts: any[] = []

    // Add user preferences context if available
    if (userPreferences) {
      const contextPrompt = `Context for this conversation:
- My name is ${userPreferences.name || "User"}
- I'm interested in: ${userPreferences.interests?.join(", ") || "various topics"}
- Please respond in a ${userPreferences.preferredResponseStyle || "helpful and concise"} manner

My message is: `

      parts.push({ text: contextPrompt })
    }

    // Add text message if provided
    if (message && message.trim()) {
      parts.push({ text: message })
    }

    // Add image if provided
    if (image) {
      const imageData = await image.arrayBuffer()
      const mimeType = image.type

      parts.push({
        inlineData: {
          data: Buffer.from(imageData).toString("base64"),
          mimeType,
        },
      })
    }

    // Generate response
    const result = await chat.sendMessageStream(parts)

    // Create a readable stream from the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            controller.enqueue(new TextEncoder().encode(text))
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    // Return the stream as a response
    return new NextResponse(stream)
  } catch (error) {
    console.error("Error processing chat request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
