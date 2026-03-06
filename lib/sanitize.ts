import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  })
}

export function sanitizeInput(text: string, maxLength = 1000): string {
  const stripped = text.replace(/<[^>]*>/g, '')
  const trimmed = stripped.trim()
  return trimmed.slice(0, maxLength)
}

export function sanitizeTicker(ticker: string): string {
  return ticker.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
}
