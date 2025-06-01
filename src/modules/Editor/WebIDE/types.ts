import { ReactNode } from 'react'

// ========== 基础类型 ==========

export interface Disposable {
  dispose(): void
}

export interface Event<T> {
  (listener: (e: T) => any, thisArg?: any): Disposable
}

export interface Stats {
  isFile(): boolean
  isDirectory(): boolean
  size: number
  mtime: Date
  ctime: Date
}

export interface Watcher extends Disposable {
  // 文件监听器
}

// ========== AI 相关类型 ==========

export interface AIFunction {
  name: string
  description: string
  parameters: Record<string, any>
  execute: (params: any) => Promise<any>
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'function'
  content: string
  function_call?: {
    name: string
    arguments: string
  }
  tool_calls?: ToolCall[]
  timestamp: number
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface AIAgentConfig {
  provider: 'openai' | 'anthropic' | 'local'
  model: string
  apiKey?: string
  baseURL?: string
  temperature?: number
  maxTokens?: number
  functions?: AIFunction[]
  systemPrompt?: string
}

export interface AIInlineCompletion {
  text: string
  range: {
    startLineNumber: number
    startColumn: number
    endLineNumber: number
    endColumn: number
  }
  confidence: number
  reasoning?: string
}

export interface AIConversation {
  id: string
  messages: AIMessage[]
  context: {
    fileId: string
    fileName: string
    cursorPosition: { line: number; column: number }
    selectedText?: string
    documentContent?: string
  }
  isActive: boolean
  timestamp: number
}

export interface AIAgentState {
  isEnabled: boolean
  config: AIAgentConfig
  conversations: AIConversation[]
  activeConversationId: string | null
  isGenerating: boolean
  inlineCompletion: AIInlineCompletion | null
}

// AI 服务接口
export interface AIService {
  initialize(): Promise<void>
  generateCompletion(prompt: string, context?: any): Promise<string>
  generateInlineCompletion(documentContent: string, cursorPosition: { line: number; column: number }): Promise<AIInlineCompletion | null>
  processMessages(messages: AIMessage[]): Promise<AIMessage>
  callFunction(functionName: string, parameters: any): Promise<any>
  updateConfig(newConfig: Partial<AIAgentConfig>): void
  isEnabled(): boolean
  getAvailableFunctions(): AIFunction[]
}

// ========== 文件系统 ==========

export interface IFileSystem {
  // 文件操作
  readFile(path: string): Promise<Buffer>
  writeFile(path: string, data: Buffer): Promise<void>
  deleteFile(path: string): Promise<void>
  
  // 目录操作
  readdir(path: string): Promise<string[]>
  mkdir(path: string): Promise<void>
  rmdir(path: string): Promise<void>
  
  // 文件信息
  stat(path: string): Promise<Stats>
  exists(path: string): Promise<boolean>
  
  // 监听变化
  watch(path: string, callback: (event: string, filename: string) => void): Watcher
  
