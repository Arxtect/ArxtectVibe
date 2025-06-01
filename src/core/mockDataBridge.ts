import { 
  User, 
  Project, 
  FileEntry,
  CompileLogEntry,
  Role
} from '@/types'
import toast from 'react-hot-toast'
import { IDataBridge, createDataBridge } from './dataBridgeInterface'

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
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 简单的用户名密码验证
    if (username === 'demo' && password === 'demo') {
      const user = mockUsers[0]
      
      // 重要：更新全局状态中的当前用户
      const { useDataStore } = await import('./dataBridge')
      useDataStore.getState().setCurrentUser(user)
      
      toast.success('登录成功 (Mock模式)')
      return user
    } else if (username === 'alice' && password === 'alice') {
      const user = mockUsers[1] 
      
      // 重要：更新全局状态中的当前用户
      const { useDataStore } = await import('./dataBridge')
      useDataStore.getState().setCurrentUser(user)
      
      toast.success('登录成功 (Mock模式)')
      return user
    } else if (username === 'bob' && password === 'bob') {
      const user = mockUsers[2] 
      
      // 重要：更新全局状态中的当前用户
      const { useDataStore } = await import('./dataBridge')
      useDataStore.getState().setCurrentUser(user)
      
      toast.success('登录成功 (Mock模式)')
      return user
    } else {
      toast.error('用户名或密码错误')
      throw new Error('用户名或密码错误')
    }
  },

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 清除全局状态中的当前用户
    const { useDataStore } = await import('./dataBridge')
    useDataStore.getState().logout()
    
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
    // Mock模式下清空日志
    console.log('Mock: Compile logs cleared')
  }
}

// 导出类型安全的Mock DataBridge
export const mockDataBridge = createDataBridge(mockDataBridgeImpl) 