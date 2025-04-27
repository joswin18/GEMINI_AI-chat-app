"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImagePreviewProps {
  url: string
  onRemove: () => void
}

export function ImagePreview({ url, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative inline-block mb-3">
      <img src={url || "/placeholder.svg"} alt="Preview" className="h-20 w-auto rounded-md object-cover" />
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
