import { Layout as AntLayout } from 'antd'
import Topnav from './Topnav'
import { Outlet } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { Footer } from 'antd/es/layout/layout.js'
import { Announcement, ChatWidget } from '@/shared/ui'
import { Helmet } from '@dr.pogodin/react-helmet'

const { Header, Content } = AntLayout

export default function Layout() {
  return (
    <AntLayout>
      <Helmet>
        <title>PEXFI - Onchain P2P Marketplace</title>
      </Helmet>
      <Header style={{
        padding: 0,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        background: 'rgba(19, 19, 21, 0.8)', // surface-dim at 80%
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(53, 52, 55, 0.2)', // outline-variant/20
        height: '72px',
        lineHeight: '72px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}>
        <Topnav />
      </Header>
      <Content>
        <div className={'width-container'}>
          <Announcement />
          <Outlet />
        </div>
      </Content>
      <Footer style={{
        background: '#131315',
        borderTop: '1px solid rgba(53, 52, 55, 0.1)',
        padding: '48px 32px',
        marginTop: '64px'
      }}>
        <div className={'width-container'} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#d0bcff' }}>
            © 2024 PEXFI. THE CYBER-NATIVE FRONTIER.
          </div>
          <div style={{ display: 'flex', gap: '32px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#cbc3d7' }}>
             <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>TERMS</a>
             <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>PRIVACY</a>
             <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>DISCORD</a>
             <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>DOCS</a>
          </div>
        </div>
      </Footer>
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
    </AntLayout>
  )
}
