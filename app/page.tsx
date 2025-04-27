import Link from "next/link"
import { Chat } from "@/components/chat"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Gemini Chat</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/settings">
              <Button variant="outline" size="icon" title="Settings">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
        <Chat />
      </div>
    </main>
  )
}
