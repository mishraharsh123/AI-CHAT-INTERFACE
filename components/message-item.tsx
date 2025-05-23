"use client"

import type { Message } from "@/lib/types"
import WeatherCard from "./plugin-cards/weather-card"
import CalculatorCard from "./plugin-cards/calculator-card"
import DictionaryCard from "./plugin-cards/dictionary-card"
import { formatDistanceToNow } from "date-fns"

interface MessageItemProps {
  message: Message
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.sender === "user"
  const timestamp = new Date(message.timestamp)
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true })

  const renderPluginContent = () => {
    if (message.type !== "plugin" || !message.pluginName) {
      return null
    }

    switch (message.pluginName) {
      case "weather":
        return <WeatherCard data={message.pluginData} />
      case "calc":
        return <CalculatorCard data={message.pluginData} />
      case "define":
        return <DictionaryCard data={message.pluginData} />
      default:
        return null
    }
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"
        }`}
      >
        {message.type === "text" ? <div className="whitespace-pre-wrap">{message.content}</div> : renderPluginContent()}
        <div className={`text-xs mt-1 ${isUser ? "text-blue-200" : "text-gray-500"}`}>{timeAgo}</div>
      </div>
    </div>
  )
}
