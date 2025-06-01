import React, { useState, useEffect, useRef } from 'react'
import { WebIDEProps } from './types'
import { eventBus } from './core/EventBus/EventBus'
import { serviceRegistry } from './core/Services/ServiceRegistry'
import { commandService } from './core/Services/CommandService'
import { customEditorService } from './core/Services/CustomEditorService'
import { PluginManager } from './core/PluginManager/PluginManager'
import { dataBridge } from '@/core/dataBridge'
import { useDataStore } from '@/core/dataBridge'

/**
 * WebIDE 主组件
 * VS Code 风格的插件化 Web IDE
 */
export const WebIDE: React.FC<WebIDEProps> = ({
  projectPath,
  plugins = ['pdf-viewer', 'ai-assistant', 'monaco-editor', 'plugin-manager'],
  theme = 'dark',
  enabledFeatures = {
    fileExplorer: true,
    terminal: false,
    git: false,
    debug: false
  },
  onReady,
  onError
}) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<string[]>([])
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  
  const pluginManagerRef = useRef<PluginManager | null>(null)

  // 从 projectPath 中提取 projectId
  const projectId = React.useMemo(() => {
    const pathParts = projectPath.split('/')
    return pathParts[pathParts.length - 1] || 'demo-project'
  }, [projectPath])

  // 添加用户状态监听
  const currentUser = useDataStore((state) => state.currentUser)

  // 初始化 WebIDE
  useEffect(() => {
    // 只有在用户已登录时才进行初始化
    if (currentUser) {
      initializeWebIDE()
    } else {
      console.log('[WebIDE] Waiting for user authentication...')
      setError('等待用户认证...')
    }
  }, [projectPath, currentUser]) // 添加 currentUser 作为依赖

  const initializeWebIDE = async () => {
    try {
      console.log('[WebIDE] Initializing WebIDE for user:', currentUser?.username)
      setError('')

      // 确保用户已登录
      if (!currentUser) {
        throw new Error('用户未登录')
      }

      // 1. 初始化项目空间（通过 DataBridge）
      await dataBridge.initializeProjectSpace(projectId)
      console.log('[WebIDE] Project space initialized')

      // 2. 注册核心服务
      serviceRegistry.register('eventBus', eventBus)
      serviceRegistry.register('commands', commandService)
      serviceRegistry.register('customEditors', customEditorService)
      console.log('[WebIDE] Core services registered')

      // 3. 创建简单的菜单和UI服务（占位实现）
      const menuService = {
        registerMenu: () => ({ dispose: () => {} }),
        getMenu: () => []
      }
      
      const uiProvider = {
        showMessage: (message: string, type = 'info') => {
          console.log(`[UI] ${type.toUpperCase()}: ${message}`)
        },
        showInputBox: async () => undefined,
        showQuickPick: async () => undefined,
        registerViewContainer: () => ({ dispose: () => {} }),
        registerView: () => ({ dispose: () => {} })
      }

      serviceRegistry.register('menus', menuService)
      serviceRegistry.register('ui', uiProvider)

      // 4. 初始化插件管理器（创建一个假的文件系统接口用于兼容）
      const mockFileSystem = {
        readFile: () => Promise.resolve(new Uint8Array()),
        writeFile: () => Promise.resolve(),
        exists: () => Promise.resolve(false),
        mkdir: () => Promise.resolve(),
        readdir: () => Promise.resolve([]),
        stat: () => Promise.resolve({} as any),
        watch: () => ({} as any),
        initialize: () => Promise.resolve()
      }

      pluginManagerRef.current = new PluginManager(
        mockFileSystem as any, // 提供兼容的文件系统接口
        eventBus,
        serviceRegistry,
        commandService,
        menuService,
        customEditorService,
        uiProvider,
        dataBridge.getProjectPath(projectId)
      )

      // 5. 加载和激活插件
      await loadPlugins(plugins)

      // 6. 加载项目文件
      await loadProjectFiles()

      setIsInitialized(true)
      console.log('[WebIDE] Initialization complete')
      onReady?.()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('[WebIDE] Initialization failed:', err)
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    }
  }

  // 加载插件
  const loadPlugins = async (pluginIds: string[]) => {
    if (!pluginManagerRef.current) return

    for (const pluginId of pluginIds) {
      try {
        // 创建插件清单（在实际实现中会从文件系统加载）
        const manifest = createPluginManifest(pluginId)
        
        // 加载并激活插件
        await pluginManagerRef.current.loadPlugin(manifest)
        await pluginManagerRef.current.activatePlugin(pluginId)
        
        console.log(`[WebIDE] Plugin ${pluginId} loaded and activated`)
      } catch (error) {
        console.error(`[WebIDE] Failed to load plugin ${pluginId}:`, error)
      }
    }
  }

  // 创建插件清单（临时实现）
  const createPluginManifest = (pluginId: string) => {
    if (pluginId === 'pdf-viewer') {
      return {
        id: 'pdf-viewer',
        name: 'PDF Viewer',
        version: '1.0.0',
        description: 'View PDF documents in the IDE',
        main: './extension.js',
        activationEvents: ['onFileOpen:*.pdf'],
        contributes: {
          customEditors: [{
            viewType: 'pdfViewer.preview',
            displayName: 'PDF Preview',
            selector: [{ filenamePattern: '*.pdf' }],
            priority: 'default' as const
          }]
        }
      }
    }
    
    if (pluginId === 'ai-assistant') {
      return {
        id: 'ai-assistant',
        name: 'AI Assistant',
        version: '1.0.0',
        description: 'AI-powered LaTeX writing assistant with function calling capabilities',
        main: './extension.js',
        activationEvents: ['*'],
        contributes: {
          commands: [
            {
              command: 'aiAssistant.toggle',
              title: 'Toggle AI Assistant Panel'
            },
            {
              command: 'aiAssistant.generateCompletion',
              title: 'Generate AI Completion'
            },
            {
              command: 'aiAssistant.insertLatexCommand',
              title: 'Insert LaTeX Command'
            },
            {
              command: 'aiAssistant.explainError',
              title: 'Explain LaTeX Error'
            }
          ]
        }
      }
    }
    
    if (pluginId === 'monaco-editor') {
      return {
        id: 'monaco-editor',
        name: 'Monaco Editor',
        version: '1.0.0',
        description: 'Advanced code editor with syntax highlighting and auto-completion',
        main: './extension.js',
        activationEvents: ['onFileOpen:*.tex', 'onFileOpen:*.md', 'onFileOpen:*.js', 'onFileOpen:*.ts'],
        contributes: {
          customEditors: [{
            viewType: 'monacoEditor.textEditor',
            displayName: 'Monaco Text Editor',
            selector: [
              { filenamePattern: '*.tex' },
              { filenamePattern: '*.md' },
              { filenamePattern: '*.js' },
              { filenamePattern: '*.ts' }
            ],
            priority: 'default' as const
          }],
          commands: [
            {
              command: 'monacoEditor.format',
              title: 'Format Document'
            },
            {
              command: 'monacoEditor.toggleMinimap',
              title: 'Toggle Minimap'
            }
          ]
        }
      }
    }
    
    if (pluginId === 'plugin-manager') {
      return {
        id: 'plugin-manager',
        name: 'Plugin Manager',
        version: '1.0.0',
        description: 'Manage WebIDE plugins - install, enable, disable, and configure plugins',
        main: './extension.js',
        activationEvents: ['*'],
        contributes: {
          commands: [
            {
              command: 'pluginManager.openView',
              title: 'Open Plugin Manager'
            },
            {
              command: 'pluginManager.refresh',
              title: 'Refresh Plugin List'
            }
          ]
        }
      }
    }
    
    throw new Error(`Unknown plugin: ${pluginId}`)
  }

  // 加载项目文件（通过 DataBridge）
  const loadProjectFiles = async () => {
    try {
      console.log(`[WebIDE] Loading project files for project: ${projectId}`)
      
      const projectFiles = await dataBridge.getProjectFiles(projectId)
      console.log(`[WebIDE] Loaded project files:`, projectFiles)
      setFiles(projectFiles)
      
      // 默认打开第一个 .tex 文件
      const texFile = projectFiles.find((file: string) => file.endsWith('.tex') && !file.includes('/'))
      const firstFile = texFile || projectFiles.find((file: string) => !file.endsWith('/'))
      
      if (firstFile) {
        await openFile(firstFile)
      }
    } catch (error) {
      console.error('[WebIDE] Failed to load project files:', error)
      setError(error instanceof Error ? error.message : 'Failed to load project files')
    }
  }

  // 打开文件（通过 DataBridge）
  const openFile = async (filePath: string) => {
    try {
      console.log(`[WebIDE] Opening file: ${filePath}`)
      
      const content = await dataBridge.readFile(projectId, filePath)
      setCurrentFile(filePath)
      setFileContent(content)
      
      // 发送文件打开事件
      const encoder = new TextEncoder()
      const buffer = new Uint8Array(encoder.encode(content)) as unknown as Buffer
      eventBus.emit('file.opened', { uri: filePath, content: buffer })
      
    } catch (error) {
      console.error(`[WebIDE] Failed to open file ${filePath}:`, error)
    }
  }

  // 保存文件（通过 DataBridge）
  const saveFile = async (filePath: string, content: string) => {
    try {
      await dataBridge.writeFile(projectId, filePath, content)
      console.log(`[WebIDE] File saved: ${filePath}`)
    } catch (error) {
      console.error(`[WebIDE] Failed to save file ${filePath}:`, error)
    }
  }

  // 文件点击处理
  const handleFileClick = async (fileName: string) => {
    try {
      // 如果点击的是目录，不做任何操作
      if (fileName.endsWith('/')) {
        console.log(`[WebIDE] Clicked directory: ${fileName}`)
        return
      }
      
      await openFile(fileName)
    } catch (error) {
      console.error(`[WebIDE] Failed to handle file click for ${fileName}:`, error)
    }
  }

  // 获取文件图标
  const getFileIcon = (fileName: string): string => {
    if (fileName.endsWith('/')) {
      return '📁' // 目录
    } else if (fileName.endsWith('.tex')) {
      return '📄' // LaTeX 文件
    } else if (fileName.endsWith('.pdf')) {
      return '📕' // PDF 文件
    } else if (fileName.endsWith('.md')) {
      return '📝' // Markdown 文件
    } else if (fileName.endsWith('.bib')) {
      return '📚' // 参考文献文件
    } else if (fileName.includes('section')) {
      return '📂' // 章节文件
    } else {
      return '📄' // 默认文件
    }
  }

  // 打开插件管理器
  const openPluginManager = () => {
    if (pluginManagerRef.current) {
      // 触发插件管理器的打开命令
      commandService.executeCommand('pluginManager.openView')
    }
  }

  // 渲染编辑器内容
  const renderEditor = () => {
    if (!currentFile || !fileContent) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-4">📁</div>
            <div>Select a file to open</div>
          </div>
        </div>
      )
    }

    // 检查是否有自定义编辑器
    const customEditor = customEditorService.getCustomEditor(currentFile)
    if (customEditor) {
      // 将字符串内容转换为 Buffer
      const encoder = new TextEncoder()
      const buffer = new Uint8Array(encoder.encode(fileContent)) as unknown as Buffer
      return customEditor.render(currentFile, buffer)
    }

    // 默认文本编辑器
    return (
      <div className="h-full p-4">
        <div className="mb-4 text-sm text-gray-500">
          Default Text Editor: {currentFile}
        </div>
        <textarea
          className="w-full h-full border border-gray-300 rounded p-4 font-mono text-sm"
          value={fileContent}
          onChange={async (e) => {
            const newContent = e.target.value
            setFileContent(newContent)
            // 自动保存（可以添加防抖）
            if (currentFile) {
              await saveFile(currentFile, newContent)
            }
          }}
          placeholder="File content..."
        />
      </div>
    )
  }

  // 加载中状态
  if (!isInitialized && !error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">Initializing WebIDE...</div>
          <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Loading plugins and file system
          </div>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4 text-red-500">⚠️</div>
          <div className="text-red-600 dark:text-red-400 mb-2">WebIDE Initialization Failed</div>
          <div className="text-gray-600 dark:text-gray-400 text-sm mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // 主界面
  return (
    <div className={`h-screen flex ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex-1 flex bg-white dark:bg-gray-900">
        {/* 文件浏览器侧边栏 */}
        {enabledFeatures.fileExplorer && (
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Files</h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {projectPath}
              </div>
            </div>
            <div className="p-2">
              {files.map((file) => (
                <div key={file} className="mb-1">
                  <button
                    onClick={() => handleFileClick(file)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      currentFile?.endsWith(file.replace(/\/$/, '')) // Remove trailing slash for comparison
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : file.endsWith('/') 
                          ? 'hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    disabled={file.endsWith('/')} // Disable directory clicking for now
                  >
                    <div className={`flex items-center ${
                      file.includes('/') && !file.endsWith('/') ? 'ml-4' : ''
                    }`}>
                      <span className="mr-2">
                        {getFileIcon(file)}
                      </span>
                      <span className={file.endsWith('/') ? 'font-medium text-gray-700 dark:text-gray-300' : ''}>
                        {file}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 主编辑器区域 */}
        <div className="flex-1 flex flex-col">
          {/* 标题栏 */}
          <div className="h-12 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
            <div className="flex-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentFile ? `📁 ${currentFile.split('/').pop()}` : 'WebIDE'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>🔌 {pluginManagerRef.current?.getStats().active || 0} plugins</span>
              <button
                onClick={openPluginManager}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                title="Open Plugin Manager"
              >
                🔧 Manage
              </button>
            </div>
          </div>

          {/* 编辑器内容 */}
          <div className="flex-1 overflow-hidden">
            {renderEditor()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebIDE 