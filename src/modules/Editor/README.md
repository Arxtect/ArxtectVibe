# Editor 模块 - 协同 LaTeX 编辑器

## 概述

Editor 模块是 ArxtectVibe 平台的核心产品，提供了一个功能强大的在线协同 LaTeX 编辑环境。该模块集成了现代化的代码编辑器、AI 智能助手、实时协同编辑、前端编译等先进功能，旨在为用户提供类似 Cursor + Overleaf 的顶级编辑体验。

## 🎯 核心特性

### 📝 Monaco Editor 集成
- 基于 VS Code 的 Monaco Editor，提供专业级编辑体验
- 完整的 LaTeX 语法高亮和智能补全
- 支持多文件编辑，标签页切换
- 代码折叠、括号匹配、错误提示等高级功能
- 自定义快捷键和编辑器主题

### 🤖 AI Agent 智能助手
- **类 Cursor 体验**：内联 AI 建议和代码生成
- **Function Calling**：支持调用外部工具和函数
- **互动式对话**：浏览器内来回对话，实时工具调用结果
- **上下文感知**：基于当前文档内容提供精准建议
- **LaTeX 专家**：专门优化的 LaTeX 编写助手

### 🔗 实时协同编辑
- 基于 **Yjs + WebSocket** 的 CRDT 协同方案
- 多用户实时编辑，无冲突合并
- 协作者光标和选择区域可视化
- 操作历史和版本控制
- Mock 模式支持本地 Socket 测试

### ⚡ 前端编译系统
- 基于 WebAssembly 的 LaTeX 编译器
- 本地编译，无需服务器资源
- 实时预览，编译结果即时显示
- 详细的错误日志和调试信息
- 支持多种 LaTeX 引擎 (pdflatex, xelatex, lualatex)

### 🛠️ 灵活的部署模式
- **云端模式**：连接后端服务，企业级功能
- **本地模式**：仅需 API Key，直接使用公有 LLM
- **Mock 模式**：完全离线，开发测试友好

## 🏗️ 架构设计

```
src/modules/Editor/
├── README.md                 # 本文档
├── Editor.tsx                # 主编辑器容器组件
├── components/               # 子组件
│   ├── Monaco/              # Monaco Editor 集成
│   │   ├── MonacoEditor.tsx    # 编辑器主组件
│   │   ├── LaTeXLanguage.ts    # LaTeX 语言定义
│   │   ├── themes/             # 编辑器主题
│   │   └── extensions/         # 编辑器扩展
│   ├── AIAgent/             # AI 智能助手
│   │   ├── AIPanel.tsx         # AI 对话面板
│   │   ├── InlineCompletion.tsx # 内联建议
│   │   ├── FunctionCalling.tsx # 工具调用界面
│   │   └── ChatHistory.tsx     # 对话历史
│   ├── Collaboration/       # 协同编辑
│   │   ├── YjsProvider.tsx     # Yjs 协同提供者
│   │   ├── CursorOverlay.tsx   # 协作者光标
│   │   ├── CollaboratorList.tsx # 在线用户列表
│   │   └── ConflictResolver.tsx # 冲突解决
│   ├── Compiler/            # 编译系统
│   │   ├── CompilerPanel.tsx   # 编译控制面板
│   │   ├── WasmCompiler.ts     # WASM 编译器接口
│   │   ├── CompileWorker.ts    # 编译 Web Worker
│   │   └── ErrorParser.ts      # 错误日志解析
│   ├── FileTree/            # 文件管理
│   │   ├── FileTree.tsx        # 文件树组件
│   │   ├── FileTab.tsx         # 文件标签页
│   │   └── FileOperations.tsx  # 文件操作
│   └── Preview/             # 预览系统
│       ├── PDFViewer.tsx       # PDF 预览器
│       ├── SyncScroll.tsx      # 同步滚动
│       └── AnnotationLayer.tsx # 注释层
├── hooks/                   # React Hooks
│   ├── useMonacoEditor.ts      # Monaco 编辑器钩子
│   ├── useYjsCollaboration.ts  # Yjs 协同钩子
│   ├── useAIAgent.ts           # AI 助手钩子
│   ├── useCompiler.ts          # 编译系统钩子
│   └── useEditorSettings.ts    # 编辑器设置钩子
├── services/                # 服务层
│   ├── aiService.ts            # AI 服务接口
│   ├── collaborationService.ts # 协同服务
│   ├── compilerService.ts      # 编译服务
│   └── socketService.ts        # WebSocket 服务
├── types/                   # TypeScript 类型定义
│   ├── editor.ts               # 编辑器类型
│   ├── collaboration.ts        # 协同类型
│   ├── ai.ts                   # AI 相关类型
│   └── compiler.ts             # 编译器类型
└── utils/                   # 工具函数
    ├── editorUtils.ts          # 编辑器工具
    ├── collaborationUtils.ts   # 协同工具
    └── latexUtils.ts           # LaTeX 工具
```

