import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dataBridge, useDataStore } from '@/core/dataBridge'
import { Project } from '@/types'

const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const { currentUser, projects, isLoading } = useDataStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    // 加载项目列表
    dataBridge.fetchProjects().catch(console.error)
  }, [])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')

    if (!newProjectName.trim()) {
      setCreateError('请输入项目名称')
      return
    }

    try {
      setIsCreating(true)
      const project = await dataBridge.createProject(newProjectName.trim())
      setShowCreateModal(false)
      setNewProjectName('')
      // 直接进入新创建的项目
      navigate(`/editor/${project.id}`)
    } catch (err: any) {
      setCreateError(err.message || '创建项目失败')
    } finally {
      setIsCreating(false)
    }
  }

  const handleLogout = async () => {
    await dataBridge.logout()
    navigate('/login')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              LaTeX 协同编辑平台
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentUser?.displayName || currentUser?.username}
              </span>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            我的项目
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            新建项目
          </button>
        </div>

        {/* 项目列表 */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无项目</h3>
            <p className="mt-1 text-sm text-gray-500">
              点击"新建项目"按钮创建您的第一个 LaTeX 项目
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/editor/${project.id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {project.files.length} 个文件 · {project.collaborators.length} 个协作者
                </p>
                <div className="text-xs text-gray-400">
                  更新于 {formatDate(project.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 创建项目模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              新建项目
            </h3>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                  项目名称
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="input-field"
                  placeholder="请输入项目名称"
                  autoFocus
                />
              </div>

              {createError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {createError}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewProjectName('')
                    setCreateError('')
                  }}
                  className="btn-secondary"
                  disabled={isCreating}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isCreating}
                >
                  {isCreating ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectList