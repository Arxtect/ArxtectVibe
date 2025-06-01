import { create } from 'zustand'
import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'
import { User, Project, FileEntry, Role, CompileLogEntry } from '@/types'
import { mockDataBridge } from './mockDataBridge'
import { IDataBridge, createDataBridge } from './dataBridgeInterface'

// API 配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：添加认证令牌
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：处理认证错误
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      useDataStore.getState().logout()
      toast.error('登录已过期，请重新登录')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API 响应类型
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// 全局状态接口
interface AppState {
  // 状态数据
  isLoading: boolean
  currentUser: User | null
  projects: Project[]
  currentProject: Project | null
  compileLogs: CompileLogEntry[]
  isMockMode: boolean
}

interface DataStore extends AppState {
  // Actions
  setLoading: (loading: boolean) => void
  setCurrentUser: (user: User | null) => void
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addCompileLog: (log: CompileLogEntry) => void
  clearCompileLogs: () => void
  setMockMode: (isMockMode: boolean) => void
  logout: () => void
}

// 创建状态管理器
export const useDataStore = create<DataStore>((set) => ({
  // 初始状态
  isLoading: false,
  currentUser: null,
  projects: [],
  currentProject: null,
  compileLogs: [],
  isMockMode: localStorage.getItem('mockMode') === 'true',
  
  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addCompileLog: (log) => set((state) => ({ 
    compileLogs: [...state.compileLogs, log] 
  })),
  clearCompileLogs: () => set({ compileLogs: [] }),
  setMockMode: (isMockMode) => {
    localStorage.setItem('mockMode', isMockMode.toString())
    set({ isMockMode })
    // 切换模式时清除当前状态
    set({ 
      currentUser: null, 
      projects: [], 
      currentProject: null,
      compileLogs: []
    })
  },
  logout: () => set({ 
    currentUser: null, 
    projects: [], 
    currentProject: null 
  }),
}))

