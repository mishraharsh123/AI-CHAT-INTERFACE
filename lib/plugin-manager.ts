import type { Plugin, PluginResponse } from "./types"
import { WeatherPlugin } from "./plugins/weather-plugin"
import { CalculatorPlugin } from "./plugins/calculator-plugin"
import { DictionaryPlugin } from "./plugins/dictionary-plugin"

export class PluginManager {
  private plugins: Plugin[]

  constructor() {
    // Register all plugins
    this.plugins = [new WeatherPlugin(), new CalculatorPlugin(), new DictionaryPlugin()]
  }

  async processMessage(message: string): Promise<PluginResponse> {
    // Check for slash commands first
    for (const plugin of this.plugins) {
      for (const trigger of plugin.triggers) {
        const match = message.match(trigger)
        if (match) {
          try {
            const { response, data } = await plugin.execute(match[1]?.trim() || "")
            return {
              isPlugin: true,
              pluginName: plugin.name,
              response,
              pluginData: data,
            }
          } catch (error) {
            console.error(`Error executing plugin ${plugin.name}:`, error)
            return {
              isPlugin: false,
              response: `I had trouble processing your ${plugin.name} request. Please try again.`,
            }
          }
        }
      }
    }

    // Check for natural language triggers
    for (const plugin of this.plugins) {
      if (plugin.naturalLanguageTriggers) {
        for (const trigger of plugin.naturalLanguageTriggers) {
          if (message.toLowerCase().includes(trigger.toLowerCase())) {
            // Extract the query part after the trigger
            const parts = message.toLowerCase().split(trigger.toLowerCase())
            const query = parts[1]?.trim() || ""

            try {
              const { response, data } = await plugin.execute(query)
              return {
                isPlugin: true,
                pluginName: plugin.name,
                response,
                pluginData: data,
              }
            } catch (error) {
              console.error(`Error executing plugin ${plugin.name}:`, error)
              return {
                isPlugin: false,
                response: `I had trouble processing your ${plugin.name} request. Please try again.`,
              }
            }
          }
        }
      }
    }

    // If no plugin matches, return a default response
    return {
      isPlugin: false,
      response: this.generateDefaultResponse(message),
    }
  }

  private generateDefaultResponse(message: string): string {
    // Simple response generation for non-plugin messages
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! How can I help you today?"
    }

    if (lowerMessage.includes("help")) {
      return 'I can help you with various tasks. Try using slash commands like /weather [city], /calc [expression], or /define [word]. You can also ask me questions in natural language like "What\'s the weather in Paris?" or "Calculate 25 * 4".'
    }

    if (lowerMessage.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?"
    }

    // Default fallback response
    return "I'm not sure how to respond to that. You can try using one of my tools with slash commands like /weather, /calc, or /define."
  }

  getAvailablePlugins(): Plugin[] {
    return this.plugins
  }
}
