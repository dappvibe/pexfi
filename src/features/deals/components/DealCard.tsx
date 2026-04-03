import DealInfo from '@/features/deals/components/DealInfo'
import DealProgress from '@/features/deals/components/DealProgress'
import Controls from '@/features/deals/components/Controls'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DealCard() {
  return (
    <Card className="surface-container rounded-[2.5rem] border-none overflow-hidden relative ambient-shadow transition-all duration-500">
      <div className="absolute top-0 left-0 w-full h-2 bg-primary/20" />

      <CardHeader className="bg-surface-high/10 py-12 px-12 border-b border-white/5 relative overflow-hidden">
         {/* Subtle Background Glow */}
         <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[60px] -z-10 translate-x-1/2 -translate-y-1/2" />

         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-1">
               <CardTitle className="text-3xl font-bold tracking-tight text-white">Handshake <span className="text-primary">Parameters</span></CardTitle>
               <p className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-[0.2em]">Validated Cryptographic Settlement Agreement</p>
            </div>
            <div className="flex items-center">
               <DealProgress />
            </div>
         </div>
      </CardHeader>

      <CardContent className="p-12 space-y-16">
        <DealInfo />

        <div className="pt-12 border-t border-white/5">
           <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/40 mb-8 ml-1">Protocol Controls & Resolution</div>
           <Controls />
        </div>
      </CardContent>
    </Card>
  )
}
