import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dataBridge, useDataStore } from '@/core/dataBridge'

const Editor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { currentProject } = useDataStore()
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      navigate('/projects')
      return
    }

    // 加载项目数据
    dataBridge.openProject(projectId).catch((err) => {
      console.error('Failed to open project:', err)
      navigate('/projects')
    })
  }, [projectId, navigate])

  // 选择第一个文件作为默认打开文件
  useEffect(() => {
    if (currentProject?.files.length && !selectedFileId) {
      setSelectedFileId(currentProject.files[0].fileId)
    }
  }, [currentProject, selectedFileId])

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载项目中...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/projects')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 返回项目列表
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {currentProject.name}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn-secondary text-sm">
              保存
            </button>
            <button className="btn-primary text-sm">
              编译
            </button>
          </div>
        </div>
      </header>

      {/* 主编辑区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 文件列表侧边栏 */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-3">文件列表</h2>
            <div className="space-y-1">
              {currentProject.files.map((file) => (
                <div
                  key={file.fileId}
                  onClick={() => setSelectedFileId(file.fileId)}
                  className={`px-3 py-2 rounded cursor-pointer text-sm ${
                    selectedFileId === file.fileId
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {file.name}
                  {file.isMain && (
                    <span className="ml-2 text-xs text-gray-500">(主文件)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 编辑器区域 */}
        <main className="flex-1 flex">
          <div className="flex-1 bg-white p-4">
            <div className="h-full border border-gray-300 rounded-lg p-4 font-mono text-sm">
              {/* 这里将集成CodeMirror编辑器 */}
              <p className="text-gray-500">
                编辑器组件将在这里实现...
                <br />
                当前选中文件: {selectedFileId}
              </p>
            </div>
          </div>

          {/* PDF预览区域 */}
          <div className="w-1/2 p-4">
            <div className="h-full bg-white border border-gray-300 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">PDF预览区域</p>
            </div>
          </div>
        </main>
      </div>

      {/* 底部日志区域 */}
      <div className="h-48 bg-white border-t border-gray-200 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">编译日志</h3>
        <p className="text-xs text-gray-500">编译日志将在这里显示...</p>
      </div>
    </div>
  )
}

export default Editor 