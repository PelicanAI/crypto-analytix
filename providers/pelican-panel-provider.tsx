'use client'

import { createContext, useContext } from 'react'

const PelicanPanelContext = createContext({})

export function PelicanPanelProvider({ children }: { children: React.ReactNode }) {
  return (
    <PelicanPanelContext.Provider value={{}}>
      {children}
    </PelicanPanelContext.Provider>
  )
}

export const usePelicanPanelContext = () => useContext(PelicanPanelContext)
