import { IPlugin, IPluginContext } from '../../types'
import { CompilerOutputView, CompilerOutputViewComponent } from './CompilerOutputView'
import React from 'react'

interface CompileLogEntry {
  type: 'info' | 'warning' | 'error'
  message: string
  file?: string
  line?: number
  timestamp: number
}

interface CompileResult {
  success: boolean
  pdfBuffer?: Uint8Array
  logs: CompileLogEntry[]
}

export class LaTeXCompilerPlugin implements IPlugin {
  readonly id = 'latex-compiler'
  readonly name = 'LaTeX Compiler'
  readonly version = '1.0.0'
  readonly description = 'WebAssembly-based LaTeX compiler with real-time compilation and error reporting'

  private context: IPluginContext | null = null
  private outputView: CompilerOutputView | null = null
  private compilationLogs: CompileLogEntry[] = []
  private isCompiling = false

  async activate(context: IPluginContext): Promise<void> {
    this.context = context
    console.log('[LaTeX Compiler] Plugin activating...')

    // 注册编译命令
    const compileCommand = context.commands.registerCommand(
      'latexCompiler.compile',
      this.compileDocument.bind(this)
    )

    const compileAndPreviewCommand = context.commands.registerCommand(
      'latexCompiler.compileAndPreview',
      this.compileAndPreview.bind(this)
    )

    const clearLogsCommand = context.commands.registerCommand(
      'latexCompiler.clearLogs',
      this.clearLogs.bind(this)
    )

    const exportLogsCommand = context.commands.registerCommand(
      'latexCompiler.exportLogs',
      this.exportLogs.bind(this)
    )

    // 注册输出视图
    const outputViewProvider = {
      id: 'latexCompiler.output',
      title: 'Compiler Output',
      render: () => {
        return React.createElement(CompilerOutputViewComponent, {
          logs: this.compilationLogs,
          onClear: this.clearLogs.bind(this),
          onExport: this.exportLogs.bind(this)
        } as any) // 临时类型断言
      }
    }

    // 注册视图容器和视图
    const viewContainer = context.ui.registerViewContainer({
      id: 'latexCompiler',
      title: 'LaTeX Compiler',
      icon: 'terminal'
    })

    const outputView = context.ui.registerView('latexCompiler.output', outputViewProvider)

    // 设置上下文
    context.commands.executeCommand('setContext', 'latexCompiler.hasProject', true)

    // 注册所有 disposables
    context.subscriptions.push(
      compileCommand,
      compileAndPreviewCommand,
      clearLogsCommand,
      exportLogsCommand,
      viewContainer,
      outputView
    )

    console.log('[LaTeX Compiler] Plugin activated successfully')
  }

  async deactivate(): Promise<void> {
    this.outputView?.dispose()
    this.outputView = null
    this.context = null
    console.log('[LaTeX Compiler] Plugin deactivated')
  }

  private async compileDocument(): Promise<void> {
    if (!this.context) return
    
    try {
      this.isCompiling = true
      this.addLog('info', 'Starting LaTeX compilation...')
      
      // 获取当前工作区的主文档（模拟）
      const workspaceUri = this.context.workspaceUri
      const mainTexFile = `${workspaceUri}/main.tex`
      
      // 模拟编译过程（实际实现中会调用 WebAssembly LaTeX 编译器）
      const result = await this.performCompilation(mainTexFile)
      
      if (result.success) {
        this.addLog('info', 'Compilation completed successfully')
        if (result.pdfBuffer) {
          // 通知 PDF 预览插件更新
          this.context.eventBus.emit('latex.pdfGenerated', {
            uri: mainTexFile,
            pdfBuffer: result.pdfBuffer
          })
        }
      } else {
        this.addLog('error', 'Compilation failed')
      }

      // 触发视图更新（简化处理）
      this.context.eventBus.emit('latexCompiler.logsUpdated', this.compilationLogs)
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown compilation error'
      this.addLog('error', `Compilation error: ${message}`)
    } finally {
      this.isCompiling = false
    }
  }

  private async compileAndPreview(): Promise<void> {
    await this.compileDocument()
    
    // 触发 PDF 预览显示
    if (this.context) {
      this.context.commands.executeCommand('pdfViewer.show')
    }
  }

  private clearLogs(): void {
    this.compilationLogs = []
    this.context?.eventBus.emit('latexCompiler.logsUpdated', this.compilationLogs)
    this.addLog('info', 'Logs cleared')
  }

  private async exportLogs(): Promise<void> {
    const logsText = this.compilationLogs
      .map(log => `[${new Date(log.timestamp).toISOString()}] ${log.type.toUpperCase()}: ${log.message}`)
      .join('\n')
    
    // 创建下载链接
    const blob = new Blob([logsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `latex-compilation-logs-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    this.addLog('info', 'Logs exported successfully')
  }

  private async performCompilation(_documentUri: string): Promise<CompileResult> {
    // 模拟编译延迟和过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟编译日志
    this.addLog('info', 'Reading LaTeX document...')
    await new Promise(resolve => setTimeout(resolve, 500))
    
    this.addLog('info', 'Processing packages...')
    await new Promise(resolve => setTimeout(resolve, 800))
    
    this.addLog('info', 'Generating PDF...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟成功编译
    const success = Math.random() > 0.3 // 70% 成功率
    
    if (success) {
      // 创建一个模拟的 PDF buffer
      const pdfBuffer = new Uint8Array([
        0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, // %PDF-1.4
        0x0A, 0x25, 0xC4, 0xE5, 0xF2, 0xE5, 0xEB, 0xA7, 0xF3, 0xA0, 0xD0, 0xC4, 0xC6
      ])
      
      return {
        success: true,
        pdfBuffer,
        logs: [...this.compilationLogs]
      }
    } else {
      this.addLog('error', 'LaTeX Error: Undefined control sequence \\undefinedcommand')
      this.addLog('error', 'Error occurred in file main.tex at line 42')
      
      return {
        success: false,
        logs: [...this.compilationLogs]
      }
    }
  }

  private addLog(type: CompileLogEntry['type'], message: string, file?: string, line?: number): void {
    const logEntry: CompileLogEntry = {
      type,
      message,
      file,
      line,
      timestamp: Date.now()
    }
    
    this.compilationLogs.push(logEntry)
    console.log(`[LaTeX Compiler] ${type.toUpperCase()}: ${message}`)
  }

  // 公共 API 方法供其他插件调用
  public async compile(documentUri?: string): Promise<CompileResult> {
    if (this.isCompiling) {
      throw new Error('Compilation already in progress')
    }
    
    return this.performCompilation(documentUri || '')
  }

  public getLogs(): CompileLogEntry[] {
    return [...this.compilationLogs]
  }

  public isCompilationInProgress(): boolean {
    return this.isCompiling
  }
}

export default LaTeXCompilerPlugin 