export const logger = {
  info: (...args: unknown[]) => { if (process.env.NODE_ENV === 'development') console.info('[CA]', ...args) },
  warn: (...args: unknown[]) => console.warn('[CA]', ...args),
  error: (...args: unknown[]) => console.error('[CA]', ...args),
}
