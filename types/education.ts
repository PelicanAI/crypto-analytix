export interface EducationModule {
  slug: string
  title: string
  description: string
  tradfi_analog: string
  estimated_minutes: number
  order: number
}

export interface EducationProgress {
  id: string
  user_id: string
  module_slug: string
  completed: boolean
  completed_at: string | null
}
