import Topnav from './Topnav'
import { Outlet } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { Announcement, ChatWidget } from '@/shared/ui'
import { Helmet } from '@dr.pogodin/react-helmet'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#131315] text-foreground font-inter flex flex-col selection:bg-primary selection:text-primary-foreground">
      <Helmet>
        <title>PEXFI - Cyber-Native P2P Marketplace</title>
      </Helmet>

      <header className="sticky top-0 z-50 w-full glass-morphism ">
        <div className="max-w-[1440px] mx-auto">
          <Topnav />
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Announcement />
          <div className="py-2">
            <Outlet />
          </div>
        </div>
      </main>

      <footer className="py-12 mt-20 bg-surface-lowest/50 ">
        <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} PEXFI • The Neon Nocturne
          </div>
          <div className="flex items-center gap-8">
             <a href="/docs" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Documentation</a>
             <a href="https://x.com/pexficom" target="_blank" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Twitter / X</a>
          </div>
        </div>
      </footer>

      <ChatWidget />

      {import.meta.env.MODE === 'production' && (
        <Analytics
          beforeSend={(event) => {
            if (!window.location.hash) return event
            const url = new URL(event.url)
            url.pathname = window.location.hash.replace('#', '')
            return {
              ...event,
              url: url.toString()
            }
          }}
        />
      )}
    </div>
  )
}
