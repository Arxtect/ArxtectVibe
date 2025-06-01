import { 
  User, 
  Project, 
  FileEntry,
  CompileLogEntry,
  Role
} from '@/types'
import toast from 'react-hot-toast'
import { IDataBridge, createDataBridge } from './dataBridgeInterface'

// 模拟网络延迟函数
const simulateNetworkDelay = () => 
  new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200))

// DataStore引用 - 将通过registerDataStore方法设置
let dataStoreRef: any = null

// 注册DataStore引用的函数
export const registerDataStore = (store: any) => {
  dataStoreRef = store
}

// 获取DataStore引用
const getDataStore = () => {
  if (!dataStoreRef) {
    console.warn('[MockDataBridge] DataStore not registered yet')
    return null
  }
  return dataStoreRef
}

// Helper函数：安全地更新DataStore状态
const updateDataStore = (updater: (store: any) => void) => {
  const store = getDataStore()
  if (store) {
    updater(store)
  }
}

// Helper函数：安全地获取当前用户
const getCurrentUser = () => {
  const store = getDataStore()
  return store ? store.getState().currentUser : null
}

// 模拟数据
const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'demo',
    displayName: 'Demo User',
    email: 'demo@example.com'
  },
  {
    id: 'user2', 
    username: 'alice',
    displayName: 'Alice Wang',
    email: 'alice@example.com'
  },
  {
    id: 'user3',
    username: 'bob',
    displayName: 'Bob Chen', 
    email: 'bob@example.com'
  }
]

