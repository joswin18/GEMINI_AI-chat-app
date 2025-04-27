"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCommands, type Command } from "@/app/context/commands-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash, Save } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CommandsPage() {
  const router = useRouter()
  const { commands, addCommand, removeCommand, updateCommand } = useCommands()

  const [newCommand, setNewCommand] = useState<Command>({
    name: "",
    description: "",
    trigger: "",
    response: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [editingCommand, setEditingCommand] = useState<string | null>(null)

  const handleAddCommand = () => {
    // Validation
    if (!newCommand.name || !newCommand.trigger || !newCommand.response) {
      setError("All fields are required")
      return
    }

    if (!newCommand.trigger.startsWith("/")) {
      setError("Command trigger must start with /")
      return
    }

    if (commands.some((cmd) => cmd.trigger === newCommand.trigger)) {
      setError("Command trigger already exists")
      return
    }

    addCommand(newCommand)
    setNewCommand({
      name: "",
      description: "",
      trigger: "",
      response: "",
    })
    setError(null)
  }

  const handleEditCommand = (command: Command) => {
    setEditingCommand(command.trigger)
    setNewCommand(command)
  }

  const handleSaveEdit = () => {
    if (editingCommand) {
      updateCommand(editingCommand, newCommand)
      setEditingCommand(null)
      setNewCommand({
        name: "",
        description: "",
        trigger: "",
        response: "",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingCommand(null)
    setNewCommand({
      name: "",
      description: "",
      trigger: "",
      response: "",
    })
  }

  // Filter out default commands that shouldn't be editable
  const defaultCommandTriggers = ["/help", "/clear"]
  const customCommands = commands.filter((cmd) => !defaultCommandTriggers.includes(cmd.trigger))

  return (
    <div className="container max-w-4xl py-10 mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/settings")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Custom Commands</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editingCommand ? "Edit Command" : "Add New Command"}</CardTitle>
          <CardDescription>
            {editingCommand ? "Edit your custom command" : "Create a custom command that Gemini will respond to"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">Command Name</Label>
            <Input
              id="name"
              value={newCommand.name}
              onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
              placeholder="e.g., Weather"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="trigger">Trigger</Label>
            <Input
              id="trigger"
              value={newCommand.trigger}
              onChange={(e) => setNewCommand({ ...newCommand, trigger: e.target.value })}
              placeholder="e.g., /weather"
            />
            <p className="text-sm text-muted-foreground">Must start with / (e.g., /weather)</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newCommand.description}
              onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
              placeholder="e.g., Get current weather"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="response">Response</Label>
            <Textarea
              id="response"
              value={newCommand.response}
              onChange={(e) => setNewCommand({ ...newCommand, response: e.target.value })}
              placeholder="The response that will be shown when this command is used"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {editingCommand ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={handleAddCommand} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Command
            </Button>
          )}
        </CardFooter>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Your Commands</h2>

      {customCommands.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">You haven't created any custom commands yet.</Card>
      ) : (
        <div className="space-y-4">
          {customCommands.map((command) => (
            <Card key={command.trigger} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{command.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {command.trigger}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditCommand(command)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeCommand(command.trigger)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {command.description && <CardDescription className="mt-1">{command.description}</CardDescription>}
              </CardHeader>
              <Separator />
              <CardContent className="pt-3">
                <div className="text-sm whitespace-pre-wrap">{command.response}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
