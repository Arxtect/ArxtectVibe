# WebIDE - VS Code 风格的插件化 Web IDE

## 🎯 架构概述

WebIDE 是基于 VS Code 架构设计的插件化 Web 集成开发环境。它采用微内核架构，核心功能最小化，所有扩展功能通过插件系统实现。

## 🏗️ 核心架构

### 微内核设计
```
WebIDE Core (微内核)
├── FileSystem (BrowserFS)     # 统一文件系统接口
├── PluginManager             # 插件管理器
├── EventBus                  # 事件总线
├── ServiceRegistry           # 服务注册中心
├── UI Framework              # 基础UI框架
└── Extension Host            # 插件宿主环境
```

### 插件化架构
```
Plugin Ecosystem
├── Core Plugins (内置插件)
│   ├── FileExplorer          # 文件浏览器
│   ├── TextEditor            # 文本编辑器 (Monaco)
│   ├── TerminalEmulator      # 终端模拟器
│   └── StatusBar             # 状态栏
├── Extension Plugins (扩展插件)
│   ├── PDFViewer             # PDF 查看器 📋 第一个插件
│   ├── LaTeXCompiler         # LaTeX 编译器
│   ├── AIAssistant           # AI 助手
│   ├── CollaborativeEditing  # 协同编辑
│   └── Custom Extensions     # 自定义扩展
```

## 🗂️ 文件系统 (BrowserFS)

### 抽象文件系统接口
```typescript
interface IFileSystem {
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
}
```

### BrowserFS 配置
```typescript
const fsConfig = {
  fs: "MountableFileSystem",
  options: {
    "/": { fs: "IndexedDB", options: {} },           // 持久化存储
    "/tmp": { fs: "InMemory", options: {} },         // 临时文件
    "/projects": { fs: "IndexedDB", options: {} },   // 项目文件
    "/plugins": { fs: "HTTPRequest", options: {} }   // 插件资源
  }
}
```

## 🔌 插件系统

### 插件接口定义
```typescript
interface IPlugin {
  readonly id: string                    // 插件唯一标识
  readonly name: string                  // 插件名称
  readonly version: string               // 版本号
  readonly description: string           // 描述
  readonly dependencies?: string[]       // 依赖插件
  
  activate(context: IPluginContext): Promise<void>    // 激活插件
  deactivate(): Promise<void>                         // 停用插件
}

interface IPluginContext {
  subscriptions: Disposable[]           // 资源清理
  fileSystem: IFileSystem              // 文件系统访问
  eventBus: IEventBus                  # 事件通信
  serviceRegistry: IServiceRegistry    # 服务注册
  ui: IUIProvider                      # UI 服务
}
```

### 插件注册机制
```typescript
interface IPluginManifest {
  id: string
  name: string
  version: string
  main: string                         // 入口文件
  contributes: {
    commands?: CommandContribution[]   // 命令贡献
    menus?: MenuContribution[]         // 菜单贡献
    viewContainers?: ViewContainer[]   // 视图容器
    views?: ViewContribution[]         // 视图贡献
    languages?: LanguageContribution[] // 语言支持
    themes?: ThemeContribution[]       // 主题贡献
  }
}
```

## 🚀 第一个插件：PDF 查看器

### 插件清单 (plugin.json)
```json
{
  "id": "pdf-viewer",
  "name": "PDF Viewer",
  "version": "1.0.0",
  "description": "View PDF documents in the IDE",
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "pdfViewer.open",
        "title": "Open with PDF Viewer"
      }
    ],
    "menus": {
      "explorer/context": [
        {
          "command": "pdfViewer.open",
          "when": "resourceExtname == .pdf"
        }
      ]
    },
    "customEditors": [
      {
        "viewType": "pdfViewer.preview",
        "displayName": "PDF Preview",
        "selector": [
          {
            "filenamePattern": "*.pdf"
          }
        ]
      }
    ]
  }
}
```

### 插件实现
```typescript
export class PDFViewerPlugin implements IPlugin {
  readonly id = 'pdf-viewer'
  readonly name = 'PDF Viewer'
  readonly version = '1.0.0'
  readonly description = 'View PDF documents in the IDE'

  async activate(context: IPluginContext): Promise<void> {
    // 注册 PDF 查看器命令
    const openCommand = context.commands.registerCommand(
      'pdfViewer.open',
      this.openPDF.bind(this)
    )

    // 注册自定义编辑器
    const customEditor = context.customEditors.registerCustomEditor(
      'pdfViewer.preview',
      PDFEditorProvider
    )

    context.subscriptions.push(openCommand, customEditor)
  }

  private async openPDF(uri: string): Promise<void> {
    // 实现 PDF 打开逻辑
  }
}
```

