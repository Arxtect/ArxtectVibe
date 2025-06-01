import React, { useState, useEffect } from 'react'

interface CompileLogEntry {
  type: 'info' | 'warning' | 'error'
  message: string
  file?: string
  line?: number
  timestamp: number
}

interface CompilerOutputViewProps {
  logs: CompileLogEntry[]
  onClear?: () => void
  onExport?: () => void
}

export const CompilerOutputViewComponent: React.FC<CompilerOutputViewProps> = ({
  logs,
  onClear,
  onExport
}) => {
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll) {
      const container = document.getElementById('compiler-output-container')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [logs, autoScroll])

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-700 dark:text-gray-300'
    }
  }

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          ⚡ Compiler Output
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-xs px-2 py-1 rounded ${
              autoScroll 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Auto-scroll
          </button>
          {onClear && (
            <button
              onClick={onClear}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Export
            </button>
          )}
        </div>
      </div>

      <div
        id="compiler-output-container"
        className="flex-1 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 font-mono text-xs"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">
            <div className="text-lg mb-2">🔧</div>
            <div>Ready for compilation</div>
            <div className="text-xs mt-2">Press Ctrl+Shift+B to compile LaTeX document</div>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`mb-1 flex items-start space-x-2 ${getLogTypeColor(log.type)}`}
            >
              <span className="flex-shrink-0">
                {getLogTypeIcon(log.type)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 w-20">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <div className="flex-1">
                <div>{log.message}</div>
                {log.file && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    📄 {log.file}
                    {log.line && ` (line ${log.line})`}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// 兼容类版本用于插件系统
export class CompilerOutputView {
  private logs: CompileLogEntry[]

  constructor(
    private webviewView: any,
    initialLogs: CompileLogEntry[] = []
  ) {
    this.logs = initialLogs
    this.render()
  }

  updateLogs(logs: CompileLogEntry[]): void {
    this.logs = logs
    this.render()
  }

  private render(): void {
    // 在实际实现中，这里会将 React 组件渲染到 webview 中
    // 目前先简化处理
    console.log('[CompilerOutputView] Rendering with logs:', this.logs.length)
  }

  dispose(): void {
    // 清理资源
    this.logs = []
  }
} 