## 🔧 技术栈

### 核心依赖
- **Monaco Editor**: VS Code 编辑器核心
- **Yjs**: CRDT 协同编辑框架
- **y-websocket**: Yjs WebSocket 提供者
- **y-monaco**: Monaco Editor Yjs 绑定
- **@monaco-editor/react**: React Monaco 组件

### AI 集成
- **OpenAI SDK**: GPT 模型接口
- **Anthropic SDK**: Claude 模型接口
- **Function Calling**: 工具调用框架
- **Streaming**: 流式响应处理

### 编译系统
- **tex-wasm**: WebAssembly LaTeX 编译器
- **pdf.js**: PDF 渲染和预览
- **Web Workers**: 后台编译处理

### 协同编辑
- **WebSocket**: 实时通信
- **Socket.IO**: WebSocket 增强 (可选)
- **Presence**: 用户在线状态
- **Awareness**: 协作者感知

## 🚀 快速开始

### 环境配置

1. **安装依赖**
```bash
npm install monaco-editor @monaco-editor/react
npm install yjs y-websocket y-monaco
npm install openai @anthropic-ai/sdk
npm install tex-wasm pdf.js-dist
```

2. **环境变量配置**
```env
# .env.local
VITE_OPENAI_API_KEY=your_openai_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_WEBSOCKET_URL=ws://localhost:3001
VITE_COMPILER_WASM_URL=/wasm/tex.wasm
```

### 基础使用

```tsx
import { Editor } from '@/modules/Editor'

function App() {
  return (
    <Editor
      projectId="project-123"
      fileId="main.tex"
      userId="user-456"
      aiEnabled={true}
      collaborationEnabled={true}
    />
  )
}
```

## 📚 功能模块详解

### Monaco Editor 集成

#### LaTeX 语言支持
```typescript
// LaTeXLanguage.ts
export const latexLanguageDefinition = {
  keywords: ['\\documentclass', '\\begin', '\\end', '\\usepackage'],
  commands: ['\\section', '\\subsection', '\\paragraph'],
  environments: ['document', 'figure', 'table', 'equation'],
  // ... 完整的 LaTeX 语法定义
}
```

#### 自定义主题
```typescript
// themes/latex-dark.ts
export const latexDarkTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'latex.command', foreground: '#569cd6' },
    { token: 'latex.environment', foreground: '#4ec9b0' },
    // ... 专为 LaTeX 优化的主题
  ]
}
```

### AI Agent 系统

#### Function Calling 机制
```typescript
// types/ai.ts
export interface AIFunction {
  name: string
  description: string
  parameters: Record<string, any>
  execute: (params: any) => Promise<any>
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  function_call?: {
    name: string
    arguments: string
  }
  tool_calls?: ToolCall[]
}
```

#### 内联建议
```typescript
// components/AIAgent/InlineCompletion.tsx
export function InlineCompletion({ editor, cursor }: Props) {
  const { getSuggestion } = useAIAgent()
  
  // 基于光标位置和上下文提供智能建议
  const suggestion = useMemo(() => {
    const context = getContextAroundCursor(editor, cursor)
    return getSuggestion(context)
  }, [editor, cursor])
  
  return <SuggestionOverlay suggestion={suggestion} />
}
```

### 协同编辑

#### Yjs 集成
```typescript
// hooks/useYjsCollaboration.ts
export function useYjsCollaboration(projectId: string) {
  const doc = useMemo(() => new Y.Doc(), [])
  const provider = useMemo(() => 
    new WebsocketProvider(wsUrl, projectId, doc), [projectId]
  )
  
  const yText = doc.getText('content')
  const awareness = provider.awareness
  
  return { doc, provider, yText, awareness }
}
```

#### 协作者可视化
```typescript
// components/Collaboration/CursorOverlay.tsx
export function CursorOverlay({ awareness }: Props) {
  const [cursors, setCursors] = useState<CollaboratorCursor[]>([])
  
  useEffect(() => {
    awareness.on('change', () => {
      const states = Array.from(awareness.getStates().values())
      setCursors(states.map(parseCursorState))
    })
  }, [awareness])
  
  return (
    <div className="cursor-overlay">
      {cursors.map(cursor => (
        <CursorIndicator key={cursor.clientId} cursor={cursor} />
      ))}
    </div>
  )
}
```

### 编译系统

#### WASM 编译器
```typescript
// services/compilerService.ts
export class CompilerService {
  private wasmModule: any = null
  
  async initialize() {
    this.wasmModule = await loadWasm('/wasm/tex.wasm')
  }
  
  async compile(files: FileMap): Promise<CompileResult> {
    return new Promise((resolve) => {
      const worker = new Worker('/workers/compile.worker.js')
      
      worker.postMessage({ files, wasmModule: this.wasmModule })
      worker.onmessage = (e) => resolve(e.data)
    })
  }
}
```

