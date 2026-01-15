import { Layout as AntLayout } from 'antd'
import Topnav from '@/layout/Topnav'
import { Outlet } from 'react-router-dom'
import { Footer } from 'antd/es/layout/layout.js'
import { Announcement } from '@/components/Announcement'
import ChatWidget from '@/components/ChatWidget'
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
    </AntLayout>
  )
}
