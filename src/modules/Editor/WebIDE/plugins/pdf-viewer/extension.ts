import { IPlugin, IPluginContext, Disposable } from '../../types'
import { pdfEditorProvider } from './PDFEditorProvider'

/**
 * PDF 查看器插件
 * WebIDE 的第一个示例插件
 */
export class PDFViewerPlugin implements IPlugin {
  readonly id = 'pdf-viewer'
  readonly name = 'PDF Viewer'
  readonly version = '1.0.0'
  readonly description = 'View PDF documents in the IDE'

  private subscriptions: Disposable[] = []

  /**
   * 插件激活
   */
  async activate(context: IPluginContext): Promise<void> {
    console.log('[PDFViewerPlugin] Activating PDF Viewer plugin...')

    try {
      // 注册 PDF 查看器命令
      this.registerCommands(context)
      
      // 注册自定义编辑器
      this.registerCustomEditor(context)
      
      // 监听文件打开事件
      this.setupEventListeners(context)

      console.log('[PDFViewerPlugin] PDF Viewer plugin activated successfully')
    } catch (error) {
      console.error('[PDFViewerPlugin] Failed to activate plugin:', error)
      throw error
    }
  }

  /**
   * 插件停用
   */
  async deactivate(): Promise<void> {
    console.log('[PDFViewerPlugin] Deactivating PDF Viewer plugin...')
    
    // 清理所有订阅
    this.subscriptions.forEach(subscription => {
      try {
        subscription.dispose()
      } catch (error) {
        console.error('[PDFViewerPlugin] Error disposing subscription:', error)
      }
    })
    this.subscriptions = []

    console.log('[PDFViewerPlugin] PDF Viewer plugin deactivated')
  }

  /**
   * 注册命令
   */
  private registerCommands(context: IPluginContext): void {
    // 打开 PDF 命令
    const openCommand = context.commands.registerCommand(
      'pdfViewer.open',
      this.openPDF.bind(this)
    )
    this.subscriptions.push(openCommand)

    // 缩放命令
    const zoomInCommand = context.commands.registerCommand(
      'pdfViewer.zoomIn',
      this.zoomIn.bind(this)
    )
    this.subscriptions.push(zoomInCommand)

    const zoomOutCommand = context.commands.registerCommand(
      'pdfViewer.zoomOut',
      this.zoomOut.bind(this)
    )
    this.subscriptions.push(zoomOutCommand)

    const resetZoomCommand = context.commands.registerCommand(
      'pdfViewer.resetZoom',
      this.resetZoom.bind(this)
    )
    this.subscriptions.push(resetZoomCommand)

    console.log('[PDFViewerPlugin] Commands registered')
  }

  /**
   * 注册自定义编辑器
   */
  private registerCustomEditor(context: IPluginContext): void {
    const customEditor = context.customEditors.registerCustomEditor(
      'pdfViewer.preview',
      pdfEditorProvider
    )
    this.subscriptions.push(customEditor)

    console.log('[PDFViewerPlugin] Custom editor registered')
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(context: IPluginContext): void {
    // 监听文件打开事件
    const fileOpenListener = context.eventBus.on('file.opened', (data: any) => {
      if (data.uri && data.uri.endsWith('.pdf')) {
        console.log('[PDFViewerPlugin] PDF file opened:', data.uri)
        // 可以在这里做一些额外的处理
      }
    })
    this.subscriptions.push(fileOpenListener)

    console.log('[PDFViewerPlugin] Event listeners setup')
  }

  // ========== 命令实现 ==========

  /**
   * 打开 PDF 文件
   */
  private async openPDF(uri?: string): Promise<void> {
    console.log('[PDFViewerPlugin] Opening PDF:', uri)
    
    if (!uri) {
      console.warn('[PDFViewerPlugin] No URI provided for PDF open')
      return
    }

    try {
      // 在实际实现中，这里会通知编辑器打开指定的 PDF 文件
      // 现在只是输出日志
      console.log(`[PDFViewerPlugin] Would open PDF file: ${uri}`)
    } catch (error) {
      console.error('[PDFViewerPlugin] Error opening PDF:', error)
    }
  }

  /**
   * 放大
   */
  private zoomIn(): void {
    console.log('[PDFViewerPlugin] Zoom in command')
    // 在实际实现中，这里会调用当前活动的 PDF 查看器的 zoomIn 方法
  }

  /**
   * 缩小
   */
  private zoomOut(): void {
    console.log('[PDFViewerPlugin] Zoom out command')
    // 在实际实现中，这里会调用当前活动的 PDF 查看器的 zoomOut 方法
  }

  /**
   * 重置缩放
   */
  private resetZoom(): void {
    console.log('[PDFViewerPlugin] Reset zoom command')
    // 在实际实现中，这里会调用当前活动的 PDF 查看器的 resetZoom 方法
  }

  // ========== 实用方法 ==========

  /**
   * 获取插件状态
   */
  getStatus(): { active: boolean; commandsRegistered: number } {
    return {
      active: this.subscriptions.length > 0,
      commandsRegistered: this.subscriptions.length
    }
  }

  /**
   * 检查文件是否支持
   */
  static canHandle(uri: string): boolean {
    return uri.toLowerCase().endsWith('.pdf')
  }
}

// 创建插件实例
export const pdfViewerPlugin = new PDFViewerPlugin() 