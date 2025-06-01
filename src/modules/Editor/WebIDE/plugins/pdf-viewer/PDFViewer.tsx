import React, { useState, useEffect, useRef } from 'react'

interface PDFViewerProps {
  content: Buffer
  uri: string
  onZoomChange?: (zoom: number) => void
}

/**
 * PDF 查看器组件
 * 使用浏览器原生 PDF 渲染能力
 */
export const PDFViewer: React.FC<PDFViewerProps> = ({ 
  content, 
  uri, 
  onZoomChange 
}) => {
  const [zoom, setZoom] = useState(100)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // 处理 PDF 内容
  useEffect(() => {
    try {
      // 创建 Blob URL 用于显示 PDF
      const blob = new Blob([content], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setError('')

      // 清理函数
      return () => {
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('[PDFViewer] Error creating PDF blob:', err)
      setError('Failed to load PDF content')
    }
  }, [content])

  // 缩放处理
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 25, 300)
    setZoom(newZoom)
    onZoomChange?.(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 25, 25)
    setZoom(newZoom)
    onZoomChange?.(newZoom)
  }

  const handleResetZoom = () => {
    setZoom(100)
    onZoomChange?.(100)
  }

  // 暴露命令给插件系统
  useEffect(() => {
    // 这些方法将被插件系统调用
    const viewerMethods = {
      zoomIn: handleZoomIn,
      zoomOut: handleZoomOut,
      resetZoom: handleResetZoom,
      getCurrentZoom: () => zoom
    }

    // 在实际实现中，这里会通过事件总线或上下文暴露方法
    // 现在先通过 console 输出，表示方法已就绪
    console.log('[PDFViewer] Viewer methods ready:', Object.keys(viewerMethods))

    return () => {
      console.log('[PDFViewer] Cleanup viewer methods')
    }
  }, [zoom])

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <div className="text-red-500 mb-2">Error loading PDF</div>
          <div className="text-gray-500 text-sm">{error}</div>
        </div>
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading PDF...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            📄 {uri.split('/').pop()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Zoom Out"
          >
            🔍-
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
            {zoom}%
          </span>
          
          <button
            onClick={handleZoomIn}
            className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Zoom In"
          >
            🔍+
          </button>
          
          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Reset Zoom"
          >
            ⚖️
          </button>
        </div>
      </div>

      {/* PDF 查看器 */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={pdfUrl}
          className="w-full h-full border-0"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${10000 / zoom}%`,
            height: `${10000 / zoom}%`
          }}
          title={`PDF Viewer - ${uri}`}
        />
      </div>

      {/* 状态栏 */}
      <div className="p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>PDF Document</span>
          <span>Size: {(content.length / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    </div>
  )
}

export default PDFViewer 