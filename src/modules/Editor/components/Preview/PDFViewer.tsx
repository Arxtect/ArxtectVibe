import React from 'react'

const PDFViewer: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-800">
      <div className="flex items-center justify-between p-3 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          📄 PDF Preview
        </h3>
        <div className="flex items-center space-x-2">
          <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            Download
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            Zoom
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
          <div className="space-y-2">
            <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
              PDF Preview
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Compile your LaTeX document to see the preview
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-6">
            <div>📖 PDF.js integration (Coming soon)</div>
            <div>🔍 Zoom and navigation (Coming soon)</div>
            <div>🔄 Sync scrolling with editor (Coming soon)</div>
            <div>📝 Annotation support (Coming soon)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFViewer 