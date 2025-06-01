import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDataStore } from '@/core/dataBridge'

const Landing: React.FC = () => {
  const navigate = useNavigate()
  const currentUser = useDataStore((state) => state.currentUser)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // 如果已登录，提供快速进入项目的按钮
  useEffect(() => {
    if (currentUser) {
      // 可以选择自动跳转到项目列表
      // navigate('/projects')
    }
  }, [currentUser, navigate])

  const features = [
    {
      title: '实时协同编辑',
      description: '基于 Yjs CRDT 技术，多人同时编辑不冲突',
      icon: '🤝',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: '浏览器内编译',
      description: 'WebAssembly LaTeX 编译器，无需服务器',
      icon: '⚡',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: '项目管理',
      description: '完整的项目文件管理和权限控制',
      icon: '📁',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: '即时预览',
      description: '编译后立即查看 PDF 输出结果',
      icon: '👁️',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const modules = [
    {
      name: '登录系统',
      path: '/login',
      status: '基础实现',
      description: '用户认证与会话管理'
    },
    {
      name: '项目列表',
      path: '/projects',
      status: '基础实现',
      description: '查看和管理您的 LaTeX 项目',
      requireAuth: true
    },
    {
      name: '协同编辑器',
      path: '/editor/demo',
      status: '框架搭建',
      description: '多人实时编辑 LaTeX 文档',
      requireAuth: true
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* 背景动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">
        {/* 导航栏 */}
        <nav className="flex justify-between items-center p-6">
          <h1 className={`text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            ArxtectVibe
          </h1>
          <div className={`flex gap-4 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            {currentUser ? (
              <>
                <span className="text-gray-300">欢迎, {currentUser.displayName || currentUser.username}</span>
                <Link to="/projects" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                  进入项目
                </Link>
              </>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                登录
              </Link>
            )}
          </div>
        </nav>

        {/* Hero 区域 */}
        <div className="container mx-auto px-6 pt-20 pb-12">
          <div className={`text-center mb-16 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                协同 LaTeX 编辑平台
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              基于 Yjs 的实时协作，WebAssembly 编译技术，为团队提供流畅的 LaTeX 文档编写体验
            </p>
          </div>

          {/* 功能特性 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-70 transform hover:scale-105 transition-all duration-300 delay-${600 + index * 100} ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className={`text-4xl mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* 模块状态 */}
          <div className={`mb-16 transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h3 className="text-3xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                系统模块
              </span>
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {modules.map((module, index) => (
                <div
                  key={index}
                  className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-70 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-semibold">{module.name}</h4>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      module.status === '基础实现' 
                        ? 'bg-green-500 bg-opacity-20 text-green-400' 
                        : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                    }`}>
                      {module.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4">{module.description}</p>
                  {(!module.requireAuth || currentUser) ? (
                    <Link
                      to={module.path}
                      className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      进入模块 →
                    </Link>
                  ) : (
                    <span className="text-gray-500">需要登录</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 快速开始 */}
          <div className={`text-center transition-all duration-1000 delay-1200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h3 className="text-2xl font-semibold mb-4">准备开始了吗？</h3>
            <div className="flex justify-center gap-4">
              {currentUser ? (
                <Link
                  to="/projects"
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  查看项目
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    立即登录
                  </Link>
                  <button
                    className="px-8 py-3 border border-gray-600 rounded-lg text-lg hover:bg-gray-800 transition-all duration-200"
                    disabled
                  >
                    注册账号 (即将开放)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing 