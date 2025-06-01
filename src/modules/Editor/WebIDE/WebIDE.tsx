import React, { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { WebIDEProps } from './types'
import { eventBus } from './core/EventBus/EventBus'
import { serviceRegistry } from './core/Services/ServiceRegistry'
import { commandService } from './core/Services/CommandService'
import { customEditorService } from './core/Services/CustomEditorService'
import { PluginManager } from './core/PluginManager/PluginManager'
import { dataBridge } from '@/core/dataBridge'
import { useDataStore } from '@/core/dataBridge'

interface FileModel {
  path: string
  content: string
  language: string
  model: monaco.editor.ITextModel | null
}

/**
 * WebIDE 主组件
 * 使用 Monaco Editor 实现 VS Code 风格的 IDE
 */
export const WebIDE: React.FC<WebIDEProps> = ({
  projectPath,
  plugins = [
    'pdf-viewer', 
    'ai-assistant', 
    'latex-compiler',
    'collaboration'
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
  const [initializationStep, setInitializationStep] = useState<string>('开始初始化')
  const [files, setFiles] = useState<FileModel[]>([])
  const [activeFile, setActiveFile] = useState<string | null>(null)
  
  // Monaco Editor 引用
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const pluginManagerRef = useRef<PluginManager | null>(null)

  // 从 projectPath 中提取 projectId
  const projectId = React.useMemo(() => {
    const pathParts = projectPath.split('/')
    const id = pathParts[pathParts.length - 1] || 'demo-project'
    console.log(`[WebIDE] Project ID extracted: ${id} from path: ${projectPath}`)
    return id
  }, [projectPath])

  // 添加用户状态监听
  const currentUser = useDataStore((state) => state.currentUser)

  console.log(`[WebIDE] Render - User: ${currentUser?.username}, ProjectId: ${projectId}, IsInitialized: ${isInitialized}, Monaco: ${!!editorRef.current}`)

  // 根据文件名获取语言
  const getLanguageFromFileName = React.useCallback((fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tex': return 'latex'
      case 'md': return 'markdown'
      case 'bib': return 'bibtex'
      case 'json': return 'json'
      case 'js': return 'javascript'
      case 'ts': return 'typescript'
      case 'jsx': return 'javascript'
      case 'tsx': return 'typescript'
      case 'css': return 'css'
      case 'scss': return 'scss'
      case 'html': return 'html'
      case 'xml': return 'xml'
      case 'py': return 'python'
      default: return 'plaintext'
    }
  }, [])

  // 加载项目文件
  const loadProjectFiles = React.useCallback(async () => {
    try {
      const projectFilePaths = await dataBridge.getProjectFiles(projectId)
      const validFileNames = Array.isArray(projectFilePaths) 
        ? projectFilePaths.filter(path => !path.endsWith('/') && typeof path === 'string')
        : []
      
      console.log('[WebIDE] Loading files:', validFileNames)

      const fileModels: FileModel[] = []

      // 为每个文件创建模型
      for (const fileName of validFileNames) {
        try {
          const content = await dataBridge.readFile(projectId, fileName)
          const language = getLanguageFromFileName(fileName)
          
          fileModels.push({
            path: fileName,
            content: content || '',
            language,
            model: null // 稍后由 Monaco 创建
          })
        } catch (error) {
          console.error(`[WebIDE] Failed to load file ${fileName}:`, error)
        }
      }

      setFiles(fileModels)

      // 自动打开 main.tex 文件
      const mainFile = fileModels.find(f => f.path === 'main.tex')
      if (mainFile) {
        setActiveFile(mainFile.path)
      } else if (fileModels.length > 0) {
        setActiveFile(fileModels[0].path)
      }

    } catch (error) {
      console.error('[WebIDE] Failed to load project files:', error)
      setFiles([])
    }
  }, [projectId, getLanguageFromFileName])

  // 初始化 Monaco Editor
  const initializeMonacoEditor = async () => {
    try {
      console.log('[WebIDE] 初始化 Monaco Editor...')
      setInitializationStep('初始化 Monaco Editor...')
      
      // Monaco Editor 已经通过 @monaco-editor/react 初始化
      // 这里主要是配置编辑器
      console.log('[WebIDE] Monaco Editor 初始化完成')
      return true
    } catch (error) {
      console.error('[WebIDE] Monaco Editor 初始化失败:', error)
      throw error
    }
  }

  // 初始化插件管理器
  const initializePluginManager = React.useCallback(async () => {
    const mockFileSystem = {
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

    pluginManagerRef.current = new PluginManager(
      mockFileSystem,
      eventBus,
      serviceRegistry,
      commandService,
      menuService,
      customEditorService,
      uiProvider,
      dataBridge.getProjectPath(projectId)
    )
  }, [projectId])

  // 创建插件清单
  const createPluginManifest = React.useCallback((pluginId: string) => {
    const baseManifest = {
      id: pluginId,
      name: pluginId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      version: '1.0.0',
      description: `${pluginId} enhancement plugin for Monaco Editor IDE`,
      main: './extension.js',
      activationEvents: ['*']
    }

    switch (pluginId) {
      case 'pdf-viewer':
        return {
          ...baseManifest,
          name: 'PDF Viewer',
          description: 'View compiled PDF documents within Monaco IDE'
        }

      case 'ai-assistant':
        return {
          ...baseManifest,
          name: 'AI Assistant',
          description: 'AI-powered LaTeX writing assistant integrated with Monaco Editor'
        }

      case 'latex-compiler':
        return {
          ...baseManifest,
          name: 'LaTeX Compiler',
          description: 'WebAssembly-based LaTeX compiler with Monaco IDE integration'
        }

      case 'collaboration':
        return {
          ...baseManifest,
          name: 'Real-time Collaboration',
          description: 'Yjs-based collaborative editing within Monaco Editor'
        }

      default:
        return baseManifest
    }
  }, [])

  // 加载增强插件
  const loadPlugins = React.useCallback(async (pluginIds: string[]) => {
    if (!pluginManagerRef.current) return

    for (const pluginId of pluginIds) {
      try {
        console.log(`[WebIDE] Loading enhancement plugin: ${pluginId}`)
        const manifest = createPluginManifest(pluginId)
        await pluginManagerRef.current.loadPlugin(manifest)
        await pluginManagerRef.current.activatePlugin(pluginId)
        
        console.log(`[WebIDE] Enhancement plugin ${pluginId} loaded`)
      } catch (error) {
        console.error(`[WebIDE] Failed to load enhancement plugin ${pluginId}:`, error)
      }
    }
    
    console.log('[WebIDE] All enhancement plugins loaded')
  }, [createPluginManifest])

  // 初始化 WebIDE
  const initializeWebIDE = React.useCallback(async () => {
    // 防止重复初始化
    if (isInitialized) {
      console.log('[WebIDE] Already initialized, skipping...')
      return
    }

    try {
      console.log('[WebIDE] === 开始初始化 Monaco Editor IDE ===')
      setInitializationStep('开始初始化...')
      setError('')

      // 确保用户已登录
      if (!currentUser) {
        throw new Error('用户未登录')
      }

      console.log('[WebIDE] Step 1: User validated:', currentUser.username)
      setInitializationStep('步骤1: 用户验证完成')

      // 2. 初始化 Monaco Editor
      console.log('[WebIDE] Step 2: Initializing Monaco Editor...')
      setInitializationStep('步骤2: 初始化 Monaco Editor...')
      await initializeMonacoEditor()
      console.log('[WebIDE] Step 2: Monaco Editor initialized')
      setInitializationStep('步骤2: Monaco Editor 初始化完成')

      // 3. 初始化项目空间（通过 DataBridge）
      console.log('[WebIDE] Step 3: Initializing project space...')
      setInitializationStep('步骤3: 初始化项目空间...')
      await dataBridge.initializeProjectSpace(projectId)
      console.log('[WebIDE] Step 3: Project space initialized')
      setInitializationStep('步骤3: 项目空间初始化完成')

      // 4. 加载项目文件
      console.log('[WebIDE] Step 4: Loading project files...')
      setInitializationStep('步骤4: 加载项目文件...')
      await loadProjectFiles()
      console.log('[WebIDE] Step 4: Project files loaded')
      setInitializationStep('步骤4: 项目文件加载完成')

      // 5. 注册核心服务
      console.log('[WebIDE] Step 5: Registering core services...')
      setInitializationStep('步骤5: 注册核心服务...')
      serviceRegistry.register('eventBus', eventBus)
      serviceRegistry.register('commands', commandService)
      serviceRegistry.register('customEditors', customEditorService)
      serviceRegistry.register('monacoEditor', editorRef.current)
      console.log('[WebIDE] Step 5: Core services registered')
      setInitializationStep('步骤5: 核心服务注册完成')

      // 6. 初始化并加载增强插件
      console.log('[WebIDE] Step 6: Loading enhancement plugins...')
      setInitializationStep('步骤6: 加载增强插件...')
      await initializePluginManager()
      await loadPlugins(plugins)
      console.log('[WebIDE] Step 6: Enhancement plugins loaded')
      setInitializationStep('步骤6: 增强插件加载完成')

      setIsInitialized(true)
      setInitializationStep('Monaco Editor IDE 初始化完成 ✅')
      console.log('[WebIDE] === Monaco Editor IDE 初始化完成 ===')
      onReady?.()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('[WebIDE] Initialization failed:', err)
      setError(errorMessage)
      setInitializationStep(`初始化失败: ${errorMessage}`)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    }
  }, [currentUser, projectId, plugins, onReady, onError, isInitialized, initializePluginManager, loadPlugins, loadProjectFiles])

  useEffect(() => {
    // 只有在用户已登录且未初始化时才进行初始化
    if (currentUser && !isInitialized) {
      initializeWebIDE()
    } else if (!currentUser) {
      console.log('[WebIDE] Waiting for user authentication...')
      setError('等待用户认证...')
    }
  }, [currentUser, isInitialized, initializeWebIDE])

  // 当项目ID变化时重置初始化状态
  useEffect(() => {
    setIsInitialized(false)
    setError(null)
    setInitializationStep('准备初始化...')
    setFiles([])
    setActiveFile(null)
  }, [projectId])

  // 处理文件点击
  const handleFileClick = (filePath: string) => {
    setActiveFile(filePath)
  }

  // 处理编辑器内容变化
  const handleEditorChange = (value: string | undefined, filePath: string) => {
    if (value !== undefined) {
      // 更新文件内容
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.path === filePath 
            ? { ...file, content: value }
            : file
        )
      )

      // 自动保存（防抖处理）
      const timeoutId = setTimeout(async () => {
        try {
          await dataBridge.writeFile(projectId, filePath, value)
          console.log('[WebIDE] File saved:', filePath)
        } catch (error) {
          console.error('[WebIDE] Failed to save file:', error)
        }
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }

  // 获取文件图标
  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tex': return '📄'
      case 'pdf': return '📕'
      case 'bib': return '📚'
      case 'sty': return '🎨'
      case 'js': case 'jsx': return '📜'
      case 'ts': case 'tsx': return '📘'
      case 'json': return '⚙️'
      case 'md': return '📝'
      default: return '📄'
    }
  }

  // 获取当前活动文件
  const activeFileModel = files.find(f => f.path === activeFile)

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Monaco Editor IDE Error
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
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4 animate-pulse">⚡</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Initializing Monaco Editor IDE
          </div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">
            {initializationStep}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-500">
            用户: {currentUser?.username || '未登录'} | 项目: {projectId}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Native Monaco Editor • {plugins.length} Enhancement Plugins
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#1e1e1e]">
      {/* VS Code 风格的标题栏 */}
      <div className="bg-[#323233] text-white px-4 py-2 flex items-center justify-between border-b border-[#3c3c3c]">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Monaco Editor IDE</span>
          <span className="text-xs text-gray-400">Project: {projectId}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-green-400">✅ {plugins.length} Plugins</span>
          <span className="text-xs text-gray-400">{currentUser?.username}</span>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex">
        {/* 左侧文件浏览器 */}
        {enabledFeatures.fileExplorer && (
          <div className="w-64 bg-[#252526] border-r border-[#3c3c3c] text-white">
            <div className="p-3">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Explorer</div>
              <div className="text-sm text-gray-300 mb-3 flex items-center">
                <span className="mr-2">📁</span>
                <span>{projectId}</span>
              </div>
              <div className="space-y-1">
                {files.map((file) => (
                  <div
                    key={file.path}
                    onClick={() => handleFileClick(file.path)}
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer text-sm transition-colors ${
                      activeFile === file.path
                        ? 'bg-[#094771] text-white'
                        : 'text-gray-300 hover:bg-[#2a2d2e]'
                    }`}
                  >
                    <span>{getFileIcon(file.path)}</span>
                    <span>{file.path}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 编辑器区域 */}
        <div className="flex-1 flex flex-col">
          {/* 标签栏 */}
          {activeFile && (
            <div className="bg-[#2d2d30] border-b border-[#3c3c3c] flex">
              <div className="flex items-center px-4 py-2 bg-[#1e1e1e] border-r border-[#3c3c3c] text-white text-sm">
                <span className="mr-2">{getFileIcon(activeFile)}</span>
                <span>{activeFile}</span>
              </div>
            </div>
          )}

          {/* Monaco Editor */}
          <div className="flex-1">
            {activeFileModel ? (
              <Editor
                height="100%"
                language={activeFileModel.language}
                value={activeFileModel.content}
                onChange={(value) => handleEditorChange(value, activeFileModel.path)}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: true },
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  suggestOnTriggerCharacters: true,
                  parameterHints: {
                    enabled: true
                  },
                  quickSuggestions: {
                    other: true,
                    comments: false,
                    strings: true
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <div className="text-lg">Welcome to Monaco Editor IDE</div>
                  <div className="text-sm mt-2">Select a file to start editing</div>
                  <div className="text-xs mt-4">
                    Enhancement Plugins: {plugins.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧面板 - 增强插件 */}
        <div className="w-64 bg-[#252526] border-l border-[#3c3c3c] text-white">
          <div className="p-3">
            <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Enhancement Plugins</div>
            {plugins.map(plugin => (
              <div key={plugin} className="text-sm text-gray-300 py-2 flex items-center">
                <span className="mr-2">🔌</span>
                <span>{plugin.replace(/-/g, ' ')}</span>
              </div>
            ))}
            <div className="mt-4 text-xs text-gray-500">
              <div>Total: {plugins.length} plugins</div>
              <div>Status: Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* VS Code 风格的状态栏 */}
      <div className="bg-[#007ACC] text-white px-4 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <span>⚡ Monaco Editor IDE</span>
          <span>📄 {activeFileModel?.language || 'No file'}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Line 1, Col 1</span>
          <span>UTF-8</span>
          <span>✓ Ready</span>
        </div>
      </div>
    </div>
  )
}

export default WebIDE 