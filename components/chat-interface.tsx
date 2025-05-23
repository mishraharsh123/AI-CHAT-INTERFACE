"use client"

import { useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import ChatInput from "./chat-input"
import MessageList from "./message-list"
import { PluginManager } from "@/lib/plugin-manager"
import type { Message } from "@/lib/types"

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pluginManager = useRef(new PluginManager())

  useEffect(() => {
    // Load messages from localStorage on component mount
    const savedMessages = localStorage.getItem("chatMessages")
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else {
      // Add welcome message if no history exists
      const welcomeMessage: Message = {
        id: uuidv4(),
        sender: "assistant",
        content:
          "Hello! I'm your AI assistant. You can chat with me or use slash commands like /weather, /calc, or /define to access special tools.",
        type: "text",
        timestamp: new Date().toISOString(),
      }
      setMessages([welcomeMessage])
    }
  }, [])

  useEffect(() => {
    // Save messages to localStorage whenever they change
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages))
    }

    // Scroll to bottom when messages change
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      sender: "user",
      content,
      type: "text",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsProcessing(true)

    try {
      // Process message with plugin manager
      const { isPlugin, pluginName, response, pluginData } = await pluginManager.current.processMessage(content)

      // Add typing indicator
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

      // Add assistant response
      const assistantMessage: Message = {
        id: uuidv4(),
        sender: "assistant",
        content: response,
        type: isPlugin ? "plugin" : "text",
        pluginName: isPlugin ? pluginName : undefined,
        pluginData: isPlugin ? pluginData : undefined,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error processing message:", error)

      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        sender: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        type: "text",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearChat = () => {
    const confirmClear = window.confirm("Are you sure you want to clear the chat history?")
    if (confirmClear) {
      const welcomeMessage: Message = {
        id: uuidv4(),
        sender: "assistant",
        content: "Chat history cleared. How can I help you today?",
        type: "text",
        timestamp: new Date().toISOString(),
      }
      setMessages([welcomeMessage])
      localStorage.removeItem("chatMessages")
    }
  }

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Chat Assistant</h2>
        <button onClick={handleClearChat} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
          Clear Chat
        </button>
      </div>

      <MessageList messages={messages} messagesEndRef={messagesEndRef} />

      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
    </div>
  )
}
