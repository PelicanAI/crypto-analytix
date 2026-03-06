'use client'

import { createContext, useContext, useMemo } from 'react'
import { usePelicanPanel, type UsePelicanPanelReturn } from '@/hooks/use-pelican-panel'

const noopPanel: UsePelicanPanelReturn = {
  state: {
    isOpen: false,
    conversationId: null,
    messages: [],
    isStreaming: false,
    streamingText: '',
    context: null,
    contextData: null,
    ticker: null,
  },
  openWithPrompt: async () => {},
  sendMessage: async () => {},
  close: () => {},
  clearMessages: () => {},
}

const PelicanPanelContext = createContext<UsePelicanPanelReturn>(noopPanel)

export function PelicanPanelProvider({ children }: { children: React.ReactNode }) {
  const panel = usePelicanPanel()

  const value = useMemo<UsePelicanPanelReturn>(() => ({
    state: panel.state,
    openWithPrompt: panel.openWithPrompt,
    sendMessage: panel.sendMessage,
    close: panel.close,
    clearMessages: panel.clearMessages,
  }), [
    panel.state,
    panel.openWithPrompt,
    panel.sendMessage,
    panel.close,
    panel.clearMessages,
  ])

  return (
    <PelicanPanelContext.Provider value={value}>
      {children}
    </PelicanPanelContext.Provider>
  )
}

export function usePelicanPanelContext(): UsePelicanPanelReturn {
  return useContext(PelicanPanelContext)
}
