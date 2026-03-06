export type PelicanContext =
  | 'portfolio'
  | 'position'
  | 'analyst-content'
  | 'ct-signal'
  | 'wallet-tracking'
  | 'funding-rate'
  | 'news'
  | 'metric'
  | 'education'
  | 'what-i-missed'
  | 'daily-brief'
  | null

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
  context: PelicanContext
  contextData: Record<string, unknown> | null
  ticker: string | null
}

export interface PelicanPrompt {
  visibleMessage: string
  fullPrompt: string
}
