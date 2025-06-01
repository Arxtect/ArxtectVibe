import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dataBridge, useDataStore } from '@/core/dataBridge'
import { EditorProps, EditorState, FileTab } from './types'
import { AIService } from './services/aiService'

// 直接导入组件，避免懒加载时的模块解析问题
import MonacoEditor from './components/Monaco/MonacoEditor'
import AIPanel from './components/AIAgent/AIPanel'
import CollaborationPanel from './components/Collaboration/CollaborationPanel'
import CompilerPanel from './components/Compiler/CompilerPanel'
import PDFViewer from './components/Preview/PDFViewer'

const EditorV2: React.FC<Partial<EditorProps>> = ({
  projectId: propProjectId,
  fileId: propFileId,
  userId: propUserId,
  aiEnabled = true,
  collaborationEnabled = true,
  compilerEnabled = true,
  theme = 'dark',
  settings: propSettings,
  onSave,
  onCompile
}) => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { currentProject, currentUser } = useDataStore()
  
  // 使用 props 或从路由获取的 projectId
  const activeProjectId = propProjectId || projectId
  const activeUserId = propUserId || currentUser?.id
  
  // 编辑器状态
  const [editorState, setEditorState] = useState<EditorState>({
    activeFileId: propFileId || null,
    openTabs: [],
    settings: {
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: true,
      lineNumbers: true,
      autoSave: true,
      autoSaveDelay: 2000,
      theme: theme === 'auto' ? 'vs-dark' : `vs-${theme}`,
      keybindings: {},
      ...propSettings
    },
    isLoading: true,
    error: null
  })

  // AI 服务状态
  const [aiService, setAiService] = useState<AIService | null>(null)
  
  // 面板可见性状态
  const [panelVisibility, setPanelVisibility] = useState({
    ai: aiEnabled,
    collaboration: collaborationEnabled,
    compiler: compilerEnabled,
    preview: true,
    fileTree: true
  })

  // 初始化编辑器
  useEffect(() => {
    if (!activeProjectId) {
      navigate('/projects')
      return
    }

    initializeEditor()
  }, [activeProjectId, navigate])

  const initializeEditor = async () => {
    try {
      setEditorState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // 加载项目数据
      let project = currentProject
      if (activeProjectId && (!project || project.id !== activeProjectId)) {
        project = await dataBridge.openProject(activeProjectId)
      }
      
      // 初始化文件标签页
      if (project?.files.length) {
        const tabs: FileTab[] = project.files.map(file => ({
          fileId: file.fileId,
          name: file.name,
          path: file.path || file.name,
          isDirty: false,
          isActive: Boolean(file.fileId === propFileId || (!propFileId && file.isMain)),
          content: file.content || ''
        }))
        
        const activeFileId = propFileId || project.files.find(f => f.isMain)?.fileId || project.files[0]?.fileId
        
        setEditorState(prev => ({
          ...prev,
          openTabs: tabs,
          activeFileId,
          isLoading: false
        }))
      } else {
        // 如果没有文件，仍然要结束加载状态
        setEditorState(prev => ({
          ...prev,
          isLoading: false
        }))
      }

      // 初始化 AI 服务
      if (aiEnabled && activeUserId) {
        const aiServiceInstance = new AIService({
          provider: 'openai', // 默认使用 OpenAI，后续可配置
          model: 'gpt-4',
          apiKey: import.meta.env.VITE_OPENAI_API_KEY,
          systemPrompt: 'You are a LaTeX expert assistant. Help users write and edit LaTeX documents.',
          functions: [
            {
              name: 'insert_latex_command',
              description: 'Insert a LaTeX command at cursor position',
              parameters: { command: 'string', parameters: 'string' },
              execute: async (params: any) => {
                // 实现 LaTeX 命令插入逻辑
                return { success: true, inserted: `\\${params.command}{${params.parameters}}` }
              }
            }
          ]
        })
        
        await aiServiceInstance.initialize()
        setAiService(aiServiceInstance)
      }
      
    } catch (error) {
      console.error('Failed to initialize editor:', error)
      setEditorState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize editor'
      }))
    }
  }

  // 文件切换处理
  const handleFileSwitch = useCallback((fileId: string) => {
    setEditorState(prev => ({
      ...prev,
      activeFileId: fileId,
      openTabs: prev.openTabs.map(tab => ({
        ...tab,
        isActive: tab.fileId === fileId
      }))
    }))
  }, [])

  // 文件内容变化处理
  const handleFileContentChange = useCallback((fileId: string, content: string) => {
    setEditorState(prev => ({
      ...prev,
      openTabs: prev.openTabs.map(tab => 
        tab.fileId === fileId 
          ? { ...tab, content, isDirty: true }
          : tab
      )
    }))
    
    // 自动保存
    if (editorState.settings.autoSave) {
      setTimeout(() => {
        handleSave(fileId, content)
      }, editorState.settings.autoSaveDelay)
    }
  }, [editorState.settings.autoSave, editorState.settings.autoSaveDelay])

  // 保存文件
  const handleSave = useCallback(async (fileId: string, content: string) => {
    if (!activeProjectId) return
    
    try {
      // 调用保存 API
      await dataBridge.saveFile(activeProjectId, fileId, content)
      
      // 更新标签页状态
      setEditorState(prev => ({
        ...prev,
        openTabs: prev.openTabs.map(tab => 
          tab.fileId === fileId 
            ? { ...tab, isDirty: false }
            : tab
        )
      }))
      
      onSave?.(content)
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  }, [activeProjectId, onSave])

  // 编译处理
  const handleCompile = useCallback(async () => {
    if (!activeProjectId || !currentProject) return
    
    try {
      // 获取所有文件内容（为未来的编译服务准备）
      const _files = editorState.openTabs.reduce((acc, tab) => {
        if (tab.content) {
          acc[tab.fileId] = {
            name: tab.name,
            content: tab.content,
            path: tab.path
          }
        }
        return acc
      }, {} as Record<string, { name: string; content: string; path: string }>)
      
      // 调用编译服务（占位实现）
      const result = {
        success: true,
        pdf: new Uint8Array(),
        log: 'Compilation completed successfully',
        errors: [],
        warnings: [],
        duration: 1000,
        timestamp: Date.now()
      }
      
      onCompile?.(result)
    } catch (error) {
      console.error('Compilation failed:', error)
    }
  }, [activeProjectId, currentProject, editorState.openTabs, onCompile])

  // 切换面板可见性
  const togglePanel = useCallback((panel: keyof typeof panelVisibility) => {
    setPanelVisibility(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }))
  }, [])

  if (!activeProjectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Project ID is required</div>
      </div>
    )
  }

  if (editorState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    )
  }

  if (editorState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {editorState.error}</div>
      </div>
    )
  }

  const activeTab = editorState.openTabs.find(tab => tab.isActive)

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 顶部工具栏 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/projects')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              ← 返回项目列表
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {currentProject?.name || 'LaTeX Editor'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 工具栏按钮 */}
            <button
              onClick={() => togglePanel('ai')}
              className={`btn-secondary text-sm ${panelVisibility.ai ? 'bg-primary-100' : ''}`}
              disabled={!aiEnabled}
            >
              🤖 AI
            </button>
            <button
              onClick={() => togglePanel('collaboration')}
              className={`btn-secondary text-sm ${panelVisibility.collaboration ? 'bg-primary-100' : ''}`}
              disabled={!collaborationEnabled}
            >
              👥 协作
            </button>
            <button
              onClick={handleCompile}
              className="btn-primary text-sm"
              disabled={!compilerEnabled}
            >
              ⚡ 编译
            </button>
            <button
              onClick={() => {
                if (activeTab) {
                  handleSave(activeTab.fileId, activeTab.content || '')
                }
              }}
              className="btn-secondary text-sm"
            >
              💾 保存
            </button>
          </div>
        </div>
      </header>

      {/* 主编辑区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 文件树侧边栏 */}
        {panelVisibility.fileTree && (
          <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">文件列表</h2>
              <div className="space-y-1">
                {editorState.openTabs.map((tab) => (
                  <div
                    key={tab.fileId}
                    onClick={() => handleFileSwitch(tab.fileId)}
                    className={`px-3 py-2 rounded cursor-pointer text-sm flex items-center justify-between ${
                      tab.isActive
                        ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{tab.name}</span>
                    {tab.isDirty && <span className="text-orange-500">●</span>}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* 编辑器主区域 */}
        <div className="flex-1 flex flex-col">
          {/* 标签页 */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex space-x-2 overflow-x-auto">
            {editorState.openTabs.map((tab) => (
              <button
                key={tab.fileId}
                onClick={() => handleFileSwitch(tab.fileId)}
                className={`px-3 py-2 text-sm whitespace-nowrap ${
                  tab.isActive
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab.name}
                {tab.isDirty && <span className="ml-1 text-orange-500">●</span>}
              </button>
            ))}
          </div>

          {/* Monaco 编辑器 */}
          <div className="flex-1 flex">
            <div className="flex-1 relative">
              {activeTab && (
                <MonacoEditor
                  value={activeTab.content || ''}
                  language="latex"
                  theme={editorState.settings.theme}
                  settings={editorState.settings}
                  onChange={(content: string) => handleFileContentChange(activeTab.fileId, content)}
                />
              )}
            </div>

            {/* PDF 预览面板 */}
            {panelVisibility.preview && (
              <div className="w-1/2 border-l border-gray-200 dark:border-gray-700">
                <PDFViewer />
              </div>
            )}
          </div>
        </div>

        {/* AI 助手面板 */}
        {panelVisibility.ai && aiService && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <AIPanel aiService={aiService} />
          </div>
        )}
      </div>

      {/* 底部面板 */}
      <div className="flex">
        {/* 编译输出面板 */}
        {panelVisibility.compiler && (
          <div className="flex-1 h-48 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <CompilerPanel />
          </div>
        )}

        {/* 协作面板 */}
        {panelVisibility.collaboration && (
          <div className="w-80 h-48 bg-white dark:bg-gray-800 border-t border-l border-gray-200 dark:border-gray-700">
            <CollaborationPanel projectId={activeProjectId} userId={activeUserId || ''} />
          </div>
        )}
      </div>
    </div>
  )
}

export default EditorV2 