// 实际后端 DataBridge 实现
const realDataBridgeImpl: IDataBridge = {
  // ========== 用户认证相关 ==========
  async login(username: string, password: string): Promise<User> {
    try {
      useDataStore.getState().setLoading(true)
      const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/login', {
        username,
        password,
      })
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data
        localStorage.setItem('auth_token', token)
        useDataStore.getState().setCurrentUser(user)
        toast.success('登录成功')
        return user
      } else {
        throw new Error(response.data.message || '登录失败')
      }
    } catch (error: unknown) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || error.message || '登录失败'
        : error instanceof Error
        ? error.message
        : '登录失败'
      toast.error(message)
      throw new Error(message)
    } finally {
      useDataStore.getState().setLoading(false)
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      useDataStore.getState().logout()
      toast.success('已退出登录')
    }
  },

  // ========== 项目管理相关 ==========
  async fetchProjects(): Promise<Project[]> {
    try {
      useDataStore.getState().setLoading(true)
      const response = await apiClient.get<ApiResponse<Project[]>>('/projects')
      
      if (response.data.success && response.data.data) {
        const projects = response.data.data
        useDataStore.getState().setProjects(projects)
        return projects
      } else {
        throw new Error(response.data.message || '获取项目列表失败')
      }
    } catch (error: unknown) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || error.message || '获取项目列表失败'
        : error instanceof Error
        ? error.message
        : '获取项目列表失败'
      toast.error(message)
      throw new Error(message)
    } finally {
      useDataStore.getState().setLoading(false)
    }
  },

  async createProject(name: string, description?: string): Promise<Project> {
    try {
      useDataStore.getState().setLoading(true)
      const response = await apiClient.post<ApiResponse<Project>>('/projects', {
        name,
        description,
      })
      
      if (response.data.success && response.data.data) {
        const project = response.data.data
        // 更新项目列表
        await this.fetchProjects()
        toast.success('项目创建成功')
        return project
      } else {
        throw new Error(response.data.message || '创建项目失败')
      }
    } catch (error: unknown) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || error.message || '创建项目失败'
        : error instanceof Error
        ? error.message
        : '创建项目失败'
      toast.error(message)
      throw new Error(message)
    } finally {
      useDataStore.getState().setLoading(false)
    }
  },

  async openProject(projectId: string): Promise<Project> {
    try {
      useDataStore.getState().setLoading(true)
      const response = await apiClient.get<ApiResponse<Project>>(`/projects/${projectId}`)
      
      if (response.data.success && response.data.data) {
        const project = response.data.data
        useDataStore.getState().setCurrentProject(project)
        return project
      } else {
        throw new Error(response.data.message || '打开项目失败')
      }
    } catch (error: unknown) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || error.message || '打开项目失败'
        : error instanceof Error
        ? error.message
        : '打开项目失败'
      toast.error(message)
      throw new Error(message)
    } finally {
      useDataStore.getState().setLoading(false)
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/projects/${projectId}`)
      
      if (response.data.success) {
        // 刷新项目列表
        await this.fetchProjects()
        toast.success('项目删除成功')
      } else {
        throw new Error(response.data.message || '删除项目失败')
      }
    } catch (error: unknown) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || error.message || '删除项目失败'
        : error instanceof Error
        ? error.message
        : '删除项目失败'
      toast.error(message)
      throw new Error(message)
    }
  },

  // ========== 文件操作相关 ==========
  async saveFile(projectId: string, fileId: string, content: string): Promise<void> {
    try {
      const response = await apiClient.put<ApiResponse<void>>(
        `/projects/${projectId}/files/${fileId}`,
        { content }
      )
      
      if (!response.data.success) {
        throw new Error(response.data.message || '保存文件失败')
      }
      
      toast.success('文件保存成功')
    } catch (error: unknown) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || error.message || '保存文件失败'
        : error instanceof Error
        ? error.message
        : '保存文件失败'
      toast.error(message)
      throw new Error(message)
    }
  },

  async createFile(projectId: string, name: string, content: string = ''): Promise<FileEntry> {
    try {
      const response = await apiClient.post<ApiResponse<FileEntry>>(
        `/projects/${projectId}/files`,
        { name, content }
      )
      
      if (response.data.success && response.data.data) {
        // 刷新当前项目
        await this.openProject(projectId)
        toast.success('文件创建成功')
        return response.data.data
      } else {
        throw new Error(response.data.message || '创建文件失败')
      }
    } catch (error: unknown) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || error.message || '创建文件失败'
        : error instanceof Error
        ? error.message
        : '创建文件失败'
      toast.error(message)
      throw new Error(message)
    }
  },

  async deleteFile(projectId: string, fileId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/projects/${projectId}/files/${fileId}`
      )
      
      if (response.data.success) {
        // 刷新当前项目
        await this.openProject(projectId)
        toast.success('文件删除成功')
      } else {
        throw new Error(response.data.message || '删除文件失败')
      }
    } catch (error: unknown) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || error.message || '删除文件失败'
        : error instanceof Error
        ? error.message
        : '删除文件失败'
      toast.error(message)
      throw new Error(message)
    }
  },

  // ========== 协作者管理相关 ==========
  async addCollaborator(projectId: string, userIdentifier: string, role: Role): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        `/projects/${projectId}/collaborators`,
        { userIdentifier, role }
      )
      
      if (response.data.success) {
        // 刷新当前项目
        await this.openProject(projectId)
        toast.success('协作者添加成功')
      } else {
        throw new Error(response.data.message || '添加协作者失败')
      }
    } catch (error: unknown) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || error.message || '添加协作者失败'
        : error instanceof Error
        ? error.message
        : '添加协作者失败'
      toast.error(message)
      throw new Error(message)
    }
  },

  async updateMemberRole(projectId: string, userId: string, newRole: Role): Promise<void> {
    try {
      const response = await apiClient.put<ApiResponse<void>>(
        `/projects/${projectId}/collaborators/${userId}`,
        { role: newRole }
      )
      
      if (response.data.success) {
        // 刷新当前项目
        await this.openProject(projectId)
        toast.success('权限更新成功')
      } else {
        throw new Error(response.data.message || '更新权限失败')
      }
    } catch (error: unknown) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || error.message || '更新权限失败'
        : error instanceof Error
        ? error.message
        : '更新权限失败'
      toast.error(message)
      throw new Error(message)
    }
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/projects/${projectId}/collaborators/${userId}`
      )
      
      if (response.data.success) {
        // 刷新当前项目
        await this.openProject(projectId)
        toast.success('协作者移除成功')
      } else {
        throw new Error(response.data.message || '移除协作者失败')
      }
    } catch (error: unknown) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || error.message || '移除协作者失败'
        : error instanceof Error
        ? error.message
        : '移除协作者失败'
      toast.error(message)
      throw new Error(message)
    }
  },

  // ========== 编译日志相关 ==========
  addCompileLog(log: CompileLogEntry): void {
    useDataStore.getState().addCompileLog(log)
  },

  clearCompileLogs(): void {
    useDataStore.getState().clearCompileLogs()
  }
}

// 创建类型安全的真实DataBridge
const realDataBridge = createDataBridge(realDataBridgeImpl)

// 动态DataBridge代理，根据当前模式自动切换
const createDynamicDataBridge = (): IDataBridge => {
  const handler: ProxyHandler<IDataBridge> = {
    get(_target, prop) {
      const currentBridge = useDataStore.getState().isMockMode ? mockDataBridge : realDataBridge
      const value = currentBridge[prop as keyof IDataBridge]
      return typeof value === 'function' ? value.bind(currentBridge) : value
    }
  }
  
  // 使用空对象作为代理目标，所有操作都通过handler处理
  return new Proxy({} as IDataBridge, handler)
}

// 统一的DataBridge导出 - 使用代理实现动态切换
export const dataBridge: IDataBridge = createDynamicDataBridge()

// 切换模式的函数
export function switchDataBridgeMode(isMockMode: boolean): void {
  useDataStore.getState().setMockMode(isMockMode)
} 