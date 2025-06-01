import { IServiceRegistry } from '../../types'

/**
 * 服务注册中心
 * 管理 WebIDE 中的所有服务实例
 */
export class ServiceRegistry implements IServiceRegistry {
  private services = new Map<string, any>()

  /**
   * 注册服务
   */
  register<T>(id: string, service: T): void {
    console.log(`[ServiceRegistry] Registering service: ${id}`)
    
    if (this.services.has(id)) {
      console.warn(`[ServiceRegistry] Service ${id} is already registered, replacing...`)
    }
    
    this.services.set(id, service)
  }

  /**
   * 获取服务
   */
  get<T>(id: string): T | undefined {
    const service = this.services.get(id)
    if (!service) {
      console.warn(`[ServiceRegistry] Service ${id} not found`)
      return undefined
    }
    
    return service as T
  }

  /**
   * 检查服务是否存在
   */
  has(id: string): boolean {
    return this.services.has(id)
  }

  /**
   * 注销服务
   */
  unregister(id: string): boolean {
    console.log(`[ServiceRegistry] Unregistering service: ${id}`)
    return this.services.delete(id)
  }

  /**
   * 获取所有服务 ID
   */
  getAllServiceIds(): string[] {
    return Array.from(this.services.keys())
  }

  /**
   * 清空所有服务
   */
  clear(): void {
    console.log('[ServiceRegistry] Clearing all services')
    this.services.clear()
  }

  /**
   * 获取服务数量
   */
  size(): number {
    return this.services.size
  }
}

// 创建全局服务注册中心实例
export const serviceRegistry = new ServiceRegistry() 