export interface EducationSection {
  type: 'intro' | 'concept' | 'tradfi_bridge' | 'example' | 'key_takeaway'
  heading: string
  body: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export interface EducationModuleContent {
  sections: EducationSection[]
  quiz: QuizQuestion[]
}

export interface EducationModule {
  slug: string
  title: string
  description: string
  tradfi_analog: string
  category: string
  content: EducationModuleContent
  estimated_minutes: number
  sort_order: number
  prerequisites: string[]
}

export interface EducationProgress {
  id: string
  user_id: string
  module_slug: string
  completed: boolean
  completed_at: string | null
  started_at: string | null
  quiz_score: number | null
}

export interface EducationOverview {
  modules: EducationModule[]
  progress: Record<string, EducationProgress>
  completedCount: number
  totalCount: number
  recommendedNext: string | null
}

export interface OnboardingResponses {
  experience_level: string
  trading_background: string[]
  crypto_familiarity: string
  interests: string[]
}
