import React from 'react'
import { useDataStore } from '@/core/dataBridge'
import { CompileLogEntry } from '@/types'

interface RunLogPanelProps {
  className?: string
}

const RunLogPanel: React.FC<RunLogPanelProps> = ({ className = '' }) => {
  const compileLogs = useDataStore((state) => state.compileLogs)

  const getLogTypeStyle = (type: CompileLogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-600 bg-red-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'info':
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getLogTypeIcon = (type: CompileLogEntry['type']) => {
    switch (type) {
      case 'error':
        return '✗'
      case 'warning':
        return '⚠'
      case 'info':
      default:
        return 'ℹ'
    }
  }

  return (
    <div className={`bg-white ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">编译日志</h3>
      </div>
      <div className="p-4 overflow-y-auto max-h-96">
        {compileLogs.length === 0 ? (
          <p className="text-sm text-gray-500">暂无编译日志</p>
        ) : (
          <div className="space-y-2">
            {compileLogs.map((log, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded text-sm font-mono ${getLogTypeStyle(log.type)}`}
              >
                <span className="mr-2">{getLogTypeIcon(log.type)}</span>
                {log.file && <span className="font-semibold">{log.file}:</span>}
                {log.line && <span className="font-semibold">{log.line}:</span>}
                <span className="ml-1">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RunLogPanel 