## 📁 目录结构

```
src/modules/Editor/WebIDE/
├── README.md                    # 本文档
├── core/                        # 核心框架
│   ├── FileSystem/             # 文件系统抽象
│   │   ├── BrowserFS.ts        # BrowserFS 集成
│   │   ├── FileSystemService.ts # 文件系统服务
│   │   └── types.ts            # 文件系统类型
│   ├── PluginManager/          # 插件管理
│   │   ├── PluginManager.ts    # 插件管理器
│   │   ├── PluginContext.ts    # 插件上下文
│   │   ├── PluginLoader.ts     # 插件加载器
│   │   └── types.ts            # 插件类型
│   ├── EventBus/               # 事件系统
│   │   ├── EventBus.ts         # 事件总线
│   │   └── types.ts            # 事件类型
│   ├── Services/               # 核心服务
│   │   ├── ServiceRegistry.ts  # 服务注册
│   │   ├── CommandService.ts   # 命令服务
│   │   ├── MenuService.ts      # 菜单服务
│   │   └── UIService.ts        # UI 服务
│   └── UI/                     # 基础UI
│       ├── Workbench.tsx       # 工作台主界面
│       ├── ActivityBar.tsx     # 活动栏
│       ├── SideBar.tsx         # 侧边栏
│       ├── EditorArea.tsx      # 编辑器区域
│       ├── Panel.tsx           # 面板区域
│       └── StatusBar.tsx       # 状态栏
├── plugins/                     # 插件目录
│   ├── pdf-viewer/             # PDF 查看器插件
│   │   ├── plugin.json         # 插件清单
│   │   ├── extension.ts        # 插件入口
│   │   ├── PDFViewer.tsx       # PDF 查看器组件
│   │   └── PDFEditorProvider.ts # 自定义编辑器提供者
│   ├── file-explorer/          # 文件浏览器 (内置)
│   ├── text-editor/            # 文本编辑器 (内置)
│   └── ...                     # 其他插件
├── WebIDE.tsx                   # WebIDE 主组件
├── types.ts                     # 全局类型定义
└── index.ts                     # 模块导出
```

## 🎮 使用示例

### 基础使用
```tsx
import { WebIDE } from '@/modules/Editor/WebIDE'

function App() {
  return (
    <WebIDE
      projectPath="/projects/my-latex-project"
      plugins={['pdf-viewer', 'latex-compiler']}
      theme="dark"
    />
  )
}
```

### 插件开发
```typescript
// 自定义插件
export class MyCustomPlugin implements IPlugin {
  readonly id = 'my-plugin'
  readonly name = 'My Custom Plugin'
  readonly version = '1.0.0'
  readonly description = 'A custom plugin example'

  async activate(context: IPluginContext): Promise<void> {
    // 插件逻辑
  }

  async deactivate(): Promise<void> {
    // 清理资源
  }
}
```

## 🔄 与现有 Editor 集成

WebIDE 将作为 EditorV2 的升级版本，保持向后兼容：

```typescript
// 渐进迁移方案
const EditorV3: React.FC<EditorProps> = (props) => {
  const useWebIDE = props.enableWebIDE ?? false
  
  if (useWebIDE) {
    return <WebIDE {...props} />
  }
  
  return <EditorV2 {...props} />
}
```

## 🎯 发展路线图

### Phase 1: 核心框架 (2 周)
- [x] 架构设计
- [ ] BrowserFS 集成
- [ ] 插件管理器
- [ ] 基础 UI 框架

### Phase 2: 第一个插件 (1 周)
- [ ] PDF 查看器插件
- [ ] 插件注册机制
- [ ] 演示项目集成

### Phase 3: 核心插件 (3 周)
- [ ] 文件浏览器插件
- [ ] Monaco 编辑器插件
- [ ] 终端模拟器插件

### Phase 4: 高级功能 (4 周)
- [ ] LaTeX 编译器插件
- [ ] AI 助手插件
- [ ] 协同编辑插件

这个架构提供了极大的扩展性和灵活性，使得 WebIDE 可以逐步演进为一个功能完整的 Web 开发环境，同时保持代码的模块化和可维护性。 