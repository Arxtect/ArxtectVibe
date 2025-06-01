import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useDataStore } from '@/core/dataBridge'
import Landing from '@/modules/Landing/Landing'
import Login from '@/modules/Login/Login'
import ProjectList from '@/modules/ProjectList/ProjectList'
import { WebIDE } from '@/modules/Editor/WebIDE'

// 路由守卫组件
const ProtectedRoute: React.FC = () => {
  const currentUser = useDataStore((state) => state.currentUser)
  const isInitializing = useDataStore((state) => state.isLoading)
  
  // 如果还在初始化用户状态，显示加载状态
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">正在验证登录状态...</div>
        </div>
      </div>
    )
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  
  return <Outlet />
}

// WebIDE 路由组件
const EditorRoute: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const currentUser = useDataStore((state) => state.currentUser)
  
  if (!projectId) {
    return <Navigate to="/projects" replace />
  }

  // 创建用户隔离的项目路径
  const userProjectPath = currentUser 
    ? `/projects/${currentUser.username}/${projectId}`
    : `/projects/guest/${projectId}`

  return (
    <WebIDE
      projectPath={userProjectPath}
      plugins={['pdf-viewer', 'ai-assistant', 'monaco-editor', 'plugin-manager']}
      theme="dark"
      enabledFeatures={{
        fileExplorer: true,
        terminal: false,
        git: false,
        debug: false
      }}
      onReady={() => {
        console.log('WebIDE is ready for user:', currentUser?.username || 'guest')
      }}
      onError={(error) => {
        console.error('WebIDE error:', error)
      }}
    />
  )
}

// 主布局组件
const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  )
}

function App() {
  const setCurrentUser = useDataStore((state) => state.setCurrentUser)
  const setLoading = useDataStore((state) => state.setLoading)
  const isMockMode = useDataStore((state) => state.isMockMode)
  const [isInitialized, setIsInitialized] = useState(false)

  // 应用启动时检查登录状态
  useEffect(() => {
    const initializeUserState = async () => {
      setLoading(true)
      
      try {
        console.log(`[App] Initializing user state, mode: ${isMockMode ? 'Mock' : 'Real'}`)
        
        if (isMockMode) {
          // Mock 模式：检查是否有保存的用户状态
          const savedUser = localStorage.getItem('mock_current_user')
          if (savedUser) {
            try {
              const user = JSON.parse(savedUser)
              setCurrentUser(user)
              console.log('[App] Mock user state restored:', user.username)
            } catch (error) {
              console.error('[App] Failed to parse saved user state:', error)
              localStorage.removeItem('mock_current_user')
            }
          } else {
            console.log('[App] No saved Mock user found')
          }
        } else {
          // 真实模式：检查 token 有效性
          const token = localStorage.getItem('auth_token')
          if (token) {
            // TODO: 实现真实的token验证
            console.log('[App] Token found, but real backend validation not implemented yet')
            // 临时清理无效的 token
            localStorage.removeItem('auth_token')
          } else {
            console.log('[App] No auth token found')
          }
        }
      } catch (error) {
        console.error('[App] Failed to initialize user state:', error)
      } finally {
        setLoading(false)
        setIsInitialized(true)
        console.log('[App] User state initialization complete')
      }
    }

    initializeUserState()
  }, [setCurrentUser, setLoading, isMockMode])

  // 如果还未初始化完成，显示全局加载状态
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">正在初始化应用...</div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter basename="/ArxtectVibe">
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
        
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Landing />} />
            <Route path="login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="projects" element={<ProjectList />} />
              <Route path="editor/:projectId" element={<EditorRoute />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App 