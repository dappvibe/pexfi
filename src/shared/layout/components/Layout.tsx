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
      <Header style={{ padding: 0 }}>
        <div className={'width-container'}>
          <Topnav />
        </div>
      </Header>
      <Content>
        <div className={'width-container'}>
          <Announcement />
          <Outlet />
        </div>
      </Content>
      <Footer />
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
