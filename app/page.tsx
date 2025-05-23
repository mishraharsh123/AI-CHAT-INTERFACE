import ChatInterface from "@/components/chat-interface"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-3xl">
        <h1 className="mb-4 text-3xl font-bold text-center">AI Chat Assistant</h1>
        <p className="mb-8 text-center text-gray-600">
          Chat with our AI assistant or use slash commands like /weather, /calc, or /define
        </p>
        <ChatInterface />
      </div>
    </main>
  )
}
