export interface AIFunction {
  name: string
  description: string
  parameters: Record<string, any>
  execute: (params: any) => Promise<any>
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'function'
  content: string
  function_call?: {
    name: string
    arguments: string
  }
  tool_calls?: ToolCall[]
  timestamp: number
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface AIAgentConfig {
  provider: 'openai' | 'anthropic' | 'local'
  model: string
  apiKey?: string
  baseURL?: string
  temperature?: number
  maxTokens?: number
  functions?: AIFunction[]
  systemPrompt?: string
}

export interface AIInlineCompletion {
  text: string
  range: {
    startLineNumber: number
    startColumn: number
    endLineNumber: number
    endColumn: number
  }
  confidence: number
  reasoning?: string
}

export interface AIConversation {
  id: string
  messages: AIMessage[]
  context: {
    fileId: string
    fileName: string
    cursorPosition: { line: number; column: number }
    selectedText?: string
    documentContent?: string
  }
  isActive: boolean
  timestamp: number
}

export interface AIAgentState {
  isEnabled: boolean
  config: AIAgentConfig
  conversations: AIConversation[]
  activeConversationId: string | null
  isGenerating: boolean
  inlineCompletion: AIInlineCompletion | null
} 