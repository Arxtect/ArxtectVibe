import React, { useState, useEffect, useRef } from 'react'
import { WebIDEProps, IFileSystem } from './types'
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
  plugins = [
    'pdf-viewer', 
    'ai-assistant', 
    'monaco-editor', 
    'latex-compiler',
    'collaboration',
    'plugin-manager'
  ],
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
  const initializeWebIDE = React.useCallback(async () => {
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
      const mockFileSystem: IFileSystem = {
        readFile: () => Promise.resolve(Buffer.from('')),
        writeFile: () => Promise.resolve(),
        deleteFile: () => Promise.resolve(),
        exists: () => Promise.resolve(false),
        mkdir: () => Promise.resolve(),
        rmdir: () => Promise.resolve(),
        readdir: () => Promise.resolve([]),
        stat: () => Promise.resolve({
          isFile: () => true,
          isDirectory: () => false,
          size: 0,
          mtime: new Date(),
          ctime: new Date()
        }),
        watch: () => ({ dispose: () => {} }),
        join: (...paths: string[]) => paths.join('/'),
        dirname: (path: string) => path.split('/').slice(0, -1).join('/'),
        basename: (path: string) => path.split('/').pop() || '',
        extname: (path: string) => {
          const base = path.split('/').pop() || ''
          const dotIndex = base.lastIndexOf('.')
          return dotIndex > 0 ? base.substring(dotIndex) : ''
        }
      }

      pluginManagerRef.current = new PluginManager(
        mockFileSystem, // 提供兼容的文件系统接口
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
  }, [currentUser, projectId, plugins, onReady, onError])

  useEffect(() => {
    // 只有在用户已登录时才进行初始化
    if (currentUser) {
      initializeWebIDE()
    } else {
      console.log('[WebIDE] Waiting for user authentication...')
      setError('等待用户认证...')
    }
  }, [projectPath, currentUser, initializeWebIDE]) // 添加 initializeWebIDE 作为依赖

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
          ],
          viewContainers: {
            activitybar: [{
              id: 'aiAssistant',
              title: 'AI Assistant',
              icon: 'robot'
            }]
          },
          views: {
            activitybar: [{
              id: 'aiAssistant.chat',
              name: 'AI Chat',
              viewContainer: 'aiAssistant'
            }]
          }
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
        activationEvents: ['onFileOpen:*.tex', 'onFileOpen:*.md'],
        contributes: {
          customEditors: [{
            viewType: 'monacoEditor.textEditor',
            displayName: 'Monaco Text Editor',
            selector: [{ filenamePattern: '*.tex' }, { filenamePattern: '*.md' }],
            priority: 'default' as const
          }]
        }
      }
    }

    if (pluginId === 'latex-compiler') {
      return {
        id: 'latex-compiler',
        name: 'LaTeX Compiler',
        version: '1.0.0',
        description: 'WebAssembly-based LaTeX compiler with real-time compilation',
        main: './extension.js',
        activationEvents: ['onFileOpen:*.tex'],
        contributes: {
          commands: [
            {
              command: 'latexCompiler.compile',
              title: 'Compile LaTeX Document'
            },
            {
              command: 'latexCompiler.compileAndPreview',
              title: 'Compile and Preview'
            }
          ],
          viewContainers: {
            activitybar: [{
              id: 'latexCompiler',
              title: 'LaTeX Compiler',
              icon: 'terminal'
            }]
          }
        }
      }
    }

    if (pluginId === 'collaboration') {
      return {
        id: 'collaboration',
        name: 'Real-time Collaboration',
        version: '1.0.0',
        description: 'Yjs-based real-time collaborative editing',
        main: './extension.js',
        activationEvents: ['*'],
        contributes: {
          commands: [
            {
              command: 'collaboration.shareProject',
              title: 'Share Project'
            },
            {
              command: 'collaboration.togglePanel',
              title: 'Toggle Collaboration Panel'
            }
          ],
          viewContainers: {
            activitybar: [{
              id: 'collaboration',
              title: 'Collaboration',
              icon: 'people'
            }]
          }
        }
      }
    }
    
    if (pluginId === 'plugin-manager') {
      return {
        id: 'plugin-manager',
        name: 'Plugin Manager',
        version: '1.0.0',
        description: 'Manage and configure IDE plugins',
        main: './extension.js',
        activationEvents: ['*'],
        contributes: {
          commands: [
            {
              command: 'pluginManager.open',
              title: 'Open Plugin Manager'
            }
          ]
        }
      }
    }

    // 默认插件清单
    return {
      id: pluginId,
      name: pluginId,
      version: '1.0.0',
      description: `Plugin: ${pluginId}`,
      main: './extension.js',
      activationEvents: ['*'],
      contributes: {}
    }
  }

  // 加载项目文件
  const loadProjectFiles = async () => {
    try {
      const projectFilePaths = await dataBridge.getProjectFiles(projectId)
      
      // getProjectFiles 返回的是字符串数组，包含文件路径
      // 过滤掉目录（以 '/' 结尾）并只保留文件
      const validFileNames = Array.isArray(projectFilePaths) 
        ? projectFilePaths.filter(path => !path.endsWith('/') && typeof path === 'string')
        : []
      
      setFiles(validFileNames)
      
      // 自动打开 main.tex 文件
      const mainFilePath = validFileNames.find(path => path === 'main.tex')
      if (mainFilePath) {
        setCurrentFile(mainFilePath)
        // 读取文件内容
        try {
          const content = await dataBridge.readFile(projectId, mainFilePath)
          setFileContent(content || '')
        } catch (error) {
          console.error('[WebIDE] Failed to read main.tex:', error)
          setFileContent('')
        }
      }
    } catch (error) {
      console.error('[WebIDE] Failed to load project files:', error)
      setFiles([]) // 设置空数组作为后备
    }
  }

  // 打开文件
  const openFile = async (filePath: string) => {
    try {
      const content = await dataBridge.readFile(projectId, filePath)
      setCurrentFile(filePath)
      setFileContent(content)
    } catch (error) {
      console.error('[WebIDE] Failed to open file:', error)
    }
  }

  // 保存文件
  const saveFile = async (filePath: string, content: string) => {
    try {
      await dataBridge.writeFile(projectId, filePath, content)
      console.log('[WebIDE] File saved:', filePath)
    } catch (error) {
      console.error('[WebIDE] Failed to save file:', error)
    }
  }

  // 处理文件点击
  const handleFileClick = async (fileName: string) => {
    await openFile(fileName)
  }

  // 处理内容变化
  const handleContentChange = (content: string) => {
    setFileContent(content)
    if (currentFile) {
      // 自动保存（防抖处理）
      const timeoutId = setTimeout(() => {
        saveFile(currentFile, content)
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }

  // 获取文件图标
  const getFileIcon = (fileName: string | undefined): string => {
    if (!fileName) return '📄'
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tex':
        return '📄'
      case 'pdf':
        return '📕'
      case 'bib':
        return '📚'
      case 'sty':
        return '🎨'
      default:
        return '📄'
    }
  }

  // 打开插件管理器
  const openPluginManager = () => {
    console.log('[WebIDE] Opening plugin manager...')
    // 触发插件管理器命令
    commandService.executeCommand('pluginManager.open')
  }

  // 渲染编辑器区域
  const renderEditor = () => {
    if (!currentFile) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-4">📝</div>
            <div className="text-lg">Welcome to WebIDE</div>
            <div className="text-sm mt-2">Select a file to start editing</div>
          </div>
        </div>
      )
    }

    // 在实际实现中，这里会根据文件类型选择合适的编辑器插件
    return (
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <span>{getFileIcon(currentFile)}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {currentFile}
            </span>
          </div>
        </div>
        <div className="flex-1 p-4">
          <textarea
            value={fileContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Start editing your LaTeX document..."
          />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            WebIDE Error
          </div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🚀</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Initializing WebIDE
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Loading plugins and project files...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 标题栏 */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">WebIDE</h1>
          <span className="text-sm text-gray-300">Project: {projectId}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={openPluginManager}
            className="text-sm text-gray-300 hover:text-white"
          >
            🔌 Plugins
          </button>
          <span className="text-sm text-gray-300">
            {currentUser?.username}
          </span>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex">
        {/* 侧边栏 - 文件浏览器 */}
        {enabledFeatures.fileExplorer && (
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                📁 Files
              </h3>
              <div className="space-y-1">
                {files
                  .filter(fileName => fileName && typeof fileName === 'string') // 过滤无效文件名
                  .map((fileName) => (
                  <div
                    key={fileName}
                    onClick={() => handleFileClick(fileName)}
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer text-sm ${
                      currentFile === fileName
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{getFileIcon(fileName)}</span>
                    <span>{fileName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 编辑器区域 */}
        {renderEditor()}
      </div>

      {/* 状态栏 */}
      <div className="bg-blue-600 text-white px-4 py-1 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span>✅ Ready</span>
          <span>🔌 {plugins.length} plugins loaded</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Line 1, Col 1</span>
          <span>LaTeX</span>
        </div>
      </div>
    </div>
  )
}

export default WebIDE 