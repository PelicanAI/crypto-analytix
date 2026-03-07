'use client'

import { Suspense } from 'react'
import Sidebar from '@/components/navigation/sidebar'
import HeaderBar from '@/components/navigation/header-bar'
import MobileNav from '@/components/navigation/mobile-nav'
import PelicanChatPanel from '@/components/pelican-panel/pelican-chat-panel'
import WhatIMissed from '@/components/brief/what-i-missed'
import { PelicanPanelProvider, usePelicanPanelContext } from '@/providers/pelican-panel-provider'
import { GlossaryProvider } from '@/lib/glossary/glossary-provider'
import { PELICAN_PANEL_WIDTH } from '@/lib/constants'
import { useBrief } from '@/hooks/use-brief'

function WhatIMissedWrapper() {
  const { whatIMissed, dismissWhatIMissed } = useBrief()
  return <WhatIMissed data={whatIMissed} onDismiss={dismissWhatIMissed} />
}

function FeaturesContent({ children }: { children: React.ReactNode }) {
  const { state } = usePelicanPanelContext()

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Atmosphere layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 15% 0%, var(--atmosphere-primary) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 85% 100%, var(--atmosphere-secondary) 0%, transparent 50%)',
        }}
      />

      {/* Sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[60px] relative z-10">
        <HeaderBar />

        <main
          className="flex-1 overflow-y-auto transition-[margin] duration-300 ease-out pb-20 md:pb-0"
          style={{ marginRight: state.isOpen ? PELICAN_PANEL_WIDTH : 0 }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Pelican AI panel */}
      <PelicanChatPanel />

      {/* What I Missed overlay */}
      <Suspense fallback={null}>
        <WhatIMissedWrapper />
      </Suspense>
    </div>
  )
}

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <PelicanPanelProvider>
      <GlossaryProvider>
        <FeaturesContent>{children}</FeaturesContent>
      </GlossaryProvider>
    </PelicanPanelProvider>
  )
}
