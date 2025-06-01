import React from 'react'
import { createRoot } from 'react-dom/client'
import { IPlugin, IPluginContext } from '../../types'

interface PluginInfo {
  id: string
  name: string
  version: string
  description: string
  isActive: boolean
  isBuiltIn: boolean
  category: string
  author?: string
  size?: string
}

const PluginManagerView: React.FC<{
  pluginManager: any
  onRefresh: () => void
  onToggle: (pluginId: string) => void
  onUninstall: (pluginId: string) => void
  onClose?: () => void
}> = ({ pluginManager, onRefresh, onToggle, onUninstall, onClose }) => {
  const [plugins, setPlugins] = React.useState<PluginInfo[]>([])
  const [filter, setFilter] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('all')

  React.useEffect(() => {
    loadPlugins()
  }, [pluginManager])

  const loadPlugins = () => {
    if (!pluginManager) return
    
    const stats = pluginManager.getStats()
    const availablePlugins: PluginInfo[] = [
      {
        id: 'pdf-viewer',
        name: 'PDF Viewer',
        version: '1.0.0',
        description: 'View PDF documents in the IDE',
        isActive: stats.active > 0,
        isBuiltIn: true,
        category: 'Viewer',
        author: 'WebIDE Team',
        size: '125 KB'
      },
      {
        id: 'ai-assistant',
        name: 'AI Assistant',
        version: '1.0.0',
        description: 'AI-powered LaTeX writing assistant',
        isActive: stats.active > 1,
        isBuiltIn: true,
        category: 'AI & ML',
        author: 'WebIDE Team',
        size: '89 KB'
      },
      {
        id: 'monaco-editor',
        name: 'Monaco Editor',
        version: '1.0.0',
        description: 'Advanced code editor with syntax highlighting',
        isActive: stats.active > 2,
        isBuiltIn: true,
        category: 'Editor',
        author: 'Microsoft',
        size: '2.1 MB'
      },
      {
        id: 'plugin-manager',
        name: 'Plugin Manager',
        version: '1.0.0',
        description: 'Manage WebIDE plugins',
        isActive: true,
        isBuiltIn: true,
        category: 'System',
        author: 'WebIDE Team',
        size: '45 KB'
      }
    ]
    
    setPlugins(availablePlugins)
  }

  const filteredPlugins = plugins.filter(plugin => {
    const matchesFilter = plugin.name.toLowerCase().includes(filter.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory
    return matchesFilter && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(plugins.map(p => p.category)))]

  const getStatusIcon = (plugin: PluginInfo) => {
    if (plugin.isActive) {
      return '🟢'
    }
    return '🔴'
  }

  const getStatusText = (plugin: PluginInfo) => {
    if (plugin.isActive) {
      return 'Active'
    }
    return 'Inactive'
  }

  return React.createElement('div', {
    className: 'h-full flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
  }, [
    // 标题栏
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-lg font-semibold'
      }, '🔌 Plugin Manager'),
      React.createElement('div', {
        key: 'actions',
        className: 'flex items-center space-x-2'
      }, [
        React.createElement('button', {
          key: 'refresh',
          onClick: () => {
            loadPlugins()
            onRefresh()
          },
          className: 'p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded',
          title: 'Refresh plugin list'
        }, '��'),
        onClose && React.createElement('button', {
          key: 'close',
          onClick: onClose,
          className: 'p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
          title: 'Close plugin manager'
        }, '✕')
      ])
    ]),

    // 过滤器
    React.createElement('div', {
      key: 'filters',
      className: 'p-4 space-y-3 border-b border-gray-200 dark:border-gray-700'
    }, [
      // 搜索框
      React.createElement('input', {
        key: 'search',
        type: 'text',
        placeholder: 'Search plugins...',
        value: filter,
        onChange: (e: any) => setFilter(e.target.value),
        className: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      }),
      
      // 分类选择
      React.createElement('select', {
        key: 'category',
        value: selectedCategory,
        onChange: (e: any) => setSelectedCategory(e.target.value),
        className: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      }, categories.map(category => 
        React.createElement('option', {
          key: category,
          value: category
        }, category === 'all' ? 'All Categories' : category)
      ))
    ]),

    // 插件列表
    React.createElement('div', {
      key: 'plugins',
      className: 'flex-1 overflow-y-auto'
    }, filteredPlugins.map(plugin => 
      React.createElement('div', {
        key: plugin.id,
        className: 'p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
      }, [
        // 插件信息头部
        React.createElement('div', {
          key: 'header',
          className: 'flex items-start justify-between mb-2'
        }, [
          React.createElement('div', {
            key: 'info',
            className: 'flex-1'
          }, [
            React.createElement('div', {
              key: 'name',
              className: 'flex items-center space-x-2 mb-1'
            }, [
              React.createElement('span', {
                key: 'icon',
                className: 'text-lg'
              }, getStatusIcon(plugin)),
              React.createElement('h3', {
                key: 'title',
                className: 'font-semibold text-gray-900 dark:text-gray-100'
              }, plugin.name),
              React.createElement('span', {
                key: 'version',
                className: 'text-sm text-gray-500 dark:text-gray-400'
              }, `v${plugin.version}`)
            ]),
            React.createElement('p', {
              key: 'description',
              className: 'text-sm text-gray-600 dark:text-gray-400 mb-2'
            }, plugin.description),
            React.createElement('div', {
              key: 'meta',
              className: 'flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400'
            }, [
              React.createElement('span', {
                key: 'category',
                className: 'px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded'
              }, plugin.category),
              plugin.author && React.createElement('span', {
                key: 'author'
              }, `by ${plugin.author}`),
              plugin.size && React.createElement('span', {
                key: 'size'
              }, plugin.size),
              React.createElement('span', {
                key: 'status',
                className: `px-2 py-1 rounded ${plugin.isActive 
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`
              }, getStatusText(plugin))
            ])
          ]),
          
          // 操作按钮
          React.createElement('div', {
            key: 'actions',
            className: 'flex flex-col space-y-2 ml-4'
          }, [
            React.createElement('button', {
              key: 'toggle',
              onClick: () => onToggle(plugin.id),
              disabled: plugin.id === 'plugin-manager', // 不能禁用自己
              className: `px-3 py-1 text-xs rounded ${
                plugin.isActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } ${plugin.id === 'plugin-manager' ? 'opacity-50 cursor-not-allowed' : ''}`
            }, plugin.isActive ? 'Disable' : 'Enable'),
            
            !plugin.isBuiltIn && React.createElement('button', {
              key: 'uninstall',
              onClick: () => onUninstall(plugin.id),
              className: 'px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded'
            }, 'Uninstall')
          ])
        ])
      ])
    )),

    // 统计信息
    React.createElement('div', {
      key: 'stats',
      className: 'p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
    }, [
      React.createElement('div', {
        key: 'text',
        className: 'text-sm text-gray-600 dark:text-gray-400'
      }, `${filteredPlugins.length} plugins found • ${filteredPlugins.filter(p => p.isActive).length} active`)
    ])
  ])
}