#### 错误解析
```typescript
// utils/errorParser.ts
export function parseLatexErrors(log: string): CompileError[] {
  const errors: CompileError[] = []
  
  // 解析 LaTeX 编译日志，提取错误信息
  const errorRegex = /!\s*(.*)\nl\.(\d+)\s*(.*)/g
  let match
  
  while ((match = errorRegex.exec(log)) !== null) {
    errors.push({
      type: 'error',
      message: match[1],
      line: parseInt(match[2]),
      context: match[3]
    })
  }
  
  return errors
}
```

## 🔗 API 接口

### Editor 主组件接口
```typescript
export interface EditorProps {
  projectId: string
  fileId?: string
  userId: string
  aiEnabled?: boolean
  collaborationEnabled?: boolean
  compilerEnabled?: boolean
  theme?: 'light' | 'dark' | 'auto'
  settings?: EditorSettings
  onSave?: (content: string) => void
  onCompile?: (result: CompileResult) => void
}
```

### AI Agent 配置
```typescript
export interface AIAgentConfig {
  provider: 'openai' | 'anthropic' | 'local'
  model: string
  apiKey?: string
  baseURL?: string
  temperature?: number
  maxTokens?: number
  functions?: AIFunction[]
}
```

### 协同编辑配置
```typescript
export interface CollaborationConfig {
  websocketUrl: string
  roomId: string
  userId: string
  userName: string
  userColor?: string
  persistence?: boolean
}
```

## 🧪 测试与开发

### Mock 模式测试
```typescript
// Mock WebSocket 服务器
const mockSocketServer = new MockWebSocketServer()
mockSocketServer.simulateCollaboration([
  { userId: 'user1', name: 'Alice' },
  { userId: 'user2', name: 'Bob' }
])
```

### AI Agent 测试
```typescript
// Mock AI 响应
const mockAIService = {
  async generateCompletion(prompt: string) {
    return {
      content: "% Mock LaTeX suggestion\n\\section{Introduction}",
      reasoning: "Generated a section header based on context"
    }
  }
}
```

### 编译器测试
```typescript
// Mock 编译结果
const mockCompileResult = {
  success: true,
  pdf: new Uint8Array(/* mock PDF data */),
  log: "LaTeX compilation completed successfully",
  errors: [],
  warnings: []
}
```

## 📝 使用示例

### 基础编辑器
```tsx
<Editor
  projectId="latex-project-1"
  fileId="main.tex"
  userId="user-123"
  theme="dark"
/>
```

### 完整功能编辑器
```tsx
<Editor
  projectId="collaborative-paper"
  userId="author-1"
  aiEnabled={true}
  collaborationEnabled={true}
  compilerEnabled={true}
  settings={{
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: true
  }}
  onSave={(content) => console.log('Document saved')}
  onCompile={(result) => console.log('Compilation result:', result)}
/>
```

### AI Agent 集成
```tsx
<Editor
  projectId="ai-assisted-writing"
  userId="researcher-1"
  aiEnabled={true}
  aiConfig={{
    provider: 'openai',
    model: 'gpt-4',
    functions: [
      {
        name: 'insert_citation',
        description: 'Insert a LaTeX citation',
        parameters: { /* ... */ },
        execute: async (params) => { /* ... */ }
      }
    ]
  }}
/>
```

## 🛣️ 开发路线图

### Phase 1: 基础架构 ✅
- [x] Monaco Editor 集成
- [x] 基础 LaTeX 语法支持
- [x] 文件树和标签页
- [x] 基础编译流程

### Phase 2: 协同编辑 🚧
- [ ] Yjs 协同编辑集成
- [ ] WebSocket 连接管理
- [ ] 协作者可视化
- [ ] 冲突解决机制

### Phase 3: AI Agent 🔮
- [ ] 内联建议系统
- [ ] Function Calling 框架
- [ ] 对话式编程界面
- [ ] 上下文感知优化

### Phase 4: 高级功能 🔮
- [ ] 高级编译选项
- [ ] 版本控制集成
- [ ] 插件系统
- [ ] 性能优化

## 🤝 贡献指南

### 开发环境搭建
1. 克隆仓库并安装依赖
2. 配置环境变量
3. 启动开发服务器: `npm run dev`
4. 访问 Editor 模块: `/editor/:projectId`

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 React Hooks 最佳实践
- 组件单一职责原则
- 完善的类型定义和注释

### 测试要求
- 单元测试覆盖率 > 80%
- 集成测试验证核心流程
- E2E 测试验证用户体验
- 性能测试确保响应速度

---

> 💡 **提示**: Editor 模块是项目的核心，包含了最复杂的功能和最先进的技术。开发过程中遇到问题，欢迎查阅文档或在团队内讨论。让我们一起打造最优秀的在线 LaTeX 编辑体验！ 