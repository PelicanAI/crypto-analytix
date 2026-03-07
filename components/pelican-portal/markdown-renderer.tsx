'use client'

// ─── Shared markdown renderer for Pelican Portal + side panel ──────

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Parse inline formatting: **bold**, `code`, and URLs
function renderInline(text: string, lineKey: number): React.ReactNode[] {
  // Combined regex: bold, inline code, URLs
  const regex = /(\*\*.*?\*\*)|(`[^`]+`)|(https?:\/\/[^\s)]+)/g
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      // Bold
      nodes.push(
        <span
          key={`${lineKey}-b-${match.index}`}
          className="font-semibold"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
        >
          {match[1].slice(2, -2)}
        </span>
      )
    } else if (match[2]) {
      // Inline code
      nodes.push(
        <code
          key={`${lineKey}-c-${match.index}`}
          style={{
            background: 'var(--bg-elevated)',
            padding: '2px 6px',
            borderRadius: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            border: '1px solid var(--border-subtle)',
          }}
        >
          {match[2].slice(1, -1)}
        </code>
      )
    } else if (match[3]) {
      // URL
      nodes.push(
        <a
          key={`${lineKey}-a-${match.index}`}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline transition-colors duration-150"
          style={{ color: 'var(--accent-primary)' }}
        >
          {match[3]}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [text]
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Empty line = vertical gap
    if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 14 }} />)
      continue
    }

    // Section heading: full line is **text**
    if (/^\*\*.+\*\*$/.test(line.trim())) {
      elements.push(
        <div
          key={i}
          className="font-semibold first:mt-0"
          style={{
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            marginTop: 16,
            marginBottom: 4,
          }}
        >
          {line.trim().slice(2, -2)}
        </div>
      )
      continue
    }

    // Bullet point: - , * , or unicode bullet
    const bulletMatch = line.match(/^(\s*)[-*\u2022]\s(.*)/)
    if (bulletMatch) {
      elements.push(
        <div
          key={i}
          className="flex items-start"
          style={{
            paddingLeft: 20,
            color: 'var(--text-secondary)',
            lineHeight: '1.75',
            fontSize: 14,
            marginBottom: 2,
          }}
        >
          <span
            className="shrink-0 rounded-full"
            style={{
              width: 6,
              height: 6,
              marginTop: 8,
              marginRight: 10,
              backgroundColor: 'var(--accent-primary)',
            }}
          />
          <span>{renderInline(bulletMatch[2], i)}</span>
        </div>
      )
      continue
    }

    // Numbered list: 1. , 2. , etc.
    const numberedMatch = line.match(/^(\s*)(\d+)\.\s(.*)/)
    if (numberedMatch) {
      elements.push(
        <div
          key={i}
          className="flex items-start"
          style={{
            paddingLeft: 20,
            color: 'var(--text-secondary)',
            lineHeight: '1.75',
            fontSize: 14,
            marginBottom: 2,
          }}
        >
          <span
            className="shrink-0 tabular-nums"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-primary)',
              marginRight: 10,
              minWidth: 16,
            }}
          >
            {numberedMatch[2]}.
          </span>
          <span>{renderInline(numberedMatch[3], i)}</span>
        </div>
      )
      continue
    }

    // Regular text
    elements.push(
      <div
        key={i}
        style={{
          color: 'var(--text-secondary)',
          lineHeight: '1.75',
          fontSize: 14,
        }}
      >
        {renderInline(line, i)}
      </div>
    )
  }

  return <div className={className}>{elements}</div>
}
