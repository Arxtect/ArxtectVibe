import React from 'react'
import { IPlugin, IPluginContext, AIAgentConfig, AIFunction } from '../../types'

// 简化的 AI 服务实现
class AIServiceImpl {
  private config: AIAgentConfig
  private isInitialized = false

  constructor(config: AIAgentConfig) {
    this.config = config
  }

  async initialize(): Promise<void> {
    console.log('[AIService] Initializing AI service with provider:', this.config.provider)
    await new Promise(resolve => setTimeout(resolve, 100))
    this.isInitialized = true
  }

  async generateCompletion(prompt: string, _context?: any): Promise<string> {
    console.log('[AI Assistant] Generating completion for:', prompt)
    
    // 模拟AI生成过程
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`% AI建议的LaTeX代码
\\section{${prompt.includes('section') ? '新章节' : '内容'}}
这是基于提示"${prompt}"生成的内容。`)
      }, 1500)
    })
  }

  async generateInlineCompletion(_documentContent: string, cursorPosition: { line: number; column: number }) {
    if (!this.isInitialized) return null
    return {
      text: '\\section{Introduction}',
      range: {
        startLineNumber: cursorPosition.line,
        startColumn: cursorPosition.column,
        endLineNumber: cursorPosition.line,
        endColumn: cursorPosition.column,
      },
      confidence: 0.8,
      reasoning: 'Detected need for a section heading'
    }
  }

  async processMessages(messages: any[]) {
    const lastMessage = messages[messages.length - 1]
    return {
      id: `ai_${Date.now()}`,
      role: 'assistant',
      content: `AI response to: ${lastMessage.content}`,
      timestamp: Date.now()
    }
  }

  async callFunction(functionName: string, parameters: any): Promise<any> {
    const func = this.config.functions?.find(f => f.name === functionName)
    if (!func) {
      throw new Error(`Function ${functionName} not found`)
    }
    return await func.execute(parameters)
  }

  updateConfig(newConfig: Partial<AIAgentConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  isEnabled(): boolean {
    return this.isInitialized
  }

  getAvailableFunctions(): AIFunction[] {
    return this.config.functions || []
  }
}

/**
 * AI Assistant Plugin
 * 提供 AI 驱动的 LaTeX 编写助手功能
 */
export class AIAssistantPlugin implements IPlugin {
  readonly id = 'ai-assistant'
  readonly name = 'AI Assistant'
  readonly version = '1.0.0'
  readonly description = 'AI-powered LaTeX writing assistant with function calling capabilities'

  private aiService: AIServiceImpl | null = null
  private context: IPluginContext | null = null

  async activate(context: IPluginContext): Promise<void> {
    console.log('[AI Assistant] Activating plugin...')
    this.context = context

    try {
      // 初始化 AI 服务
      await this.initializeAIService()

      // 注册命令
      this.registerCommands(context)

      // 注册视图
      this.registerViews(context)

      // 注册菜单
      this.registerMenus(context)

      console.log('[AI Assistant] Plugin activated successfully')

    } catch (error) {
      console.error('[AI Assistant] Failed to activate plugin:', error)
      throw error
    }
  }

  async deactivate(): Promise<void> {
    console.log('[AI Assistant] Deactivating plugin...')
    
    if (this.aiService) {
      this.aiService = null
    }

    this.context = null
  }

  private async initializeAIService(): Promise<void> {
    // 创建 AI 功能函数
    const aiFunctions: AIFunction[] = [
      {
        name: 'insert_latex_command',
        description: 'Insert a LaTeX command at the current cursor position',
        parameters: {
          type: 'object',
          properties: {
            command: { type: 'string', description: 'LaTeX command name without backslash' },
            parameters: { type: 'string', description: 'Command parameters in curly braces' }
          },
          required: ['command']
        },
        execute: async (params: any) => {
          return this.insertLatexCommand(params.command, params.parameters)
        }
      }
    ]

    // AI 配置
    const config: AIAgentConfig = {
      provider: 'openai',
      model: 'gpt-4',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      temperature: 0.3,
      maxTokens: 2000,
      functions: aiFunctions,
      systemPrompt: 'You are an expert LaTeX assistant.'
    }

    // 创建 AI 服务实例
    this.aiService = new AIServiceImpl(config)
    await this.aiService.initialize()
  }

  private registerCommands(context: IPluginContext): void {
    // 生成 AI 补全
    context.subscriptions.push(
      context.commands.registerCommand('aiAssistant.generateCompletion', async () => {
        await this.generateCompletion()
      })
    )

    // 插入 LaTeX 命令
    context.subscriptions.push(
      context.commands.registerCommand('aiAssistant.insertLatexCommand', async () => {
        await this.showInsertCommandDialog()
      })
    )
  }

  private registerViews(context: IPluginContext): void {
    // 注册聊天视图
    context.subscriptions.push(
      context.ui.registerView('aiAssistant.chat', {
        id: 'aiAssistant.chat',
        title: 'AI Chat',
        render: () => this.renderChatView()
      })
    )
  }

  private registerMenus(context: IPluginContext): void {
    // 编辑器右键菜单
    context.subscriptions.push(
      context.menus.registerMenu('editor/context', [{
        command: 'aiAssistant.generateCompletion',
        title: '✨ Generate AI Completion',
        group: 'ai'
      }])
    )
  }

  private async generateCompletion(): Promise<void> {
    if (!this.aiService || !this.context) {
      this.context?.ui.showMessage('AI service not available', 'error')
      return
    }

    try {
      const completion = await this.aiService.generateCompletion('LaTeX completion request')
      this.context.ui.showMessage('AI completion generated', 'success')
      console.log('[AI Assistant] Generated completion:', completion)
    } catch (error) {
      console.error('[AI Assistant] Failed to generate completion:', error)
      this.context.ui.showMessage('Failed to generate completion', 'error')
    }
  }

  private async showInsertCommandDialog(): Promise<void> {
    if (!this.context) return

    const command = await this.context.ui.showInputBox({
      prompt: 'Enter LaTeX command name (without backslash):',
      placeholder: 'section, begin, usepackage...'
    })

    if (command) {
      const parameters = await this.context.ui.showInputBox({
        prompt: 'Enter command parameters (optional):',
        placeholder: 'Introduction, amsmath...'
      })

      await this.insertLatexCommand(command, parameters)
    }
  }

  private async insertLatexCommand(command: string, parameters?: string): Promise<any> {
    console.log(`[AI Assistant] Inserting LaTeX command: \\${command}`)
    
    let latexCode = `\\${command}`
    if (parameters) {
      latexCode += `{${parameters}}`
    }

    // 模拟在光标位置插入代码
    console.log(`[AI Assistant] Would insert: ${latexCode}`)

    return {
      success: true,
      inserted: latexCode,
      description: `Inserted LaTeX command: ${latexCode}`
    }
  }

  private renderChatView(): React.ReactElement {
    return React.createElement('div', {
      style: { padding: '16px' }
    }, [
      React.createElement('h3', { key: 'title' }, '🤖 AI Chat'),
      React.createElement('div', { key: 'content' }, 'AI chat interface ready!'),
      React.createElement('button', { 
        key: 'button',
        onClick: () => this.generateCompletion(),
        style: { marginTop: '10px', padding: '5px 10px' }
      }, 'Generate LaTeX')
    ])
  }
}

// 导出插件实例
export default new AIAssistantPlugin() 