  // 路径处理
  join(...paths: string[]): string
  dirname(path: string): string
  basename(path: string): string
  extname(path: string): string
}

// ========== 事件系统 ==========

export interface IEventBus {
  emit<T>(event: string, data: T): void
  on<T>(event: string, listener: (data: T) => void): Disposable
  once<T>(event: string, listener: (data: T) => void): Disposable
  off(event: string, listener: Function): void
}

// ========== 命令系统 ==========

export interface ICommand {
  id: string
  title: string
  category?: string
  when?: string  // 条件表达式
}

export interface CommandContribution {
  command: string
  title: string
  category?: string
  icon?: string
  when?: string
}

export interface ICommandService {
  registerCommand(id: string, handler: (...args: any[]) => any): Disposable
  executeCommand<T>(id: string, ...args: any[]): Promise<T>
  getCommands(): ICommand[]
}

// ========== 菜单系统 ==========

export interface MenuContribution {
  command: string
  title: string
  when?: string
  group?: string
  order?: number
}

export interface IMenuService {
  registerMenu(id: string, items: MenuContribution[]): Disposable
  getMenu(id: string): MenuContribution[]
}

// ========== 视图系统 ==========

export interface ViewContainer {
  id: string
  title: string
  icon: string
}

export interface ViewContribution {
  id: string
  name: string
  when?: string
  viewContainer: string
}

export interface IView {
  id: string
  title: string
  render(): ReactNode
}

// ========== 编辑器系统 ==========

export interface CustomEditorSelector {
  filenamePattern?: string
  scheme?: string
}

export interface CustomEditorContribution {
  viewType: string
  displayName: string
  selector: CustomEditorSelector[]
  priority?: 'default' | 'builtin' | 'option'
}

export interface ICustomEditorProvider {
  viewType: string
  canEdit(uri: string): boolean
  render(uri: string, content: Buffer): ReactNode
}

export interface ICustomEditorService {
  registerCustomEditor(viewType: string, provider: ICustomEditorProvider): Disposable
  getCustomEditor(uri: string): ICustomEditorProvider | undefined
}

// ========== 语言支持 ==========

export interface LanguageContribution {
  id: string
  extensions: string[]
  aliases?: string[]
  configuration?: string
}

// ========== 主题系统 ==========

export interface ThemeContribution {
  id: string
  label: string
  uiTheme: 'vs' | 'vs-dark' | 'hc-black'
  path: string
}

// ========== 服务注册 ==========

export interface IServiceRegistry {
  register<T>(id: string, service: T): void
  get<T>(id: string): T | undefined
  has(id: string): boolean
}

// ========== UI 提供者 ==========

export interface IUIProvider {
  showMessage(message: string, type?: 'info' | 'warning' | 'error' | 'success'): void
  showInputBox(options: { prompt: string; placeholder?: string }): Promise<string | undefined>
  showQuickPick(items: string[], options?: { placeholder?: string }): Promise<string | undefined>
  registerViewContainer(container: ViewContainer): Disposable
  registerView(viewId: string, view: IView): Disposable
}

// ========== 插件系统 ==========

export interface IPluginManifest {
  id: string
  name: string
  version: string
  description: string
  publisher?: string
  license?: string
  main: string
  activationEvents?: string[]
  dependencies?: string[]
  contributes?: {
    commands?: CommandContribution[]
    menus?: { [key: string]: MenuContribution[] }
    viewContainers?: { [key: string]: ViewContainer[] }
    views?: { [key: string]: ViewContribution[] }
    customEditors?: CustomEditorContribution[]
    languages?: LanguageContribution[]
    themes?: ThemeContribution[]
  }
}

export interface IPluginContext {
  subscriptions: Disposable[]
  fileSystem: IFileSystem
  eventBus: IEventBus
  serviceRegistry: IServiceRegistry
  commands: ICommandService
  menus: IMenuService
  customEditors: ICustomEditorService
  ui: IUIProvider
  
  // 工作区相关
  workspaceUri: string
  extensionUri: string
  
  // 全局状态
  globalState: { [key: string]: any }
  workspaceState: { [key: string]: any }
}

export interface IPlugin {
  readonly id: string
  readonly name: string
  readonly version: string
  readonly description: string
  readonly dependencies?: string[]
  
  activate(context: IPluginContext): Promise<void>
  deactivate(): Promise<void>
}

export interface IPluginManager {
  loadPlugin(manifest: IPluginManifest): Promise<IPlugin>
  activatePlugin(id: string): Promise<void>
  deactivatePlugin(id: string): Promise<void>
  getPlugin(id: string): IPlugin | undefined
  getAllPlugins(): IPlugin[]
  isActive(id: string): boolean
}

// ========== WebIDE 主接口 ==========

export interface WebIDEProps {
  projectPath: string
  plugins?: string[]
  theme?: 'light' | 'dark' | 'auto'
  enabledFeatures?: {
    fileExplorer?: boolean
    terminal?: boolean
    git?: boolean
    debug?: boolean
  }
  onReady?: () => void
  onError?: (error: Error) => void
}

export interface IWorkbench {
  fileSystem: IFileSystem
  pluginManager: IPluginManager
  eventBus: IEventBus
  serviceRegistry: IServiceRegistry
  
  // UI 组件引用
  activityBar: any
  sideBar: any
  editorArea: any
  panel: any
  statusBar: any
}

// ========== 工作区 ==========

export interface IWorkspace {
  uri: string
  name: string
  folders: string[]
}

// ========== 编辑器组 ==========

export interface IEditorGroup {
  id: string
  editors: IEditor[]
  activeEditor?: IEditor
}

export interface IEditor {
  id: string
  uri: string
  isDirty: boolean
  viewType: string
  title: string
}

// ========== 扩展事件 ==========

export interface FileChangeEvent {
  type: 'created' | 'changed' | 'deleted'
  uri: string
}

export interface EditorChangeEvent {
  editor: IEditor
  kind: 'opened' | 'closed' | 'activated'
}

export interface PluginEvent {
  plugin: IPlugin
  state: 'loading' | 'activated' | 'deactivated' | 'error'
}

// ========== 工具和实用类型 ==========

export type URI = string

export interface Position {
  line: number
  character: number
}

export interface Range {
  start: Position
  end: Position
}

export interface TextEdit {
  range: Range
  newText: string
}

export interface WorkspaceEdit {
  changes: { [uri: string]: TextEdit[] }
} 