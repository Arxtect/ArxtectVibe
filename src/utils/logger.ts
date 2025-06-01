type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  level: LogLevel
  prefix?: string
}

class Logger {
  private config: LoggerConfig
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  constructor(config: LoggerConfig) {
    this.config = config
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString()
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : ''
    return `[${timestamp}] [${level.toUpperCase()}]${prefix} ${message}`
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug') && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('debug', message), ...args)
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info') && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args)
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args)
    }
  }
}

// 根据环境变量创建默认logger
const defaultLogger = new Logger({
  level: import.meta.env.DEV ? 'debug' : 'error',
})

// 创建模块专用logger的工厂函数
export function createLogger(prefix: string, level?: LogLevel): Logger {
  return new Logger({
    level: level || (import.meta.env.DEV ? 'debug' : 'error'),
    prefix,
  })
}

export default defaultLogger 