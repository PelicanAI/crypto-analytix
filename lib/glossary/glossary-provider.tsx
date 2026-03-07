'use client'

import { createContext, useContext, useCallback, useMemo } from 'react'
import { GLOSSARY_TERMS, type GlossaryTerm } from './terms'

interface GlossaryContextType {
  getTerm: (term: string) => GlossaryTerm | null
  searchTerms: (query: string) => GlossaryTerm[]
  allTerms: GlossaryTerm[]
  categories: string[]
}

const GlossaryContext = createContext<GlossaryContextType | null>(null)

export function GlossaryProvider({ children }: { children: React.ReactNode }) {
  const getTerm = useCallback((term: string): GlossaryTerm | null => {
    const normalized = term.toLowerCase().trim()
    return (
      GLOSSARY_TERMS.find(
        (t) => t.term.toLowerCase() === normalized
      ) ?? null
    )
  }, [])

  const searchTerms = useCallback((query: string): GlossaryTerm[] => {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return []

    return GLOSSARY_TERMS.filter(
      (t) =>
        t.term.toLowerCase().includes(normalized) ||
        t.definition.toLowerCase().includes(normalized)
    )
  }, [])

  const categories = useMemo(() => {
    const unique = new Set(GLOSSARY_TERMS.map((t) => t.category))
    return Array.from(unique).sort()
  }, [])

  const value = useMemo<GlossaryContextType>(
    () => ({
      getTerm,
      searchTerms,
      allTerms: GLOSSARY_TERMS,
      categories,
    }),
    [getTerm, searchTerms, categories]
  )

  return (
    <GlossaryContext.Provider value={value}>
      {children}
    </GlossaryContext.Provider>
  )
}

export function useGlossary(): GlossaryContextType {
  const context = useContext(GlossaryContext)
  if (!context) {
    throw new Error('useGlossary must be used within a GlossaryProvider')
  }
  return context
}
