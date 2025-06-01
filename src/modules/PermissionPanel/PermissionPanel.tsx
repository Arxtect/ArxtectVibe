import React, { useState } from 'react'
import { dataBridge, useDataStore } from '@/core/dataBridge'
import { Role } from '@/types'

interface PermissionPanelProps {
  projectId: string
  className?: string
}

const PermissionPanel: React.FC<PermissionPanelProps> = ({ projectId, className = '' }) => {
  const { currentProject, currentUser } = useDataStore()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('viewer')
  const [inviteError, setInviteError] = useState('')

  if (!currentProject) return null

  const isOwner = currentProject.ownerId === currentUser?.id
  const canManageMembers = isOwner // 后续可扩展其他管理权限

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteError('')

    if (!inviteEmail.trim()) {
      setInviteError('请输入用户邮箱或用户名')
      return
    }

    try {
      await dataBridge.addCollaborator(projectId, inviteEmail.trim(), inviteRole)
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('viewer')
    } catch (err: any) {
      setInviteError(err.message || '邀请失败')
    }
  }

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await dataBridge.updateMemberRole(projectId, userId, newRole)
    } catch (err) {
      console.error('Failed to update role:', err)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('确定要移除该成员吗？')) return

    try {
      await dataBridge.removeMember(projectId, userId)
    } catch (err) {
      console.error('Failed to remove member:', err)
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">项目成员</h3>
        {canManageMembers && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary text-sm"
          >
            邀请成员
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {currentProject.collaborators.map((member) => (
            <div key={member.userId} className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-900">{member.username}</div>
                <div className="text-sm text-gray-500">
                  {member.role === 'owner' ? '拥有者' : member.role === 'editor' ? '编辑者' : '查看者'}
                </div>
              </div>
              {canManageMembers && member.userId !== currentUser?.id && (
                <div className="flex items-center space-x-2">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.userId, e.target.value as Role)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    disabled={member.role === 'owner'}
                  >
                    <option value="viewer">查看者</option>
                    <option value="editor">编辑者</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    移除
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 邀请成员模态框 */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">邀请新成员</h3>
            <form onSubmit={handleInvite}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户邮箱或用户名
                </label>
                <input
                  type="text"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input-field"
                  placeholder="请输入邮箱或用户名"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  权限角色
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="input-field"
                >
                  <option value="viewer">查看者</option>
                  <option value="editor">编辑者</option>
                </select>
              </div>

              {inviteError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {inviteError}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false)
                    setInviteEmail('')
                    setInviteError('')
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary">
                  发送邀请
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PermissionPanel 