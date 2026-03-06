// PelicanContext is extensible — use string | null so future features
// can add context types without modifying this type definition.
export type PelicanContext = string | null

// Known context types as constants (for type safety where needed)
export const PELICAN_CONTEXTS = {
  PORTFOLIO: 'portfolio',
  POSITION: 'position',
  ANALYST_CONTENT: 'analyst-content',
  CT_SIGNAL: 'ct-signal',
  WALLET_TRACKING: 'wallet-tracking',
  FUNDING_RATE: 'funding-rate',
  NEWS: 'news',
  METRIC: 'metric',
  EDUCATION: 'education',
  WHAT_I_MISSED: 'what-i-missed',
  DAILY_BRIEF: 'daily-brief',
  INTELLIGENCE_ALERT: 'intelligence-alert',
  COMMUNITY_MENTION: 'community-mention',
} as const

export interface PelicanMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface PelicanConversation {
  id: string
  user_id: string
  context_type: PelicanContext
  context_data: Record<string, unknown> | null
  persist: boolean
  created_at: string
}

export interface PelicanPanelState {
  isOpen: boolean
  conversationId: string | null
  messages: PelicanMessage[]
  isStreaming: boolean
  streamingText: string
  context: PelicanContext
  contextData: Record<string, unknown> | null
  ticker: string | null
}

export interface PelicanPrompt {
  visibleMessage: string
  fullPrompt: string
}
