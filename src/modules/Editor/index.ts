// WebIDE 导出 - 新的插件化编辑器
export { WebIDE } from './WebIDE'
export * as WebIDETypes from './WebIDE/types'

// 类型导出
export * from './types'

// AI 服务导出
export { AIService } from './services/aiService'

// 子组件导出（可选，用于自定义布局）
export { default as MonacoEditor } from './components/Monaco/MonacoEditor'
export { default as AIPanel } from './components/AIAgent/AIPanel'
export { default as CollaborationPanel } from './components/Collaboration/CollaborationPanel'
export { default as CompilerPanel } from './components/Compiler/CompilerPanel'
export { default as PDFViewer } from './components/Preview/PDFViewer'

// Hooks 导出
export { useMonacoEditor } from './hooks/useMonacoEditor' 