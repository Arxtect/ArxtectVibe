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

// 全局状态管理 - 简化版本用于 Mock 模式
let currentUser: User | null = null
let projects: Project[] = []
let currentProject: Project | null = null
let compileLogs: CompileLogEntry[] = []

const useDataStore = {
  getState: () => ({
    currentUser,
    projects,
    currentProject,
    compileLogs,
    setLoading: (_: boolean) => {}, // Mock 模式下忽略 loading 状态
    setCurrentUser: (user: User | null) => { currentUser = user },
    setProjects: (projectList: Project[]) => { projects = projectList },
    setCurrentProject: (project: Project | null) => { currentProject = project },
    addCompileLog: (log: CompileLogEntry) => { compileLogs.push(log) },
    clearCompileLogs: () => { compileLogs = [] }
  })
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

const mockFiles: FileEntry[] = [
  {
    fileId: 'file1',
    name: 'main.tex',
    content: `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}

\\title{示例 LaTeX 文档}
\\author{Demo User}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{介绍}

这是一个示例 LaTeX 文档，用于演示协同编辑功能。

\\section{数学公式}

这里是一个数学公式：
\\begin{equation}
    E = mc^2
\\end{equation}

\\section{列表}

\\begin{itemize}
    \\item 第一项
    \\item 第二项
    \\item 第三项
\\end{itemize}

\\end{document}`,
    isMain: true
  },
  {
    fileId: 'file2',
    name: 'chapter1.tex',
    content: `\\chapter{第一章}

\\section{概述}

这是第一章的内容。

\\section{详细信息}

这里包含更多详细信息。`,
    isMain: false
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

单行公式：
\\begin{equation}
    E = mc^2
    \\label{eq:einstein}
\\end{equation}

多行公式：
\\begin{align}
    a^2 + b^2 &= c^2 \\\\
    \\sin^2\\theta + \\cos^2\\theta &= 1
\\end{align}

行内公式：我们知道 $\\pi \\approx 3.14159$。

\\subsection{表格示例}

\\begin{table}[h]
\\centering
\\caption{示例数据表}
\\label{tab:example}
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

如表~\\ref{tab:example}所示，这是一个标准的三线表格式。`,
      isMain: false
    },
    // 结果章节
    {
      fileId: `results_${userId}`,
      name: 'sections/results.tex',
      content: `\\section{结果}

\\subsection{图片插入示例}

% 注意：实际使用时需要将图片文件放在正确的路径
\\begin{figure}[h]
\\centering
% \\includegraphics[width=0.8\\textwidth]{figures/example.png}
\\rule{8cm}{5cm} % 占位符，实际使用时替换为includegraphics
\\caption{示例图片（占位符）}
\\label{fig:example}
\\end{figure}

图~\\ref{fig:example}展示了一个示例图片的插入方法。

\\subsection{列表示例}

编号列表：
\\begin{enumerate}
    \\item 第一项
    \\item 第二项
        \\begin{enumerate}
            \\item 子项目A
            \\item 子项目B
        \\end{enumerate}
    \\item 第三项
\\end{enumerate}

无编号列表：
\\begin{itemize}
    \\item 要点一
    \\item 要点二
    \\item 要点三
\\end{itemize}`,
      isMain: false
    },
    // 结论章节
    {
      fileId: `conclusion_${userId}`,
      name: 'sections/conclusion.tex',
      content: `\\section{结论}

本文档展示了一个完整的LaTeX项目模板结构，包含：

\\begin{itemize}
    \\item 文档的基本配置和包引用
    \\item 模块化的章节组织
    \\item 数学公式、表格、图片的标准用法
    \\item 参考文献的管理方式
\\end{itemize}

这个模板可以作为大多数学术文档、报告或论文的起点。

\\subsection{后续工作}

您可以基于这个模板：
\\begin{enumerate}
    \\item 根据需要添加或删除章节
    \\item 调整文档类型和格式设置
    \\item 添加更多的LaTeX包以支持特定功能
    \\item 完善参考文献数据库
\\end{enumerate}

有关更多LaTeX使用技巧，请参考相关文档~\\cite{latex2023}。`,
      isMain: false
    },
    // 参考文献文件
    {
      fileId: `bib_${userId}`,
      name: 'references.bib',
      content: `@book{latex2023,
    title={LaTeX: A Document Preparation System},
    author={Leslie Lamport},
    year={2023},
    publisher={Addison-Wesley},
    edition={3rd}
}

@article{example2024,
    title={An Example Article},
    author={Smith, John and Doe, Jane},
    journal={Journal of Examples},
    volume={42},
    number={1},
    pages={123--456},
    year={2024},
    publisher={Example Publisher}
}

@misc{web2024,
    title={Online LaTeX Resources},
    author={LaTeX Community},
    year={2024},
    url={https://www.latex-project.org/},
    note={Accessed: 2024-01-01}
}`,
      isMain: false
    },
    // 配置文件
    {
      fileId: `config_${userId}`,
      name: 'config/packages.tex',
      content: `% 这个文件包含额外的包配置
% 可以根据项目需要添加特定的包和设置

% 中文支持（如需要）
% \\usepackage[UTF8]{ctex}

% 代码高亮（如需要）
% \\usepackage{listings}
% \\usepackage{xcolor}

% 算法伪代码（如需要）
% \\usepackage{algorithm}
% \\usepackage{algorithmic}

% 更多数学符号（如需要）
% \\usepackage{mathtools}
% \\usepackage{amsthm}

% 自定义命令示例
\\newcommand{\\highlight}[1]{\\textbf{\\color{blue}#1}}
\\newcommand{\\todo}[1]{\\textbf{\\color{red}TODO: #1}}

% 自定义环境示例
\\newtheorem{theorem}{定理}[section]
\\newtheorem{lemma}[theorem]{引理}
\\newtheorem{definition}[theorem]{定义}`,
      isMain: false
    }
  ],
  collaborators: [
    { userId, username, role: 'owner' }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

const mockProjects: Project[] = [
  // Demo用户的默认项目
  createDefaultLatexProject('user1', 'demo'),
  // Alice用户的默认项目  
  createDefaultLatexProject('user2', 'alice'),
  // Bob用户的默认项目
  createDefaultLatexProject('user3', 'bob'),
  // 原有的示例项目保留，作为协作示例
  {
    id: 'project1',
    name: '📝 协作示例论文',
    ownerId: 'user1',
    files: [mockFiles[0], mockFiles[1]],
    collaborators: [
      { userId: 'user1', username: 'demo', role: 'owner' },
      { userId: 'user2', username: 'alice', role: 'editor' },
      { userId: 'user3', username: 'bob', role: 'viewer' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'project2', 
    name: '🧮 数学作业',
    ownerId: 'user1',
    files: [
      {
        fileId: 'file3',
        name: 'homework.tex',
        content: `\\documentclass{article}
\\begin{document}
\\title{数学作业}
\\maketitle

\\section{问题1}
证明 $\\sqrt{2}$ 是无理数。

\\section{问题2}
计算积分 $\\int_0^1 x^2 dx$。

\\end{document}`,
        isMain: true
      }
    ],
    collaborators: [
      { userId: 'user1', username: 'demo', role: 'owner' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

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
    
    useDataStore.getState().setCurrentUser(user)
    
    // 保存用户状态到localStorage (Mock模式)
    localStorage.setItem('mock_current_user', JSON.stringify(user))
    
    toast.success(`欢迎回来，${user.displayName}！(Mock模式)`)
    return user
  },

  async logout(): Promise<void> {
    await simulateNetworkDelay()
    
    console.log('[MockDataBridge] User logout')
    useDataStore.getState().setCurrentUser(null)
    
    // 清除保存的用户状态
    localStorage.removeItem('mock_current_user')
    
    toast.success('已退出登录 (Mock模式)')
  },

  // ========== 项目管理相关 ==========
  async fetchProjects(): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 获取当前登录用户
    const { useDataStore } = await import('./dataBridge')
    const currentUser = useDataStore.getState().currentUser
    
    if (!currentUser) {
      return []
    }
    
    // 返回用户可以访问的项目（拥有的或作为协作者的）
    const userProjects = mockProjects.filter(project => 
      project.ownerId === currentUser.id || 
      project.collaborators.some(collab => collab.userId === currentUser.id)
    )
    
    // 重要：更新全局状态中的项目列表
    useDataStore.getState().setProjects(userProjects)
    
    return userProjects
  },

  async createProject(name: string, _description?: string): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // 获取当前登录用户
    const { useDataStore } = await import('./dataBridge')
    const currentUser = useDataStore.getState().currentUser
    
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
    
    // 重要：更新全局状态中的当前项目
    const { useDataStore } = await import('./dataBridge')
    useDataStore.getState().setCurrentProject(project)
    
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
        
        // 更新全局状态中的当前项目
        const { useDataStore } = await import('./dataBridge')
        useDataStore.getState().setCurrentProject(project)
        
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
    
    // 更新全局状态中的当前项目
    const { useDataStore } = await import('./dataBridge')
    useDataStore.getState().setCurrentProject(project)
    
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
        
        // 更新全局状态中的当前项目
        const { useDataStore } = await import('./dataBridge')
        useDataStore.getState().setCurrentProject(project)
        
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
    
    // 更新全局状态中的当前项目
    const { useDataStore } = await import('./dataBridge')
    useDataStore.getState().setCurrentProject(project)
    
    toast.success('协作者添加成功 (Mock模式)')
  },

  async updateMemberRole(projectId: string, userId: string, newRole: Role): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const project = mockProjects.find(p => p.id === projectId)
    if (project) {
      const member = project.collaborators.find(c => c.userId === userId)
      if (member) {
        member.role = newRole
        
        // 更新全局状态中的当前项目
        const { useDataStore } = await import('./dataBridge')
        useDataStore.getState().setCurrentProject(project)
        
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
        
        // 更新全局状态中的当前项目
        const { useDataStore } = await import('./dataBridge')
        useDataStore.getState().setCurrentProject(project)
        
        toast.success('协作者移除成功 (Mock模式)')
      }
    }
  },

  // ========== 编译日志相关 ==========
  addCompileLog(log: CompileLogEntry): void {
    // Mock模式下的日志处理
    console.log('Mock compile log:', log)
  },

  clearCompileLogs(): void {
    useDataStore.getState().clearCompileLogs()
    console.log('[MockDataBridge] Compile logs cleared')
  },

  // ========== 编辑器文件系统相关 ==========
  async getProjectFiles(projectId: string): Promise<string[]> {
    await simulateNetworkDelay()
    
    console.log(`[MockDataBridge] Getting files for project: ${projectId}`)
    
    const currentUser = useDataStore.getState().currentUser
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
    
    const currentUser = useDataStore.getState().currentUser
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
    
    const currentUser = useDataStore.getState().currentUser
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
    
    const currentUser = useDataStore.getState().currentUser
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
    const currentUser = useDataStore.getState().currentUser
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
    
    const currentUser = useDataStore.getState().currentUser
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
      
      // 更新全局状态
      useDataStore.getState().setProjects([...mockProjects])
      useDataStore.getState().setCurrentProject(project)
      
      toast.success('项目空间初始化完成')
    } else {
      console.log(`[MockDataBridge] Project already exists: ${projectId}`)
      useDataStore.getState().setCurrentProject(project)
    }
  }
}

// 导出类型安全的Mock DataBridge
export const mockDataBridge = createDataBridge(mockDataBridgeImpl) 