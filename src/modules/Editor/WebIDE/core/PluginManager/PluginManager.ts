import { 
  IPluginManager, 
  IPlugin, 
  IPluginManifest, 
  IPluginContext,
  IFileSystem,
  IEventBus,
  IServiceRegistry,
  ICommandService,
  IMenuService,
  ICustomEditorService,
  IUIProvider,
  Disposable
} from '../../types'

/**
 * 插件管理器
 * 负责插件的加载、激活、停用和生命周期管理
 */
export class PluginManager implements IPluginManager {
  private plugins = new Map<string, IPlugin>()
  private activePlugins = new Set<string>()
  private pluginContexts = new Map<string, IPluginContext>()
  
  constructor(
    private fileSystem: IFileSystem,
    private eventBus: IEventBus,
    private serviceRegistry: IServiceRegistry,
    private commandService: ICommandService,
    private menuService: IMenuService,
    private customEditorService: ICustomEditorService,
    private uiProvider: IUIProvider,
    private workspaceUri: string = '/projects'
  ) {
    console.log('[PluginManager] Initializing plugin manager')
  }

  /**
   * 加载插件
   */
  async loadPlugin(manifest: IPluginManifest): Promise<IPlugin> {
    console.log(`[PluginManager] Loading plugin: ${manifest.id}`)
    
    if (this.plugins.has(manifest.id)) {
      console.warn(`[PluginManager] Plugin ${manifest.id} is already loaded`)
      return this.plugins.get(manifest.id)!
    }

    try {
      // 检查依赖
      await this.checkDependencies(manifest)
      
      // 动态导入插件
      const plugin = await this.importPlugin(manifest)
      
      // 存储插件
      this.plugins.set(manifest.id, plugin)
      
      console.log(`[PluginManager] Plugin ${manifest.id} loaded successfully`)
      
      // 发送插件加载事件
      this.eventBus.emit('plugin.loaded', { plugin, manifest })
      
      return plugin
    } catch (error) {
      console.error(`[PluginManager] Failed to load plugin ${manifest.id}:`, error)
      this.eventBus.emit('plugin.error', { 
        plugin: { id: manifest.id, name: manifest.name }, 
        error 
      })
      throw error
    }
  }

  /**
   * 激活插件
   */
  async activatePlugin(id: string): Promise<void> {
    console.log(`[PluginManager] Activating plugin: ${id}`)
    
    const plugin = this.plugins.get(id)
    if (!plugin) {
      throw new Error(`Plugin ${id} not found`)
    }

    if (this.activePlugins.has(id)) {
      console.warn(`[PluginManager] Plugin ${id} is already active`)
      return
    }

    try {
      // 创建插件上下文
      const context = this.createPluginContext(plugin)
      this.pluginContexts.set(id, context)
      
      // 激活插件
      await plugin.activate(context)
      
      // 标记为已激活
      this.activePlugins.add(id)
      
      console.log(`[PluginManager] Plugin ${id} activated successfully`)
      
      // 发送插件激活事件
      this.eventBus.emit('plugin.activated', { plugin })
      
    } catch (error) {
      console.error(`[PluginManager] Failed to activate plugin ${id}:`, error)
      
      // 清理上下文
      this.pluginContexts.delete(id)
      
      this.eventBus.emit('plugin.error', { plugin, error })
      throw error
    }
  }

  /**
   * 停用插件
   */
  async deactivatePlugin(id: string): Promise<void> {
    console.log(`[PluginManager] Deactivating plugin: ${id}`)
    
    const plugin = this.plugins.get(id)
    if (!plugin) {
      throw new Error(`Plugin ${id} not found`)
    }

    if (!this.activePlugins.has(id)) {
      console.warn(`[PluginManager] Plugin ${id} is not active`)
      return
    }

    try {
      // 停用插件
      await plugin.deactivate()
      
      // 清理上下文
      const context = this.pluginContexts.get(id)
      if (context) {
        this.cleanupContext(context)
        this.pluginContexts.delete(id)
      }
      
      // 标记为未激活
      this.activePlugins.delete(id)
      
      console.log(`[PluginManager] Plugin ${id} deactivated successfully`)
      
      // 发送插件停用事件
      this.eventBus.emit('plugin.deactivated', { plugin })
      
    } catch (error) {
      console.error(`[PluginManager] Failed to deactivate plugin ${id}:`, error)
      this.eventBus.emit('plugin.error', { plugin, error })
      throw error
    }
  }

  /**
   * 获取插件
   */
  getPlugin(id: string): IPlugin | undefined {
    return this.plugins.get(id)
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): IPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 检查插件是否激活
   */
  isActive(id: string): boolean {
    return this.activePlugins.has(id)
  }

