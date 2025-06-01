import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useDataStore } from '@/core/dataBridge'
import Landing from '@/modules/Landing/Landing'
import Login from '@/modules/Login/Login'
import ProjectList from '@/modules/ProjectList/ProjectList'
import Editor from '@/modules/Editor/Editor'

// 路由守卫组件
const ProtectedRoute: React.FC = () => {
  const currentUser = useDataStore((state) => state.currentUser)
  
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  
  return <Outlet />
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
  // 应用启动时检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      // TODO: 验证token有效性，获取用户信息
      // dataBridge.getCurrentUser()
    }
  }, [])

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
              <Route path="editor/:projectId" element={<Editor />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App 