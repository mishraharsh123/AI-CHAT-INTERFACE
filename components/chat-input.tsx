"use client"

import { useState, type KeyboardEvent } from "react"
import { Send, Loader2 } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isProcessing: boolean
}

export default function ChatInput({ onSendMessage, isProcessing }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = () => {
    if (input.trim() && !isProcessing) {
      onSendMessage(input)
      setInput("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t p-4 bg-gray-50">
      <div className="flex items-end gap-2">
        <textarea
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Type a message or use /weather, /calc, /define..."
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isProcessing}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <span className="font-medium">Available commands:</span> /weather [city], /calc [expression], /define word
      </div>
    </div>
  )
}