  /**
   * 获取已激活的插件
   */
  getActivePlugins(): IPlugin[] {
    return Array.from(this.activePlugins).map(id => this.plugins.get(id)!).filter(Boolean)
  }

  /**
   * 卸载插件
   */
  async unloadPlugin(id: string): Promise<void> {
    console.log(`[PluginManager] Unloading plugin: ${id}`)
    
    // 先停用插件
    if (this.isActive(id)) {
      await this.deactivatePlugin(id)
    }
    
    // 移除插件
    this.plugins.delete(id)
    
    console.log(`[PluginManager] Plugin ${id} unloaded`)
    
    // 发送插件卸载事件
    this.eventBus.emit('plugin.unloaded', { id })
  }

  /**
   * 重新加载插件
   */
  async reloadPlugin(id: string, manifest: IPluginManifest): Promise<void> {
    console.log(`[PluginManager] Reloading plugin: ${id}`)
    
    const wasActive = this.isActive(id)
    
    // 卸载旧插件
    await this.unloadPlugin(id)
    
    // 加载新插件
    await this.loadPlugin(manifest)
    
    // 如果之前是激活状态，重新激活
    if (wasActive) {
      await this.activatePlugin(id)
    }
    
    console.log(`[PluginManager] Plugin ${id} reloaded`)
  }

  // ========== 私有方法 ==========

  /**
   * 检查插件依赖
   */
  private async checkDependencies(manifest: IPluginManifest): Promise<void> {
    if (!manifest.dependencies || manifest.dependencies.length === 0) {
      return
    }

    for (const depId of manifest.dependencies) {
      if (!this.plugins.has(depId)) {
        throw new Error(`Missing dependency: ${depId}`)
      }
    }
  }

  /**
   * 导入插件模块
   */
  private async importPlugin(manifest: IPluginManifest): Promise<IPlugin> {
    // 在实际实现中，这里会动态导入插件模块
    // 目前使用静态导入方式
    
    if (manifest.id === 'pdf-viewer') {
      const { pdfViewerPlugin } = await import('../../plugins/pdf-viewer/extension')
      return pdfViewerPlugin
    }
    
    if (manifest.id === 'ai-assistant') {
      const { default: AIAssistantPlugin } = await import('../../plugins/ai-assistant/extension')
      return AIAssistantPlugin
    }
    
    if (manifest.id === 'monaco-editor') {
      const { MonacoEditorPlugin } = await import('../../plugins/monaco-editor/extension')
      return new MonacoEditorPlugin()
    }
    
    if (manifest.id === 'plugin-manager') {
      const { PluginManagerPlugin } = await import('../../plugins/plugin-manager/extension')
      return new PluginManagerPlugin()
    }
    
    throw new Error(`Unknown plugin: ${manifest.id}`)
  }

  /**
   * 创建插件上下文
   */
  private createPluginContext(plugin: IPlugin): IPluginContext {
    const subscriptions: Disposable[] = []
    
    return {
      subscriptions,
      fileSystem: this.fileSystem,
      eventBus: this.eventBus,
      serviceRegistry: this.serviceRegistry,
      commands: this.commandService,
      menus: this.menuService,
      customEditors: this.customEditorService,
      ui: this.uiProvider,
      workspaceUri: this.workspaceUri,
      extensionUri: `/plugins/${plugin.id}`,
      globalState: {},
      workspaceState: {}
    }
  }

  /**
   * 清理插件上下文
   */
  private cleanupContext(context: IPluginContext): void {
    // 清理所有订阅
    context.subscriptions.forEach(subscription => {
      try {
        subscription.dispose()
      } catch (error) {
        console.error('[PluginManager] Error disposing subscription:', error)
      }
    })
    
    // 清空数组
    context.subscriptions.length = 0
  }

  /**
   * 获取插件统计信息
   */
  getStats(): {
    total: number
    active: number
    loaded: number
  } {
    return {
      total: this.plugins.size,
      active: this.activePlugins.size,
      loaded: this.plugins.size
    }
  }

  /**
   * 清理所有插件
   */
  async dispose(): Promise<void> {
    console.log('[PluginManager] Disposing all plugins')
    
    // 停用所有活跃插件
    const activePluginIds = Array.from(this.activePlugins)
    for (const id of activePluginIds) {
      try {
        await this.deactivatePlugin(id)
      } catch (error) {
        console.error(`[PluginManager] Error deactivating plugin ${id}:`, error)
      }
    }
    
    // 清理所有数据
    this.plugins.clear()
    this.activePlugins.clear()
    this.pluginContexts.clear()
    
    console.log('[PluginManager] All plugins disposed')
  }
} 