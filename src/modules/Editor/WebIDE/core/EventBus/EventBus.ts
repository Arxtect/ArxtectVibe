import { IEventBus, Disposable } from '../../types'

/**
 * 事件总线实现
 * 提供插件间的事件通信机制
 */
export class EventBus implements IEventBus {
  private listeners = new Map<string, Array<(data: any) => void>>()
  private onceListeners = new Map<string, Array<(data: any) => void>>()

  /**
   * 发送事件
   */
  emit<T>(event: string, data: T): void {
    console.log(`[EventBus] Emitting event: ${event}`, data)
    
    // 触发普通监听器
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      // 创建副本以避免在回调中修改数组时出现问题
      const listenersCopy = [...eventListeners]
      listenersCopy.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`[EventBus] Error in event listener for ${event}:`, error)
        }
      })
    }

    // 触发一次性监听器
    const onceEventListeners = this.onceListeners.get(event)
    if (onceEventListeners) {
      const listenersCopy = [...onceEventListeners]
      // 清空一次性监听器
      this.onceListeners.delete(event)
      
      listenersCopy.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`[EventBus] Error in once listener for ${event}:`, error)
        }
      })
    }
  }

  /**
   * 注册事件监听器
   */
  on<T>(event: string, listener: (data: T) => void): Disposable {
    console.log(`[EventBus] Registering listener for: ${event}`)
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    
    this.listeners.get(event)!.push(listener)
    
    // 返回清理函数
    return {
      dispose: () => {
        this.off(event, listener)
      }
    }
  }

  /**
   * 注册一次性事件监听器
   */
  once<T>(event: string, listener: (data: T) => void): Disposable {
    console.log(`[EventBus] Registering once listener for: ${event}`)
    
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, [])
    }
    
    this.onceListeners.get(event)!.push(listener)
    
    // 返回清理函数
    return {
      dispose: () => {
        const listeners = this.onceListeners.get(event)
        if (listeners) {
          const index = listeners.indexOf(listener)
          if (index > -1) {
            listeners.splice(index, 1)
          }
        }
      }
    }
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: (data: any) => void): void {
    console.log(`[EventBus] Removing listener for: ${event}`)
    
    // 从普通监听器中移除
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener as any)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
      
      // 如果没有监听器了，删除整个事件
      if (eventListeners.length === 0) {
        this.listeners.delete(event)
      }
    }
    
    // 从一次性监听器中移除
    const onceEventListeners = this.onceListeners.get(event)
    if (onceEventListeners) {
      const index = onceEventListeners.indexOf(listener as any)
      if (index > -1) {
        onceEventListeners.splice(index, 1)
      }
      
      // 如果没有监听器了，删除整个事件
      if (onceEventListeners.length === 0) {
        this.onceListeners.delete(event)
      }
    }
  }

  /**
   * 移除指定事件的所有监听器
   */
  removeAllListeners(event?: string): void {
    if (event) {
      console.log(`[EventBus] Removing all listeners for: ${event}`)
      this.listeners.delete(event)
      this.onceListeners.delete(event)
    } else {
      console.log('[EventBus] Removing all listeners')
      this.listeners.clear()
      this.onceListeners.clear()
    }
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount(event: string): number {
    const normalCount = this.listeners.get(event)?.length || 0
    const onceCount = this.onceListeners.get(event)?.length || 0
    return normalCount + onceCount
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    const events = new Set<string>()
    
    // 正确使用 Map.keys() 方法
    for (const event of this.listeners.keys()) {
      events.add(event)
    }
    
    for (const event of this.onceListeners.keys()) {
      events.add(event)
    }
    
    return Array.from(events)
  }

  /**
   * 清理所有监听器
   */
  dispose(): void {
    console.log('[EventBus] Disposing all listeners')
    this.removeAllListeners()
  }
}

// 创建全局事件总线实例
export const eventBus = new EventBus() 