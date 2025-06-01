# Editor 模块依赖需求

## 核心编辑器依赖

```bash
# Monaco Editor - VS Code 编辑器核心
npm install monaco-editor @monaco-editor/react

# 或者使用 React Monaco Editor
npm install @monaco-editor/react
```

## AI 集成依赖

```bash
# OpenAI SDK
npm install openai

# Anthropic Claude SDK
npm install @anthropic-ai/sdk

# AI 工具调用支持
npm install zod  # 用于参数验证
```

## 协同编辑依赖

```bash
# Yjs CRDT 框架
npm install yjs

# WebSocket 提供者
npm install y-websocket

# Monaco 编辑器绑定
npm install y-monaco

# WebSocket 客户端（可选，增强功能）
npm install socket.io-client
```

## LaTeX 编译依赖

```bash
# WebAssembly LaTeX 编译器
npm install @latexjs/core

# 或者使用其他 WASM LaTeX 实现
# npm install texlive-wasm

# PDF 处理
npm install pdf.js-dist
npm install pdfjs-dist

# Web Workers 支持
npm install comlink  # 用于 Worker 通信
```

## 开发依赖

```bash
# TypeScript 类型定义
npm install -D @types/pdf.js

# Monaco Editor 类型定义
npm install -D monaco-editor-webpack-plugin  # 如果使用 webpack
```

## 环境变量设置

在 `.env.local` 中添加：

```env
# AI 服务配置
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key

# 协同编辑配置
VITE_WEBSOCKET_URL=ws://localhost:3001
VITE_YJS_ROOM_PREFIX=latex_editor_

# 编译器配置
VITE_WASM_COMPILER_URL=/wasm/texlive.wasm
VITE_COMPILER_TIMEOUT=30000

# 功能开关
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_WASM_COMPILER=true
```

## Vite 配置更新

在 `vite.config.ts` 中可能需要添加：

```typescript
import { defineConfig } from 'vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    // 其他插件...
    monacoEditorPlugin({
      languages: ['latex', 'tex', 'typescript', 'javascript']
    })
  ],
  optimizeDeps: {
    include: [
      'monaco-editor',
      'yjs',
      'y-websocket',
      'y-monaco'
    ]
  },
  worker: {
    format: 'es'
  }
})
```

## 安装说明

1. **基础安装**（当前阶段）：
```bash
npm install @monaco-editor/react
```

2. **完整功能安装**（后续开发）：
```bash
npm install monaco-editor @monaco-editor/react yjs y-websocket y-monaco openai @anthropic-ai/sdk pdf.js-dist
```

3. **开发时安装**：
```bash
npm install -D @types/pdf.js vite-plugin-monaco-editor
```

## 注意事项

- Monaco Editor 需要特殊的构建配置，建议使用 `@monaco-editor/react` 简化集成
- Yjs 协同编辑需要 WebSocket 服务器支持
- WASM LaTeX 编译器文件体积较大，需要考虑加载优化
- AI 功能需要有效的 API Key 才能使用
- 部分功能在当前阶段使用占位实现，正式集成时需要安装对应依赖 