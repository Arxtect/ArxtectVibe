import { ICommandService, ICommand, Disposable } from '../../types'

/**
 * 命令服务
 * 管理所有命令的注册和执行
 */
export class CommandService implements ICommandService {
  private commands = new Map<string, (...args: any[]) => any>()
  private commandMetadata = new Map<string, ICommand>()

  /**
   * 注册命令
   */
  registerCommand(id: string, handler: (...args: any[]) => any): Disposable {
    console.log(`[CommandService] Registering command: ${id}`)
    
    if (this.commands.has(id)) {
      console.warn(`[CommandService] Command ${id} is already registered, replacing...`)
    }
    
    this.commands.set(id, handler)
    
    // 如果没有元数据，创建基本元数据
    if (!this.commandMetadata.has(id)) {
      this.commandMetadata.set(id, {
        id,
        title: id, // 使用 ID 作为默认标题
        category: 'General'
      })
    }
    
    return {
      dispose: () => {
        this.unregisterCommand(id)
      }
    }
  }

  /**
   * 注册命令（带元数据）
   */
  registerCommandWithMetadata(command: ICommand, handler: (...args: any[]) => any): Disposable {
    console.log(`[CommandService] Registering command with metadata: ${command.id}`)
    
    this.commandMetadata.set(command.id, command)
    return this.registerCommand(command.id, handler)
  }

  /**
   * 执行命令
   */
  async executeCommand<T>(id: string, ...args: any[]): Promise<T> {
    console.log(`[CommandService] Executing command: ${id}`, args)
    
    const handler = this.commands.get(id)
    if (!handler) {
      throw new Error(`Command ${id} not found`)
    }
    
    try {
      const result = await handler(...args)
      console.log(`[CommandService] Command ${id} executed successfully`)
      return result
    } catch (error) {
      console.error(`[CommandService] Error executing command ${id}:`, error)
      throw error
    }
  }

  /**
   * 获取所有命令
   */
  getCommands(): ICommand[] {
    return Array.from(this.commandMetadata.values())
  }

  /**
   * 获取命令元数据
   */
  getCommand(id: string): ICommand | undefined {
    return this.commandMetadata.get(id)
  }

  /**
   * 检查命令是否存在
   */
  hasCommand(id: string): boolean {
    return this.commands.has(id)
  }

  /**
   * 注销命令
   */
  unregisterCommand(id: string): boolean {
    console.log(`[CommandService] Unregistering command: ${id}`)
    
    const hasCommand = this.commands.delete(id)
    this.commandMetadata.delete(id)
    
    return hasCommand
  }

  /**
   * 获取所有命令 ID
   */
  getAllCommandIds(): string[] {
    return Array.from(this.commands.keys())
  }

  /**
   * 根据分类获取命令
   */
  getCommandsByCategory(category: string): ICommand[] {
    return this.getCommands().filter(cmd => cmd.category === category)
  }

  /**
   * 搜索命令
   */
  searchCommands(query: string): ICommand[] {
    const lowerQuery = query.toLowerCase()
    return this.getCommands().filter(cmd => 
      cmd.id.toLowerCase().includes(lowerQuery) ||
      cmd.title.toLowerCase().includes(lowerQuery) ||
      (cmd.category && cmd.category.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * 清空所有命令
   */
  clear(): void {
    console.log('[CommandService] Clearing all commands')
    this.commands.clear()
    this.commandMetadata.clear()
  }

  /**
   * 获取命令数量
   */
  size(): number {
    return this.commands.size
  }
}

// 创建全局命令服务实例
export const commandService = new CommandService() 