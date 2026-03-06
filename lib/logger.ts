type LogLevel = 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

const isDev = process.env.NODE_ENV === 'development'

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const ctx = context ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctx}`
}

export const logger = {
  info(message: string, context?: LogContext) {
    if (isDev) {
      console.log(formatMessage('info', message, context))
    }
  },

  warn(message: string, context?: LogContext) {
    if (isDev) {
      console.warn(formatMessage('warn', message, context))
    }
  },

  error(message: string, context?: LogContext) {
    console.error(formatMessage('error', message, context))
  },
}

export type { LogContext }
