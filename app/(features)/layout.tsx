export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Sidebar, header, and PelicanPanelProvider will be added in Session 4 */}
      {children}
    </div>
  )
}
