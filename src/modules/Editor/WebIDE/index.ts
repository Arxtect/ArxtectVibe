// 主要组件导出
export { default as WebIDE } from './WebIDE'

// 类型导出
export * from './types'

// 核心服务导出
export { browserFS } from './core/FileSystem/BrowserFS'
export { eventBus } from './core/EventBus/EventBus'
export { serviceRegistry } from './core/Services/ServiceRegistry'
export { commandService } from './core/Services/CommandService'
export { customEditorService } from './core/Services/CustomEditorService'
export { PluginManager } from './core/PluginManager/PluginManager'

// 插件导出
export { pdfViewerPlugin } from './plugins/pdf-viewer/extension'
export { pdfEditorProvider } from './plugins/pdf-viewer/PDFEditorProvider'
export { default as PDFViewer } from './plugins/pdf-viewer/PDFViewer'

// 文件系统相关
export { BrowserFileSystem } from './core/FileSystem/BrowserFS'

// 导入 WebIDE 用于创建函数
import WebIDEComponent from './WebIDE'
import { WebIDEProps } from './types'

// 实用函数
export const createWebIDE = (props: WebIDEProps) => {
  return WebIDEComponent(props)
} 