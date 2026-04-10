import { generatePath, Link, useParams, useLocation } from 'react-router-dom'
import { Notifications, WalletMenu } from '@/shared/web3'
import { useAccount } from 'wagmi'

export default function Topnav() {
  const params = useParams()
  const location = useLocation()
  const { isConnected, address } = useAccount()

  const navItems = [
    {
      key: 'buy',
      label: 'Buy',
      path: generatePath('/trade/buy/:token?/:fiat?/:method?', params as any),
      active: location.pathname.startsWith('/trade/buy')
    },
    {
      key: 'sell',
      label: 'Sell',
      path: generatePath('/trade/sell/:token?/:fiat?/:method?', params as any),
      active: location.pathname.startsWith('/trade/sell')
    },
    {
      key: 'docs',
      label: 'Learn',
      path: '/docs',
      isExternal: true
    },
  ]

  const userMenuItems = [
    {
      label: 'My Offers',
      path: '/me/offers',
      active: location.pathname === '/me/offers'
    },
    {
      label: 'My Deals',
      path: '/me/deals',
      active: location.pathname === '/me/deals'
    },
  ]

  const showUserMenu = isConnected || !!address

  return (
    <header className="bg-[#131315]/80 backdrop-blur-xl text-[#D0BCFF] font-['Inter'] font-semibold tracking-tight top-0 z-[1001] border-b border-[#353437]/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-between px-6 py-4 w-full sticky h-[72px]">
      <div className="flex items-center gap-8 px-6">
        <Link to="/" className="text-2xl font-black tracking-tighter text-[#D0BCFF] no-underline">
          PEXFI
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
             item.isExternal ? (
               <a 
                 key={item.key} 
                 href={item.path} 
                 className={`px-4 py-2 rounded-lg transition-all no-underline ${item.active ? 'text-[#D0BCFF] bg-[#2A2A2C]/50' : 'text-[#CBC3D7] hover:text-[#D0BCFF] hover:bg-[#2A2A2C]/50'}`}
               >
                 {item.label}
               </a>
             ) : (
               <Link 
                 key={item.key} 
                 to={item.path} 
                 className={`px-4 py-2 rounded-lg transition-all no-underline ${item.active ? 'text-[#D0BCFF] bg-[#2A2A2C]/50' : 'text-[#CBC3D7] hover:text-[#D0BCFF] hover:bg-[#2A2A2C]/50'}`}
               >
                 {item.label}
               </Link>
             )
          ))}
          
          {showUserMenu && (
            <>
              <div className="w-[1px] h-4 bg-[#353437]/40 mx-2" />
              {userMenuItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`px-4 py-2 rounded-lg transition-all no-underline ${item.active ? 'text-[#D0BCFF] bg-[#2A2A2C]/50' : 'text-[#CBC3D7] hover:text-[#D0BCFF] hover:bg-[#2A2A2C]/50'}`}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-1 px-6">
        <Notifications />
        <button className="material-symbols-outlined text-[#cbc3d7] hover:text-[#D0BCFF] hover:bg-[#2A2A2C]/50 p-2 rounded-lg transition-all scale-95 active:scale-90 border-none bg-transparent cursor-pointer relative">
          notifications
        </button>
        <WalletMenu />
      </div>
    </header>
  )
}
