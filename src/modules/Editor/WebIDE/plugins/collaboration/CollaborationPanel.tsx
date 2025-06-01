import React from 'react'

interface CollaborationUser {
  id: string
  name: string
  color: string
  isOnline: boolean
  cursor?: {
    line: number
    column: number
  }
}

interface CollaborationSession {
  id: string
  projectId: string
  users: CollaborationUser[]
  isConnected: boolean
}

interface CollaborationPanelProps {
  users: CollaborationUser[]
  session: CollaborationSession | null
  onShareProject: () => void
  onDisconnect: () => void
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  users,
  session,
  onShareProject,
  onDisconnect
}) => {
  const getUserStatusIcon = (user: CollaborationUser) => {
    return user.isOnline ? '🟢' : '🔴'
  }

  const getUserColor = (color: string) => {
    return {
      borderLeft: `4px solid ${color}`,
      paddingLeft: '8px'
    }
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          👥 Collaboration
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {session?.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {/* Session Info */}
        {session && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Active Session
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-300">
              Project: {session.projectId}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-300">
              Session: {session.id}
            </div>
          </div>
        )}

        {/* Online Users */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Online Users ({users.length})
          </h4>
          
          {users.length === 0 ? (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
              No users online
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                  style={getUserColor(user.color)}
                >
                  <span className="text-xs">
                    {getUserStatusIcon(user)}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {user.name}
                    </div>
                    {user.cursor && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Line {user.cursor.line}:{user.cursor.column}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!session?.isConnected ? (
            <button
              onClick={onShareProject}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded"
            >
              🔗 Share Project
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={onShareProject}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded"
              >
                📋 Copy Share Link
              </button>
              <button
                onClick={onDisconnect}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded"
              >
                🔌 Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Features Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="font-medium mb-2">Collaboration Features:</div>
          <div>✅ Real-time text editing</div>
          <div>✅ User presence indicators</div>
          <div>🔄 Cursor position tracking</div>
          <div>🔄 Conflict-free editing (CRDT)</div>
          <div>🔄 Offline editing support</div>
        </div>
      </div>
    </div>
  )
} 