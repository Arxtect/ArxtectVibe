import { 
  ICustomEditorService, 
  ICustomEditorProvider, 
  Disposable 
} from '../../types'

/**
 * 自定义编辑器服务
 * 管理所有自定义编辑器的注册和选择
 */
export class CustomEditorService implements ICustomEditorService {
  private providers = new Map<string, ICustomEditorProvider>()

  /**
   * 注册自定义编辑器
   */
  registerCustomEditor(viewType: string, provider: ICustomEditorProvider): Disposable {
    console.log(`[CustomEditorService] Registering custom editor: ${viewType}`)
    
    if (this.providers.has(viewType)) {
      console.warn(`[CustomEditorService] Custom editor ${viewType} is already registered, replacing...`)
    }
    
    this.providers.set(viewType, provider)
    
    return {
      dispose: () => {
        this.unregisterCustomEditor(viewType)
      }
    }
  }

  /**
   * 获取自定义编辑器
   */
  getCustomEditor(uri: string): ICustomEditorProvider | undefined {
    for (const provider of this.providers.values()) {
      if (provider.canEdit(uri)) {
        return provider
      }
    }
    return undefined
  }

  /**
   * 根据视图类型获取编辑器
   */
  getCustomEditorByViewType(viewType: string): ICustomEditorProvider | undefined {
    return this.providers.get(viewType)
  }

  /**
   * 获取所有自定义编辑器
   */
  getAllCustomEditors(): Array<{ viewType: string; provider: ICustomEditorProvider }> {
    return Array.from(this.providers.entries()).map(([viewType, provider]) => ({
      viewType,
      provider
    }))
  }

  /**
   * 注销自定义编辑器
   */
  unregisterCustomEditor(viewType: string): boolean {
    console.log(`[CustomEditorService] Unregistering custom editor: ${viewType}`)
    return this.providers.delete(viewType)
  }

  /**
   * 检查是否有可用的自定义编辑器
   */
  hasCustomEditor(uri: string): boolean {
    return this.getCustomEditor(uri) !== undefined
  }

  /**
   * 获取支持指定文件的所有编辑器
   */
  getAvailableEditors(uri: string): ICustomEditorProvider[] {
    return Array.from(this.providers.values()).filter(provider => provider.canEdit(uri))
  }

  /**
   * 清空所有自定义编辑器
   */
  clear(): void {
    console.log('[CustomEditorService] Clearing all custom editors')
    this.providers.clear()
  }

  /**
   * 获取编辑器数量
   */
  size(): number {
    return this.providers.size
  }
}

// 创建全局自定义编辑器服务实例
export const customEditorService = new CustomEditorService() 