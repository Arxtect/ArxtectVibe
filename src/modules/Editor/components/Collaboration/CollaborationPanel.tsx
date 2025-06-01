import React from 'react'

interface CollaborationPanelProps {
  projectId: string
  userId: string
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ projectId, userId }) => {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          👥 Collaboration
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Project: {projectId.substring(0, 8)}...
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {/* Online users */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Online Users
          </h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">You</span>
            </div>
          </div>
        </div>

        {/* Features placeholder */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>📝 Real-time editing (Coming soon)</div>
          <div>👁️ Cursor tracking (Coming soon)</div>
          <div>🔗 Yjs integration (Coming soon)</div>
          <div>🌐 WebSocket connection (Coming soon)</div>
        </div>
      </div>
    </div>
  )
}

export default CollaborationPanel 