export class PluginManagerPlugin implements IPlugin {
  readonly id = 'plugin-manager'
  readonly name = 'Plugin Manager'
  readonly version = '1.0.0'
  readonly description = 'Manage WebIDE plugins - install, enable, disable, and configure plugins'

  private pluginManager: any = null

  async activate(context: IPluginContext): Promise<void> {
    console.log('[PluginManager] Activating Plugin Manager plugin')

    // 保存对 PluginManager 的引用（通过 context 传递）
    this.pluginManager = (context as any).pluginManager

    // 注册命令
    const openViewCommand = context.commands.registerCommand(
      'pluginManager.openView',
      this.openView.bind(this)
    )

    const refreshCommand = context.commands.registerCommand(
      'pluginManager.refresh',
      this.refresh.bind(this)
    )

    const enableCommand = context.commands.registerCommand(
      'pluginManager.enable',
      this.enablePlugin.bind(this)
    )

    const disableCommand = context.commands.registerCommand(
      'pluginManager.disable',
      this.disablePlugin.bind(this)
    )

    context.subscriptions.push(openViewCommand, refreshCommand, enableCommand, disableCommand)
    
    console.log('[PluginManager] Plugin Manager plugin activated successfully')
  }

  async deactivate(): Promise<void> {
    console.log('[PluginManager] Deactivating Plugin Manager plugin')
  }

  private openView(): void {
    console.log('[PluginManager] Opening plugin manager view')
    
    try {
      // 创建一个弹窗来显示插件管理器
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      
      const content = document.createElement('div')
      content.className = 'bg-white dark:bg-gray-900 rounded-lg shadow-xl w-4/5 h-4/5 max-w-4xl max-h-4xl overflow-hidden'
      
      // 渲染 React 组件
      const root = createRoot(content)
      
      // 清理函数
      const cleanup = () => {
        try {
          root.unmount()
        } catch (error) {
          console.warn('[PluginManager] Error unmounting React component:', error)
        }
        try {
          if (document.body.contains(modal)) {
            document.body.removeChild(modal)
          }
        } catch (error) {
          console.warn('[PluginManager] Error removing modal from DOM:', error)
        }
      }
      
      // 点击模态框外部关闭
      modal.onclick = (e) => {
        if (e.target === modal) {
          cleanup()
        }
      }
      
      // ESC 键关闭
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          cleanup()
          document.removeEventListener('keydown', handleKeyDown)
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      
      root.render(React.createElement(PluginManagerView, {
        pluginManager: this.pluginManager,
        onRefresh: () => {
          console.log('[PluginManager] Refreshing plugin list')
        },
        onToggle: (pluginId: string) => {
          console.log(`[PluginManager] Toggling plugin: ${pluginId}`)
          // 实现插件启用/禁用逻辑
        },
        onUninstall: (pluginId: string) => {
          console.log(`[PluginManager] Uninstalling plugin: ${pluginId}`)
          // 实现插件卸载逻辑
        },
        onClose: cleanup
      }))

      modal.appendChild(content)
      document.body.appendChild(modal)
      
    } catch (error) {
      console.error('[PluginManager] Error opening plugin manager view:', error)
    }
  }

  private refresh(): void {
    console.log('[PluginManager] Refreshing plugin list')
  }

  private enablePlugin(pluginId: string): void {
    console.log(`[PluginManager] Enabling plugin: ${pluginId}`)
    if (this.pluginManager) {
      // this.pluginManager.enablePlugin(pluginId)
    }
  }

  private disablePlugin(pluginId: string): void {
    console.log(`[PluginManager] Disabling plugin: ${pluginId}`)
    if (this.pluginManager) {
      // this.pluginManager.disablePlugin(pluginId)
    }
  }
}

export default PluginManagerPlugin 