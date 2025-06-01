import { 
  User, 
  Project, 
  FileEntry,
  CompileLogEntry,
  Role
} from '@/types'
import toast from 'react-hot-toast'

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

const mockProjects: Project[] = [
  {
    id: 'project1',
    name: '示例论文',
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
    name: '数学作业',
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

// Mock DataBridge API方法
export const mockDataBridge = {
  // 用户认证相关
  async login(username: string, password: string): Promise<User> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 简单的用户名密码验证
    if (username === 'demo' && password === 'demo') {
      const user = mockUsers[0]
      toast.success('登录成功 (Mock模式)')
      return user
    } else if (username === 'alice' && password === 'alice') {
      const user = mockUsers[1] 
      toast.success('登录成功 (Mock模式)')
      return user
    } else {
      toast.error('用户名或密码错误')
      throw new Error('用户名或密码错误')
    }
  },

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    toast.success('已退出登录 (Mock模式)')
  },

  // 项目管理相关
  async fetchProjects(): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockProjects]
  },

  async createProject(name: string, _description?: string): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const newProject: Project = {
      id: `project${Date.now()}`,
      name,
      ownerId: 'user1',
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
        { userId: 'user1', username: 'demo', role: 'owner' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockProjects.push(newProject)
    toast.success('项目创建成功 (Mock模式)')
    return newProject
  },

  async openProject(projectId: string): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const project = mockProjects.find(p => p.id === projectId)
    if (!project) {
      throw new Error('项目未找到')
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

  // 文件操作相关
  async saveFile(projectId: string, fileId: string, content: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const project = mockProjects.find(p => p.id === projectId)
    if (project) {
      const file = project.files.find(f => f.fileId === fileId)
      if (file) {
        file.content = content
        project.updatedAt = new Date().toISOString()
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
        toast.success('文件删除成功 (Mock模式)')
      }
    }
  },

  // 协作者管理相关
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
    
    toast.success('协作者添加成功 (Mock模式)')
  },

  async updateMemberRole(projectId: string, userId: string, newRole: Role): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const project = mockProjects.find(p => p.id === projectId)
    if (project) {
      const member = project.collaborators.find(c => c.userId === userId)
      if (member) {
        member.role = newRole
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
        toast.success('协作者移除成功 (Mock模式)')
      }
    }
  },

  // 编译日志相关
  addCompileLog(log: CompileLogEntry): void {
    // Mock模式下的日志处理
    console.log('Mock compile log:', log)
  },

  clearCompileLogs(): void {
    // Mock模式下清空日志
    console.log('Mock: Compile logs cleared')
  }
} 