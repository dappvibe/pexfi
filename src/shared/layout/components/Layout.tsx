import Topnav from './Topnav'
import { Outlet } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { ChatWidget } from '@/shared/ui'
import { Helmet } from '@dr.pogodin/react-helmet'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#131315]">
      <Helmet>
        <title>PEXFI - Onchain P2P Marketplace</title>
      </Helmet>

      <Topnav />

      <main className="width-container pt-8">
        <Outlet />
      </main>

      <footer className="bg-[#131315] font-['Inter'] text-xs tracking-widest uppercase w-full border-t border-[#353437]/10 py-12 px-8 mt-16">
        <div className="width-container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-sm font-bold text-[#D0BCFF]">PEXFI</span>
            <span className="text-[#CBC3D7] normal-case tracking-normal">
              © 2024 PEXFI. THE CYBER-NATIVE FRONTIER.
            </span>
          </div>
          <div className="flex gap-8 items-center">
            <a className="text-[#CBC3D7] hover:text-[#D0BCFF] transition-all underline-offset-4 hover:underline no-underline" href="#">
              Terms
            </a>
            <a className="text-[#CBC3D7] hover:text-[#D0BCFF] transition-all underline-offset-4 hover:underline no-underline" href="#">
              Privacy
            </a>
            <a className="text-[#CBC3D7] hover:text-[#D0BCFF] transition-all underline-offset-4 hover:underline no-underline" href="#">
              Discord
            </a>
            <a className="text-[#CBC3D7] hover:text-[#D0BCFF] transition-all underline-offset-4 hover:underline no-underline" href="/docs">
              Docs
            </a>
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