// 通用LaTeX项目模板文件
const createDefaultLatexProject = (userId: string, username: string): Project => ({
  id: `default_project_${userId}`,
  name: '📄 默认LaTeX项目模板',
  ownerId: userId,
  files: [
    // 主文档
    {
      fileId: `main_${userId}`,
      name: 'main.tex',
      content: `\\documentclass[12pt,a4paper]{article}

% 必要的包
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{amsmath,amsfonts,amssymb}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{hyperref}
\\usepackage[backend=biber,style=authoryear]{biblatex}

% 页面设置
\\geometry{margin=2.5cm}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{6pt}

% 添加参考文献文件
\\addbibresource{references.bib}

% 文档信息
\\title{LaTeX 项目模板}
\\author{${username}}
\\date{\\today}

\\begin{document}

\\maketitle

\\tableofcontents
\\newpage

% 引入各个章节
\\input{sections/introduction}
\\input{sections/methodology}
\\input{sections/results}
\\input{sections/conclusion}

% 参考文献
\\printbibliography

\\end{document}`,
      isMain: true
    },
    // 介绍章节
    {
      fileId: `intro_${userId}`,
      name: 'sections/introduction.tex',
      content: `\\section{引言}

这是一个LaTeX项目模板，包含了常见的文档结构和配置。

\\subsection{项目概述}

本模板包含以下特性：
\\begin{itemize}
    \\item 模块化的文档结构
    \\item 标准的LaTeX包配置
    \\item 参考文献管理
    \\item 数学公式支持
    \\item 表格和图片插入示例
\\end{itemize}

\\subsection{使用说明}

您可以根据需要修改各个章节的内容，添加新的文件，或调整文档结构。`,
      isMain: false
    },
    // 方法章节
    {
      fileId: `method_${userId}`,
      name: 'sections/methodology.tex',
      content: `\\section{方法}

\\subsection{数学公式示例}

这里展示一些数学公式的用法：

行内公式：$E = mc^2$

行间公式：
\\begin{equation}
    \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\end{equation}

矩阵示例：
\\begin{equation}
    A = \\begin{pmatrix}
        a_{11} & a_{12} & \\cdots & a_{1n} \\\\
        a_{21} & a_{22} & \\cdots & a_{2n} \\\\
        \\vdots & \\vdots & \\ddots & \\vdots \\\\
        a_{m1} & a_{m2} & \\cdots & a_{mn}
    \\end{pmatrix}
\\end{equation}`,
      isMain: false
    },
    // 结果章节
    {
      fileId: `results_${userId}`,
      name: 'sections/results.tex',
      content: `\\section{结果}

\\subsection{表格示例}

下表展示了一些示例数据：

\\begin{table}[h]
\\centering
\\caption{示例数据表}
\\begin{tabular}{@{}lcc@{}}
\\toprule
项目 & 数值1 & 数值2 \\\\
\\midrule
A & 1.23 & 4.56 \\\\
B & 2.34 & 5.67 \\\\
C & 3.45 & 6.78 \\\\
\\bottomrule
\\end{tabular}
\\end{table}

\\subsection{图片示例}

如果您有图片文件，可以使用以下代码插入：

\\begin{figure}[h]
\\centering
% \\includegraphics[width=0.8\\textwidth]{your-image.png}
\\caption{图片标题}
\\label{fig:example}
\\end{figure}`,
      isMain: false
    },
    // 结论章节
    {
      fileId: `conclusion_${userId}`,
      name: 'sections/conclusion.tex',
      content: `\\section{结论}

在本文档中，我们展示了LaTeX的基本用法，包括：

\\begin{enumerate}
    \\item 文档结构的组织
    \\item 数学公式的排版
    \\item 表格和图片的插入
    \\item 参考文献的管理
\\end{enumerate}

\\subsection{后续工作}

您可以：
\\begin{itemize}
    \\item 根据需要添加更多章节
    \\item 修改文档样式和格式
    \\item 添加自定义命令和宏
    \\item 使用更多LaTeX包来扩展功能
\\end{itemize}

\\subsection{致谢}

感谢使用本LaTeX模板！`,
      isMain: false
    },
    // 参考文献文件
    {
      fileId: `bib_${userId}`,
      name: 'references.bib',
      content: `@article{einstein1905,
  title={Zur Elektrodynamik bewegter K{\"o}rper},
  author={Einstein, Albert},
  journal={Annalen der physik},
  volume={17},
  number={10},
  pages={891--921},
  year={1905},
  publisher={Wiley Online Library}
}

@book{knuth1997art,
  title={The art of computer programming},
  author={Knuth, Donald Ervin},
  volume={1},
  year={1997},
  publisher={Addison-wesley}
}

@inproceedings{lamport1986latex,
  title={LaTeX: a document preparation system},
  author={Lamport, Leslie},
  booktitle={User's guide and reference manual},
  year={1986},
  organization={Addison-Wesley}
}`,
      isMain: false
    },
    // 配置文件
    {
      fileId: `config_${userId}`,
      name: 'config/packages.tex',
      content: `% 自定义包配置文件
% 在这里添加额外的包和配置

% 中文支持（如果需要）
% \\usepackage{ctex}

% 代码高亮
% \\usepackage{listings}
% \\usepackage{xcolor}

% 自定义命令示例
\\newcommand{\\todo}[1]{\\textcolor{red}{\\textbf{TODO: #1}}}
\\newcommand{\\highlight}[1]{\\textcolor{blue}{\\textbf{#1}}}

% 数学相关的自定义命令
\\newcommand{\\R}{\\mathbb{R}}
\\newcommand{\\N}{\\mathbb{N}}
\\newcommand{\\Z}{\\mathbb{Z}}
\\newcommand{\\Q}{\\mathbb{Q}}

% 向量表示
\\newcommand{\\vect}[1]{\\boldsymbol{#1}}`,
      isMain: false
    }
  ],
  collaborators: [
    { userId, username, role: 'owner' as Role }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

// 初始化Mock项目数据
let mockProjects: Project[] = []

// 初始化函数：创建每个用户的默认项目
const initializeMockData = () => {
  mockProjects = [
    createDefaultLatexProject('user1', 'demo'),
    createDefaultLatexProject('user2', 'alice'),
    createDefaultLatexProject('user3', 'bob'),
    // 添加一个示例协作项目
    {
      id: 'collab_project',
      name: '🤝 协作示例项目',
      ownerId: 'user2',
      files: [
        {
          fileId: 'collab_main',
          name: 'main.tex',
          content: `\\documentclass{article}
\\title{协作项目示例}
\\author{Alice \\and Bob \\and Demo}
\\begin{document}
\\maketitle

这是一个多人协作的示例项目。

\\section{Alice的章节}
% Alice 的内容...

\\section{Bob的章节}  
% Bob 的内容...

\\section{Demo的章节}
% Demo 的内容...

\\end{document}`,
          isMain: true
        }
      ],
      collaborators: [
        { userId: 'user2', username: 'alice', role: 'owner' },
        { userId: 'user3', username: 'bob', role: 'editor' },
        { userId: 'user1', username: 'demo', role: 'viewer' }
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1天前
      updatedAt: new Date().toISOString()
    }
  ]
}

// 初始化数据
initializeMockData()

// Mock状态恢复：从localStorage恢复用户状态
const restoreMockState = () => {
  try {
    const savedUser = localStorage.getItem('mock_current_user')
    if (savedUser) {
      const user: User = JSON.parse(savedUser)
      console.log('[MockDataBridge] Restoring user from localStorage:', user.username)
      
      // 通过统一的DataStore恢复用户状态
      const store = getDataStore()
      if (store) {
        store.getState().setCurrentUser(user)
      }
    }
  } catch (error) {
    console.warn('[MockDataBridge] Failed to restore user state:', error)
    localStorage.removeItem('mock_current_user')
  }
}

// 初始化Mock状态
const initializeMockState = () => {
  try {
    const store = getDataStore()
    const isMockMode = store.getState().isMockMode
    
    if (isMockMode) {
      restoreMockState()
      console.log('[MockDataBridge] Mock state initialized')
    }
  } catch (error) {
    console.warn('[MockDataBridge] Failed to initialize mock state:', error)
  }
}

// 在模块加载时，如果是Mock模式则立即初始化
setTimeout(() => {
  const isMockMode = localStorage.getItem('mockMode') === 'true'
  if (isMockMode) {
    initializeMockState()
  }
}, 100)

// Mock DataBridge 实现
const mockDataBridgeImpl: IDataBridge = {
  // ========== 用户认证相关 ==========
  async login(username: string, password: string): Promise<User> {
    await simulateNetworkDelay()
    
    console.log(`[MockDataBridge] Attempting login: ${username}`)
    
    // 简单的用户名密码验证：用户名和密码相同，或者demo/demo
    const isValidCredential = (username === 'demo' && password === 'demo') ||
                              (username === 'alice' && password === 'alice') ||
                              (username === 'bob' && password === 'bob')
    
    if (!isValidCredential) {
      throw new Error('用户名或密码错误')
    }
    
    // 查找现有用户或创建新用户
    let user = mockUsers.find(u => u.username === username)
    
    if (!user) {
      // 创建新用户
      user = {
        id: `user_${Date.now()}`,
        username: username,
        displayName: username === 'demo' ? '演示用户' : username.charAt(0).toUpperCase() + username.slice(1),
        email: `${username}@example.com`
      }
      mockUsers.push(user)
    }
    
    // 通过统一的DataStore管理状态
    const store = getDataStore()
    if (store) {
      store.getState().setCurrentUser(user)
    }
    
    // 保存用户状态到localStorage (Mock模式)
    localStorage.setItem('mock_current_user', JSON.stringify(user))
    
    toast.success(`欢迎回来，${user.displayName}！(Mock模式)`)
    return user
  },

  async logout(): Promise<void> {
    await simulateNetworkDelay()
    
    console.log('[MockDataBridge] User logout')
    
    // 清除保存的用户状态
    localStorage.removeItem('mock_current_user')
    
    // 通过统一的DataStore清理状态
    const store = getDataStore()
    if (store) {
      store.getState().logout()
    }
    
    toast.success('已退出登录 (Mock模式)')
  },

  // ========== 项目管理相关 ==========
  async fetchProjects(): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 通过统一的DataStore获取当前用户
    const store = getDataStore()
    if (!store) {
      console.log('[MockDataBridge] fetchProjects - DataStore not available')
      return []
    }
    
    const currentUser = store.getState().currentUser
    
    console.log('[MockDataBridge] fetchProjects - currentUser:', currentUser)
    console.log('[MockDataBridge] fetchProjects - total mockProjects:', mockProjects.length)
    
    if (!currentUser) {
      console.log('[MockDataBridge] fetchProjects - no current user, returning empty array')
      return []
    }
    
    // 返回用户可以访问的项目（拥有的或作为协作者的）
    const userProjects = mockProjects.filter(project => {
      const isOwner = project.ownerId === currentUser.id
      const isCollaborator = project.collaborators.some(collab => collab.userId === currentUser.id)
      console.log(`[MockDataBridge] Project ${project.name} - isOwner: ${isOwner}, isCollaborator: ${isCollaborator}`)
      return isOwner || isCollaborator
    })
    
    console.log('[MockDataBridge] fetchProjects - user accessible projects:', userProjects.length)
    
    // 通过统一的DataStore更新项目列表
    store.getState().setProjects(userProjects)
    
    return userProjects
  },

  async createProject(name: string, _description?: string): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // 通过统一的DataStore获取当前用户
    const store = getDataStore()
    if (!store) {
      throw new Error('系统未初始化')
    }
    
    const currentUser = store.getState().currentUser
    
    if (!currentUser) {
      throw new Error('用户未登录')
    }
    
    const newProject: Project = {
      id: `project${Date.now()}`,
      name,
      ownerId: currentUser.id,
      files: [
        {
          fileId: `file${Date.now()}`,
          name: 'main.tex',
          content: `\\documentclass{article}
\\title{${name}}
\\begin{document}
\\maketitle

% 开始编写你的内容...

\\end{document}`,
          isMain: true
        }
      ],
      collaborators: [
        { userId: currentUser.id, username: currentUser.username, role: 'owner' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockProjects.push(newProject)
    
    // 刷新项目列表以更新全局状态
    await this.fetchProjects()
    
    toast.success('项目创建成功 (Mock模式)')
    return newProject
  },

  async openProject(projectId: string): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const project = mockProjects.find(p => p.id === projectId)
    if (!project) {
      throw new Error('项目未找到')
    }
    
    // 通过统一的DataStore更新当前项目
    const store = getDataStore()
    if (store) {
      store.getState().setCurrentProject(project)
    }
    
    return project
  },

  async deleteProject(projectId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = mockProjects.findIndex(p => p.id === projectId)
    if (index !== -1) {
      mockProjects.splice(index, 1)
      toast.success('项目删除成功 (Mock模式)')
    } else {
      throw new Error('项目未找到')
    }
  },

  // ========== 文件操作相关 ==========
  async saveFile(projectId: string, fileId: string, content: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const project = mockProjects.find(p => p.id === projectId)
    if (project) {
      const file = project.files.find(f => f.fileId === fileId)
      if (file) {
        file.content = content
        project.updatedAt = new Date().toISOString()
        
        // 通过统一的DataStore更新当前项目
        const store = getDataStore()
        store.getState().setCurrentProject(project)
        
        toast.success('文件保存成功 (Mock模式)')
      }
    }
  },

  async createFile(projectId: string, name: string, content: string = ''): Promise<FileEntry> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const project = mockProjects.find(p => p.id === projectId)
    if (!project) {
      throw new Error('项目未找到')
    }
    
    const newFile: FileEntry = {
      fileId: `file${Date.now()}`,
      name,
      content,
      isMain: false
    }
    
    project.files.push(newFile)
    project.updatedAt = new Date().toISOString()
    
    // 通过统一的DataStore更新当前项目
    const store = getDataStore()
    store.getState().setCurrentProject(project)
    
    toast.success('文件创建成功 (Mock模式)')
    return newFile
  },

  async deleteFile(projectId: string, fileId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const project = mockProjects.find(p => p.id === projectId)
    if (project) {
      const index = project.files.findIndex(f => f.fileId === fileId)
      if (index !== -1) {
        project.files.splice(index, 1)
        project.updatedAt = new Date().toISOString()
        
        // 通过统一的DataStore更新当前项目
        const store = getDataStore()
        store.getState().setCurrentProject(project)
        
        toast.success('文件删除成功 (Mock模式)')
      }
    }
  },

  // ========== 协作者管理相关 ==========
  async addCollaborator(projectId: string, userIdentifier: string, role: Role): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const project = mockProjects.find(p => p.id === projectId)
    const user = mockUsers.find(u => u.username === userIdentifier || u.email === userIdentifier)
    
    if (!project) {
      throw new Error('项目未找到')
    }
    
    if (!user) {
      throw new Error('用户未找到')
    }
    
    // 检查是否已是协作者
    if (project.collaborators.find(c => c.userId === user.id)) {
      throw new Error('该用户已是项目协作者')
    }
    
    project.collaborators.push({
      userId: user.id,
      username: user.username,
      role
    })
    
    // 通过统一的DataStore更新当前项目
    const store = getDataStore()
    store.getState().setCurrentProject(project)
    
    toast.success('协作者添加成功 (Mock模式)')
  },

  async updateMemberRole(projectId: string, userId: string, newRole: Role): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const project = mockProjects.find(p => p.id === projectId)
    if (project) {
      const member = project.collaborators.find(c => c.userId === userId)
      if (member) {
        member.role = newRole
        
        // 通过统一的DataStore更新当前项目
        const store = getDataStore()
        store.getState().setCurrentProject(project)
        
        toast.success('权限更新成功 (Mock模式)')
      }
    }
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const project = mockProjects.find(p => p.id === projectId)
    if (project) {
      const index = project.collaborators.findIndex(c => c.userId === userId)
      if (index !== -1) {
        project.collaborators.splice(index, 1)
        
        // 通过统一的DataStore更新当前项目
        const store = getDataStore()
        store.getState().setCurrentProject(project)
        
        toast.success('协作者移除成功 (Mock模式)')
      }
    }
  },

  // ========== 编译日志相关 ==========
  addCompileLog(log: CompileLogEntry): void {
    // 通过统一的DataStore管理编译日志
    updateDataStore(store => store.getState().addCompileLog(log))
    console.log('Mock compile log:', log)
  },

  clearCompileLogs(): void {
    // 通过统一的DataStore清理编译日志
    updateDataStore(store => store.getState().clearCompileLogs())
    console.log('[MockDataBridge] Compile logs cleared')
  },

  // ========== 编辑器文件系统相关 ==========
  async getProjectFiles(projectId: string): Promise<string[]> {
    await simulateNetworkDelay()
    
    console.log(`[MockDataBridge] Getting files for project: ${projectId}`)
    
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('用户未登录')
    }

    const project = mockProjects.find(p => p.id === projectId)
    if (!project) {
      throw new Error('项目不存在')
    }

    // 从项目的文件列表构建文件路径数组
    const files: string[] = []
    
    project.files.forEach(file => {
      // 如果文件名包含目录路径，确保目录也在列表中
      if (file.name.includes('/')) {
        const dirPath = file.name.substring(0, file.name.lastIndexOf('/') + 1)
        if (!files.includes(dirPath)) {
          files.push(dirPath) // 目录以 '/' 结尾
        }
      }
      files.push(file.name)
    })

    // 排序：目录在前，文件在后
    files.sort((a, b) => {
      const aIsDir = a.endsWith('/')
      const bIsDir = b.endsWith('/')
      
      if (aIsDir && !bIsDir) return -1
      if (!aIsDir && bIsDir) return 1
      return a.localeCompare(b)
    })

    console.log(`[MockDataBridge] Found files:`, files)
    return files
  },

  async readFile(projectId: string, filePath: string): Promise<string> {
    await simulateNetworkDelay()
    
    console.log(`[MockDataBridge] Reading file: ${projectId}/${filePath}`)
    
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('用户未登录')
    }

    const project = mockProjects.find(p => p.id === projectId)
    if (!project) {
      throw new Error('项目不存在')
    }

    const file = project.files.find(f => f.name === filePath)
    if (!file) {
      throw new Error(`文件不存在: ${filePath}`)
    }

    console.log(`[MockDataBridge] File content length: ${file.content?.length || 0}`)
    return file.content || ''
  },

  async writeFile(projectId: string, filePath: string, content: string): Promise<void> {
    await simulateNetworkDelay()
    
    console.log(`[MockDataBridge] Writing file: ${projectId}/${filePath}`)
    
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('用户未登录')
    }

    const project = mockProjects.find(p => p.id === projectId)
    if (!project) {
      throw new Error('项目不存在')
    }

    const file = project.files.find(f => f.name === filePath)
    if (file) {
      // 更新现有文件
      file.content = content
    } else {
      // 创建新文件
      const newFile: FileEntry = {
        fileId: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: filePath,
        content: content,
        isMain: filePath === 'main.tex'
      }
      project.files.push(newFile)
    }

    console.log(`[MockDataBridge] File written successfully`)
    toast.success(`文件 ${filePath} 已保存`)
  },

  async fileExists(projectId: string, path: string): Promise<boolean> {
    await simulateNetworkDelay()
    
    console.log(`[MockDataBridge] Checking if exists: ${projectId}/${path}`)
    
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return false
    }

    const project = mockProjects.find(p => p.id === projectId)
    if (!project) {
      return false
    }

    // 检查文件是否存在
    const fileExists = project.files.some(f => f.name === path)
    
    // 检查目录是否存在（如果路径以 '/' 结尾或有文件在该目录下）
    const dirExists = path.endsWith('/') 
      ? project.files.some(f => f.name.startsWith(path))
      : project.files.some(f => f.name.startsWith(path + '/'))

    const exists = fileExists || dirExists
    console.log(`[MockDataBridge] Path exists: ${exists}`)
    return exists
  },

  getProjectPath(projectId: string): string {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return `/projects/guest/${projectId}`
    }

    // 返回用户隔离的项目路径
    const projectPath = `/projects/${currentUser.username}/${projectId}`
    console.log(`[MockDataBridge] Project path: ${projectPath}`)
    return projectPath
  },

  async initializeProjectSpace(projectId: string): Promise<void> {
    await simulateNetworkDelay()
    
    console.log(`[MockDataBridge] Initializing project space: ${projectId}`)
    
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('用户未登录')
    }

    // 检查项目是否已存在
    let project = mockProjects.find(p => p.id === projectId)
    
    if (!project) {
      // 如果项目不存在，创建默认项目
      console.log(`[MockDataBridge] Creating default project for user: ${currentUser.username}`)
      
      project = createDefaultLatexProject(currentUser.id, currentUser.displayName || currentUser.username)
      project.id = projectId // 使用指定的项目ID
      project.name = projectId === 'demo-project' ? '📄 演示项目' : project.name
      
      mockProjects.push(project)
      
      // 通过统一的DataStore更新状态
      updateDataStore(store => store.getState().setCurrentProject(project))
      await this.fetchProjects() // 刷新项目列表
      
      toast.success('项目空间初始化完成')
    } else {
      console.log(`[MockDataBridge] Project already exists: ${projectId}`)
      updateDataStore(store => store.getState().setCurrentProject(project))
    }
  }
}

// 导出类型安全的Mock DataBridge
export const mockDataBridge = createDataBridge(mockDataBridgeImpl)

// 导出Mock状态初始化函数
export { initializeMockState } 