// 主要组件导出
export { default as Editor } from './Editor'
export { default as EditorV2 } from './EditorV2'

// 类型定义导出
export * from './types'

// 服务导出
export { AIService } from './services/aiService'

// Hooks 导出
export { useMonacoEditor } from './hooks/useMonacoEditor'

// 子组件导出（可选，用于自定义布局）
export { default as MonacoEditor } from './components/Monaco/MonacoEditor'
export { default as AIPanel } from './components/AIAgent/AIPanel'
export { default as CollaborationPanel } from './components/Collaboration/CollaborationPanel'
export { default as CompilerPanel } from './components/Compiler/CompilerPanel'
export { default as PDFViewer } from './components/Preview/PDFViewer' 