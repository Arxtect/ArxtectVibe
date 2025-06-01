import React from 'react'
import { ICustomEditorProvider } from '../../types'
import PDFViewer from './PDFViewer'

/**
 * PDF 编辑器提供者
 * 实现自定义编辑器接口，为 PDF 文件提供查看能力
 */
export class PDFEditorProvider implements ICustomEditorProvider {
  readonly viewType = 'pdfViewer.preview'

  /**
   * 检查是否可以编辑指定的文件
   */
  canEdit(uri: string): boolean {
    const extension = uri.split('.').pop()?.toLowerCase()
    return extension === 'pdf'
  }

  /**
   * 渲染 PDF 查看器
   */
  render(uri: string, content: Buffer): React.ReactNode {
    console.log(`[PDFEditorProvider] Rendering PDF viewer for: ${uri}`)
    
    return React.createElement(PDFViewer, {
      content,
      uri,
      onZoomChange: (zoom: number) => {
        console.log(`[PDFEditorProvider] Zoom changed to: ${zoom}%`)
        // 在实际实现中，这里可以通过事件总线通知其他组件
      }
    })
  }

  /**
   * 获取支持的文件扩展名
   */
  getSupportedExtensions(): string[] {
    return ['pdf']
  }

  /**
   * 获取编辑器显示名称
   */
  getDisplayName(): string {
    return 'PDF Preview'
  }

  /**
   * 获取编辑器描述
   */
  getDescription(): string {
    return 'View PDF documents in the IDE'
  }

  /**
   * 检查是否为只读编辑器
   */
  isReadOnly(): boolean {
    return true // PDF 查看器是只读的
  }

  /**
   * 获取编辑器图标
   */
  getIcon(): string {
    return '📄'
  }

  /**
   * 获取编辑器优先级
   */
  getPriority(): number {
    return 100 // 默认优先级
  }
}

// 导出实例
export const pdfEditorProvider = new PDFEditorProvider() 