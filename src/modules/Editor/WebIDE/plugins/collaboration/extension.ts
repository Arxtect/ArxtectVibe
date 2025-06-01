import { IPlugin, IPluginContext } from '../../types'
import { CollaborationPanel } from './CollaborationPanel'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
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
  ydoc: Y.Doc
  provider: WebsocketProvider | null
  isConnected: boolean
}

export class CollaborationPlugin implements IPlugin {
  readonly id = 'collaboration'
  readonly name = 'Real-time Collaboration'
  readonly version = '1.0.0'
  readonly description = 'Yjs-based real-time collaborative editing with cursor tracking and user presence'

  private context: IPluginContext | null = null
  private currentSession: CollaborationSession | null = null
  private connectedUsers: CollaborationUser[] = []

  async activate(context: IPluginContext): Promise<void> {
    this.context = context
    console.log('[Collaboration] Plugin activating...')

    // 注册协作命令
    const togglePanelCommand = context.commands.registerCommand(
      'collaboration.togglePanel',
      this.togglePanel.bind(this)
    )

    const shareProjectCommand = context.commands.registerCommand(
      'collaboration.shareProject',
      this.shareProject.bind(this)
    )

    const disconnectSessionCommand = context.commands.registerCommand(
      'collaboration.disconnectSession',
      this.disconnectSession.bind(this)
    )

    const showUserCursorsCommand = context.commands.registerCommand(
      'collaboration.showUserCursors',
      this.showUserCursors.bind(this)
    )

    // 注册视图
    const userListView = {
      id: 'collaboration.userList',
      title: 'Online Users',
      render: () => {
        return React.createElement(CollaborationPanel, {
          users: this.connectedUsers,
          session: this.currentSession,
          onShareProject: this.shareProject.bind(this),
          onDisconnect: this.disconnectSession.bind(this)
        } as any)
      }
    }

    const sessionsView = {
      id: 'collaboration.sessions',
      title: 'Active Sessions',
      render: () => {
        return React.createElement('div', { className: 'p-4' }, 
          React.createElement('div', { className: 'text-sm text-gray-500' }, 
            this.currentSession ? `Session: ${this.currentSession.id}` : 'No active session'
          )
        )
      }
    }

    // 注册视图容器
    const viewContainer = context.ui.registerViewContainer({
      id: 'collaboration',
      title: 'Collaboration',
      icon: 'people'
    })

    const userListViewRegistration = context.ui.registerView('collaboration.userList', userListView)
    const sessionsViewRegistration = context.ui.registerView('collaboration.sessions', sessionsView)

    // 设置上下文
    context.commands.executeCommand('setContext', 'collaboration.hasProject', true)
    context.commands.executeCommand('setContext', 'collaboration.isConnected', false)

    // 监听文件打开事件，自动启动协作会话
    context.eventBus.on('editor.fileOpened', this.handleFileOpened.bind(this))

    // 注册所有 disposables
    context.subscriptions.push(
      togglePanelCommand,
      shareProjectCommand,
      disconnectSessionCommand,
      showUserCursorsCommand,
      viewContainer,
      userListViewRegistration,
      sessionsViewRegistration
    )

    console.log('[Collaboration] Plugin activated successfully')
  }

  async deactivate(): Promise<void> {
    if (this.currentSession) {
      await this.disconnectSession()
    }
    this.context = null
    console.log('[Collaboration] Plugin deactivated')
  }

  private async togglePanel(): Promise<void> {
    if (!this.context) return
    
    // 切换协作面板的显示状态
    this.context.ui.showMessage('Collaboration panel toggled', 'info')
  }

  private async shareProject(): Promise<void> {
    if (!this.context) return

    try {
      const projectId = this.extractProjectId(this.context.workspaceUri)
      
      // 创建或加入协作会话
      await this.createCollaborationSession(projectId)
      
      // 生成分享链接
      const shareUrl = `${window.location.origin}/editor/${projectId}?collaborate=true`
      
      // 复制到剪贴板
      await navigator.clipboard.writeText(shareUrl)
      
      this.context.ui.showMessage('Project share link copied to clipboard!', 'success')
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to share project'
      this.context.ui.showMessage(`Share failed: ${message}`, 'error')
    }
  }

