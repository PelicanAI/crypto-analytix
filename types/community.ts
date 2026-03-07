export interface SharedInsight {
  id: string
  user_id: string
  username: string
  question: string
  answer: string
  portal_conversation_id: string | null
  shared_to: 'clipboard' | 'forexanalytix-api'
  likes_count: number
  created_at: string
}

export interface ShareLimitStatus {
  shares_today: number
  limit: number
  can_share: boolean
  resets_at: string
}
