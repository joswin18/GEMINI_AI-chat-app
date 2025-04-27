"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCommands } from "@/app/context/commands-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PreferencesPage() {
  const router = useRouter()
  const { userPreferences, updateUserPreferences } = useCommands()

  const [name, setName] = useState(userPreferences.name)
  const [interests, setInterests] = useState(userPreferences.interests.join(", "))
  const [responseStyle, setResponseStyle] = useState(userPreferences.preferredResponseStyle)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => {
        setSaved(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saved])

  const handleSave = () => {
    const interestsArray = interests
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    updateUserPreferences({
      name,
      interests: interestsArray,
      preferredResponseStyle: responseStyle,
    })

    setSaved(true)
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/settings")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Personal Preferences</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>Customize how Gemini interacts with you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {saved && (
            <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
              <AlertDescription className="text-green-800 dark:text-green-300">
                Your preferences have been saved!
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How should Gemini address you?"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="interests">Your Interests</Label>
            <Textarea
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Technology, AI, Programming, etc. (comma separated)"
              rows={2}
            />
            <p className="text-sm text-muted-foreground">Gemini will tailor responses based on your interests</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="responseStyle">Preferred Response Style</Label>
            <Textarea
              id="responseStyle"
              value={responseStyle}
              onChange={(e) => setResponseStyle(e.target.value)}
              placeholder="e.g., Concise and technical, Friendly and detailed, etc."
              rows={3}
            />
            <p className="text-sm text-muted-foreground">Describe how you'd like Gemini to respond to you</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Preferences
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How This Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Your preferences are used to personalize how Gemini responds to you. This information is:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Stored locally in your browser</li>
            <li>Sent with each message to Gemini</li>
            <li>Used to make responses more relevant to you</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Note: These preferences help Gemini understand your context, but the AI may not always perfectly follow your
            preferred style.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
