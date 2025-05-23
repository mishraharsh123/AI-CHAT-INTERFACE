export interface Message {
  id: string
  sender: "user" | "assistant"
  content: string
  type: "text" | "plugin"
  pluginName?: string
  pluginData?: any
  timestamp: string
}

export interface Plugin {
  name: string
  description: string
  triggers: RegExp[]
  naturalLanguageTriggers?: string[]
  execute: (input: string) => Promise<{
    response: string
    data: any
  }>
}

export interface PluginResponse {
  isPlugin: boolean
  pluginName?: string
  response: string
  pluginData?: any
}