  private async disconnectSession(): Promise<void> {
    if (!this.currentSession) return

    try {
      // 断开 Yjs 提供者连接
      if (this.currentSession.provider) {
        this.currentSession.provider.disconnect()
        this.currentSession.provider.destroy()
      }

      // 清理 Yjs 文档
      this.currentSession.ydoc.destroy()

      // 重置状态
      this.currentSession = null
      this.connectedUsers = []

      // 更新上下文
      this.context?.commands.executeCommand('setContext', 'collaboration.isConnected', false)
      
      // 通知用户
      this.context?.ui.showMessage('Disconnected from collaboration session', 'info')
      
      // 触发视图更新
      this.context?.eventBus.emit('collaboration.sessionChanged', null)
      
    } catch (error) {
      console.error('[Collaboration] Error disconnecting session:', error)
    }
  }

  private async showUserCursors(): Promise<void> {
    if (!this.context) return
    
    // 切换用户光标显示
    this.context.ui.showMessage('User cursors visibility toggled', 'info')
  }

  private async createCollaborationSession(projectId: string): Promise<void> {
    if (this.currentSession && this.currentSession.projectId === projectId) {
      return // 已经有相同项目的会话
    }

    // 断开现有会话
    if (this.currentSession) {
      await this.disconnectSession()
    }

    try {
      // 创建 Yjs 文档
      const ydoc = new Y.Doc()
      
      // 创建 WebSocket 提供者（模拟）
      // 在实际实现中，这里会连接到 WebSocket 服务器
      const wsUrl = `ws://localhost:4444/${projectId}`
      const provider = new WebsocketProvider(wsUrl, projectId, ydoc)
      
      // 创建会话对象
      this.currentSession = {
        id: `session-${Date.now()}`,
        projectId,
        users: [],
        ydoc,
        provider,
        isConnected: false
      }

      // 监听连接状态
      provider.on('status', ({ status }: { status: string }) => {
        console.log(`[Collaboration] WebSocket status: ${status}`)
        
        if (this.currentSession) {
          this.currentSession.isConnected = status === 'connected'
          this.context?.commands.executeCommand('setContext', 'collaboration.isConnected', status === 'connected')
        }
      })

      // 监听用户状态变化
      provider.awareness.on('change', () => {
        this.updateConnectedUsers()
      })

      // 设置本地用户信息
      provider.awareness.setLocalStateField('user', {
        id: 'current-user',
        name: 'You',
        color: '#007acc'
      })

      console.log(`[Collaboration] Created session for project ${projectId}`)
      
    } catch (error) {
      console.error('[Collaboration] Failed to create session:', error)
      throw new Error('Failed to create collaboration session')
    }
  }

  private updateConnectedUsers(): void {
    if (!this.currentSession) return

    const awareness = this.currentSession.provider?.awareness
    if (!awareness) return

    const users: CollaborationUser[] = []
    
    awareness.getStates().forEach((state, _clientId) => {
      const user = state.user
      if (user) {
        users.push({
          id: user.id,
          name: user.name,
          color: user.color,
          isOnline: true,
          cursor: state.cursor
        })
      }
    })

    this.connectedUsers = users
    
    // 触发视图更新
    this.context?.eventBus.emit('collaboration.usersChanged', users)
  }

  private handleFileOpened(data: { uri: string }): void {
    // 当打开 .tex 文件时，自动尝试加入协作会话
    if (data.uri.endsWith('.tex')) {
      const projectId = this.extractProjectId(this.context?.workspaceUri || '')
      if (projectId) {
        this.createCollaborationSession(projectId).catch(error => {
          console.warn('[Collaboration] Auto-join session failed:', error)
        })
      }
    }
  }

  private extractProjectId(workspaceUri: string): string {
    // 从工作区 URI 中提取项目 ID
    const parts = workspaceUri.split('/')
    return parts[parts.length - 1] || 'default-project'
  }

  // 公共 API 方法供其他插件调用
  public getCurrentSession(): CollaborationSession | null {
    return this.currentSession
  }

  public getConnectedUsers(): CollaborationUser[] {
    return [...this.connectedUsers]
  }

  public isConnected(): boolean {
    return this.currentSession?.isConnected || false
  }

  // 获取 Yjs 文档供 Monaco Editor 插件使用
  public getYDoc(): Y.Doc | null {
    return this.currentSession?.ydoc || null
  }
}

export default CollaborationPlugin 