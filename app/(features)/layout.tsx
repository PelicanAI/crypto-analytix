import Sidebar from '@/components/navigation/sidebar'
import HeaderBar from '@/components/navigation/header-bar'
import MobileNav from '@/components/navigation/mobile-nav'

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Atmosphere layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 50% at 15% 0%, rgba(29, 161, 196, 0.05) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 40% at 85% 100%, rgba(29, 161, 196, 0.03) 0%, transparent 50%)',
          ].join(', '),
        }}
      />

      {/* Sidebar -- hidden on mobile */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[60px] relative z-10">
        <HeaderBar />

        <main className="flex-1 overflow-y-auto transition-[margin] duration-300 ease-out pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
