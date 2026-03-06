import { logger } from '@/lib/logger'

export function trackEvent(name: string, properties?: Record<string, string | number | boolean>) {
  if (process.env.NODE_ENV === 'development') {
    logger.info(`[TRACK] ${name}`, properties)
    return
  }
}
