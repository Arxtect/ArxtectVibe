export interface CollaborationConfig {
  websocketUrl: string
  roomId: string
  userId: string
  userName: string
  userColor?: string
  persistence?: boolean
}

export interface CollaboratorCursor {
  clientId: string
  userId: string
  userName: string
  color: string
  position: {
    lineNumber: number
    column: number
  }
  selection?: {
    startLineNumber: number
    startColumn: number
    endLineNumber: number
    endColumn: number
  }
  isActive: boolean
}

export interface CollaboratorPresence {
  clientId: string
  userId: string
  userName: string
  color: string
  isOnline: boolean
  lastSeen: number
  activeFileId?: string
}

export interface YjsDocumentState {
  doc: any // Y.Doc
  provider: any // WebsocketProvider
  yText: any // Y.Text
  awareness: any // Awareness
  isConnected: boolean
  connectionState: 'connecting' | 'connected' | 'disconnected'
}

export interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'cursor_moved' | 'text_changed' | 'file_switched'
  userId: string
  timestamp: number
  data?: any
}

export interface CollaborationState {
  isEnabled: boolean
  config: CollaborationConfig
  collaborators: CollaboratorPresence[]
  cursors: CollaboratorCursor[]
  events: CollaborationEvent[]
  documentState: YjsDocumentState | null
} 