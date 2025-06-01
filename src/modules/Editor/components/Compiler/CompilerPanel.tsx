import React, { useState } from 'react'

const CompilerPanel: React.FC = () => {
  const [logs] = useState([
    { type: 'info', message: 'LaTeX compiler initialized', timestamp: Date.now() },
    { type: 'info', message: 'Ready for compilation...', timestamp: Date.now() + 1000 },
  ])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          ⚡ Compiler Output
        </h3>
        <div className="flex items-center space-x-2">
          <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            Clear
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 font-mono text-xs">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`mb-1 ${
              log.type === 'error'
                ? 'text-red-600 dark:text-red-400'
                : log.type === 'warning'
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
          </div>
        ))}
        
        <div className="mt-4 text-gray-500 dark:text-gray-400 space-y-1">
          <div>🔧 WebAssembly LaTeX compiler (Coming soon)</div>
          <div>📄 PDF generation (Coming soon)</div>
          <div>🐛 Error parsing and highlighting (Coming soon)</div>
          <div>⚡ Real-time compilation (Coming soon)</div>
        </div>
      </div>
    </div>
  )
}

export default CompilerPanel 