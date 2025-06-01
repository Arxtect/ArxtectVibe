// 用户信息与会话
export interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  // ...其他可能的用户属性
}

// 项目及文件结构
export interface Project {
  id: string;
  name: string;
  ownerId: string;                 // 拥有者用户ID
  files: FileEntry[];              // 项目包含的文件列表
  collaborators: ProjectMember[];  // 协作者列表及权限
  createdAt: string;
  updatedAt: string;
}

export interface FileEntry {
  fileId: string;
  name: string;        // 文件名，如 "main.tex", "chap1.tex"
  path?: string;       // 文件路径（若支持目录，可包含目录路径，否则可省略）
  content?: string;    // 文件内容初始值（选填：打开项目时由后端提供初始内容）
  isMain?: boolean;    // 是否主文档（编译入口tex文件）
}

// 项目协作者及权限
export type Role = 'owner' | 'editor' | 'viewer';

export interface ProjectMember {
  userId: string;
  username: string;
  role: Role;
}

// 编译输出日志结构
export interface CompileLogEntry {
  type: 'info' | 'warning' | 'error';
  message: string;
  file?: string;    // 所属文件（如果能确定）
  line?: number;    // 出现行号（如解析得到）
  timestamp?: number;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 全局状态类型
export interface AppState {
  currentUser: User | null;
  projects: Project[];
  currentProject: Project | null;
  compileLogs: CompileLogEntry[];
  isLoading: boolean;
}

// 编译结果类型
export interface CompileResult {
  success: boolean;
  pdfData?: ArrayBuffer;
  logs: CompileLogEntry[];
} 