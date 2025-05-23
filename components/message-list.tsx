"use client"

import type { RefObject } from "react"
import type { Message } from "@/lib/types"
import MessageItem from "./message-item"

interface MessageListProps {
  messages: Message[]
  messagesEndRef: RefObject<HTMLDivElement | null>
}

export default function MessageList({ messages, messagesEndRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
