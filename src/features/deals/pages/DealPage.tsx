import DealCard from '@/features/deals/components/DealCard'
import MessageBox from '@/features/deals/components/MessageBox'
import { useDeal } from '@/features/deals/hooks/useDeal.ts'
import { Helmet } from '@dr.pogodin/react-helmet'
import { useEffect } from 'react'

export default function DealPage() {
  const { deal, error } = useDeal()

  useEffect(() => {
    if (error) {
      console.error(error)
    }
  }, [error])

  if (!deal) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-primary animate-pulse font-bold uppercase tracking-[0.4em] text-[10px]">
      <div className="flex gap-3">
         <div className="w-2 h-2 rounded-full bg-primary" />
         <div className="w-2 h-2 rounded-full bg-primary opacity-60" />
         <div className="w-2 h-2 rounded-full bg-primary opacity-30" />
      </div>
      Synchronizing Deal Environment
    </div>
  )

  return (
    <div className="max-w-[1440px] mx-auto py-12 px-6 pb-32">
      <Helmet>
        <title>Deal #{deal.address?.toString().slice(0, 8) || 'Loading'} - PEXFI</title>
        <meta name="description" content="View details for Deal on PEXFI." />
      </Helmet>

      <div className="space-y-12">
        {/* Deal Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <div className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">Protocol Node: Active Deal</div>
                 <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest animate-pulse">Live Synchronization</div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-none flex items-center gap-4">
                Deal <span className="text-primary font-mono opacity-80">#{deal.address?.toString().slice(2, 10).toUpperCase()}</span>
              </h1>
           </div>

           <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
              Contract: <span className="text-white font-mono">{deal.address?.toString().slice(0, 16)}...</span>
           </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
          <div className="xl:col-span-8 space-y-12">
            <DealCard />
          </div>
          <div className="xl:col-span-4 sticky top-32">
            <MessageBox />
          </div>
        </div>
      </div>
    </div>
  )
}
