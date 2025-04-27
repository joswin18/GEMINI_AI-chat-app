"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/app/context/settings-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft, Upload, RefreshCw, User, Command, Settings2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

// Predefined AI avatars
const aiAvatars = [
  "/avatars/ai-1.png",
  "/avatars/ai-2.png",
  "/avatars/ai-3.png",
  "/avatars/ai-4.png",
  "/avatars/ai-5.png",
  "/avatars/ai-6.png",
]

export default function SettingsPage() {
  const { userDP, aiDP, setUserDP, setAiDP } = useSettings()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState("user")

  const handleUserImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUserDP(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const resetToDefault = () => {
    if (activeTab === "user") {
      setUserDP("/avatars/user.png")
    } else {
      setAiDP("/avatars/ai.png")
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Chat
        </Button>
        <ThemeToggle />
      </div>

      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/settings/preferences">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Preferences
              </CardTitle>
              <CardDescription>Customize how Gemini interacts with you</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Set your name, interests, and preferred response style</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings/commands">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Command className="h-5 w-5" />
                Custom Commands
              </CardTitle>
              <CardDescription>Create shortcuts for common requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Define custom commands that Gemini will respond to</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how your chat looks</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user">Your Avatar</TabsTrigger>
              <TabsTrigger value="ai">AI Avatar</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32 border-2 border-primary">
                  <img src={userDP || "/placeholder.svg"} alt="User" className="object-cover" />
                </Avatar>

                <div className="flex gap-4">
                  <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                  <Button variant="outline" onClick={resetToDefault} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUserImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground">Recommended: Square images work best</p>
              </div>
            </TabsContent>

            <TabsContent value="ai">
              <div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
                  {aiAvatars.map((avatar, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer rounded-lg p-2 ${aiDP === avatar ? "ring-2 ring-primary" : "hover:bg-accent"}`}
                      onClick={() => setAiDP(avatar)}
                    >
                      <Avatar className="h-16 w-16 mx-auto">
                        <img
                          src={avatar || "/placeholder.svg"}
                          alt={`AI Avatar ${index + 1}`}
                          className="object-cover"
                        />
                      </Avatar>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" onClick={resetToDefault} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
