/**
 * DataBridge 统一接口定义
 * 
 * 此接口确保 mockDataBridge 和 realDataBridge 具有完全相同的方法签名
 * 如果两个实现不匹配，TypeScript 编译将失败
 */

import { User, Project, FileEntry, Role, CompileLogEntry } from '@/types'

export interface IDataBridge {
  // ========== 用户认证相关 ==========
  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns Promise<User> 用户信息
   */
  login(username: string, password: string): Promise<User>
  
  /**
   * 用户登出
   * @returns Promise<void>
   */
  logout(): Promise<void>

  // ========== 项目管理相关 ==========
  /**
   * 获取用户项目列表
   * @returns Promise<Project[]> 项目列表
   */
  fetchProjects(): Promise<Project[]>
  
  /**
   * 创建新项目
   * @param name 项目名称
   * @param description 项目描述（可选）
   * @returns Promise<Project> 创建的项目
   */
  createProject(name: string, description?: string): Promise<Project>
  
  /**
   * 打开项目（获取详细信息并更新全局状态）
   * @param projectId 项目ID
   * @returns Promise<Project> 项目详细信息
   */
  openProject(projectId: string): Promise<Project>
  
  /**
   * 删除项目
   * @param projectId 项目ID
   * @returns Promise<void>
   */
  deleteProject(projectId: string): Promise<void>

  // ========== 文件操作相关 ==========
  /**
   * 保存文件内容
   * @param projectId 项目ID
   * @param fileId 文件ID
   * @param content 文件内容
   * @returns Promise<void>
   */
  saveFile(projectId: string, fileId: string, content: string): Promise<void>
  
  /**
   * 创建新文件
   * @param projectId 项目ID
   * @param name 文件名
   * @param content 初始内容（可选）
   * @returns Promise<FileEntry> 创建的文件
   */
  createFile(projectId: string, name: string, content?: string): Promise<FileEntry>
  
  /**
   * 删除文件
   * @param projectId 项目ID
   * @param fileId 文件ID
   * @returns Promise<void>
   */
  deleteFile(projectId: string, fileId: string): Promise<void>

  // ========== 编辑器文件系统相关 ==========
  /**
   * 获取项目文件列表（包含目录结构）
   * @param projectId 项目ID
   * @returns Promise<string[]> 文件路径列表，目录以 '/' 结尾
   */
  getProjectFiles(projectId: string): Promise<string[]>
  
  /**
   * 读取文件内容
   * @param projectId 项目ID
   * @param filePath 文件相对路径
   * @returns Promise<string> 文件内容
   */
  readFile(projectId: string, filePath: string): Promise<string>
  
  /**
   * 写入文件内容
   * @param projectId 项目ID
   * @param filePath 文件相对路径
   * @param content 文件内容
   * @returns Promise<void>
   */
  writeFile(projectId: string, filePath: string, content: string): Promise<void>
  
  /**
   * 检查文件/目录是否存在
   * @param projectId 项目ID
   * @param path 文件或目录路径
   * @returns Promise<boolean>
   */
  fileExists(projectId: string, path: string): Promise<boolean>
  
  /**
   * 获取用户项目根路径
   * @param projectId 项目ID
   * @returns string 项目在文件系统中的实际路径
   */
  getProjectPath(projectId: string): string
  
  /**
   * 初始化项目文件空间（确保项目目录和示例文件存在）
   * @param projectId 项目ID
   * @returns Promise<void>
   */
  initializeProjectSpace(projectId: string): Promise<void>

  // ========== 协作者管理相关 ==========
  /**
   * 添加协作者
   * @param projectId 项目ID
   * @param userIdentifier 用户标识（用户名或邮箱）
   * @param role 角色
   * @returns Promise<void>
   */
  addCollaborator(projectId: string, userIdentifier: string, role: Role): Promise<void>
  
  /**
   * 更新成员角色
   * @param projectId 项目ID
   * @param userId 用户ID
   * @param newRole 新角色
   * @returns Promise<void>
   */
  updateMemberRole(projectId: string, userId: string, newRole: Role): Promise<void>
  
  /**
   * 移除协作者
   * @param projectId 项目ID
   * @param userId 用户ID
   * @returns Promise<void>
   */
  removeMember(projectId: string, userId: string): Promise<void>

  // ========== 编译日志相关 ==========
  /**
   * 添加编译日志
   * @param log 日志条目
   * @returns void
   */
  addCompileLog(log: CompileLogEntry): void
  
  /**
   * 清空编译日志
   * @returns void
   */
  clearCompileLogs(): void
}

/**
 * DataBridge 实现验证函数
 * 用于在运行时验证实现是否符合接口规范
 */
export function validateDataBridgeImplementation(impl: any): impl is IDataBridge {
  const requiredMethods = [
    'login', 'logout',
    'fetchProjects', 'createProject', 'openProject', 'deleteProject',
    'saveFile', 'createFile', 'deleteFile', 
    'addCollaborator', 'updateMemberRole', 'removeMember',
    'addCompileLog', 'clearCompileLogs',
    'getProjectFiles', 'readFile', 'writeFile', 'fileExists', 'getProjectPath', 'initializeProjectSpace'
  ]
  
  for (const method of requiredMethods) {
    if (typeof impl[method] !== 'function') {
      console.error(`DataBridge implementation missing method: ${method}`)
      return false
    }
  }
  
  return true
}

/**
 * 类型安全的DataBridge创建函数
 * 确保实现符合IDataBridge接口
 */
export function createDataBridge(implementation: IDataBridge): IDataBridge {
  if (!validateDataBridgeImplementation(implementation)) {
    throw new Error('Invalid DataBridge implementation')
  }
  return implementation
} 