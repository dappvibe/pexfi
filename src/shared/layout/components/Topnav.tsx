import { generatePath, Link, useParams, useLocation } from 'react-router-dom'
import { Notifications, WalletMenu } from '@/shared/web3'
import logo from '@/assets/images/logo.png'
import { useConnection } from 'wagmi'
import { useActiveAccount } from 'thirdweb/react'
import { cn } from '@/lib/utils'

export default function Topnav() {
  const { side } = useParams()
  const location = useLocation()
  const { isConnected, address } = useConnection()
  const activeAccount = useActiveAccount()

  const navItems = [
    {
      key: 'sell',
      label: 'Sell Assets',
      to: generatePath('/trade/sell/:token?/:fiat?/:method?', { side: 'sell' }),
    },
    {
      key: 'buy',
      label: 'Buy Assets',
      to: generatePath('/trade/buy/:token?/:fiat?/:method?', { side: 'buy' }),
    },
    {
      key: 'docs',
      label: 'Documentation',
      to: '/docs',
      isExternal: true,
    },
  ]

  const userMenuItems = [
    {
      label: 'Publish',
      to: '/trade/offer/new',
      key: 'create-offer',
    },
    {
      label: 'My Offers',
      to: '/me/offers',
      key: 'my-offers',
    },
    {
      label: 'History',
      to: '/me/deals',
      key: 'my-deals',
    },
    {
      label: 'Identity',
      to: '/me',
      key: 'profile',
    },
  ]

  const showUserMenu = isConnected || !!address || !!activeAccount

  return (
    <nav className="flex items-center justify-between h-24 px-8 md:px-12 border-b border-white/5 bg-surface-dim/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-16">
        <Link to="/" className="flex items-center group">
          <img alt="Logo" src={logo} className="w-10 h-10 object-contain transition-transform group-hover:scale-110 group-hover:rotate-12" />
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              target={item.isExternal ? '_blank' : undefined}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary relative py-2",
                (side === item.key || location.pathname === item.to)
                  ? "text-primary after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full after:neon-glow"
                  : "text-on-surface-variant/40"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-8">
        {showUserMenu && (
          <div className="hidden xl:flex items-center gap-8 mr-4">
            {userMenuItems.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary",
                  location.pathname === item.to ? "text-primary" : "text-on-surface-variant/40"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
        <div className="flex items-center gap-6">
          <WalletMenu />
          <div className="h-4 w-px bg-white/10" />
          <Notifications />
        </div>
      </div>
    </nav>
  )
}
