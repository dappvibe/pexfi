import OfferForm from '@/features/offers/components/OfferForm'
import { useOfferForm } from '@/features/offers/hooks/useOfferForm'
import { Helmet } from '@dr.pogodin/react-helmet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function OfferNewPage() {
  const offerForm = useOfferForm()

  if (offerForm.inventoryLoading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-primary animate-pulse font-bold uppercase tracking-[0.4em] text-[10px]">
      <div className="flex gap-3">
         <div className="w-2 h-2 rounded-full bg-primary" />
         <div className="w-2 h-2 rounded-full bg-primary opacity-60" />
         <div className="w-2 h-2 rounded-full bg-primary opacity-30" />
      </div>
      Gathering Marketplace Assets
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 pb-32">
      <Helmet>
        <title>Publish Offer - PEXFI</title>
        <meta name="description" content="Create a new P2P crypto trading offer on PEXFI." />
      </Helmet>

      <div className="space-y-12">
        <div className="space-y-3">
           <div className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">Protocol Node: Liquidity Generation</div>
           <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-none">
             Publish <span className="text-primary">Offer</span>
           </h1>
        </div>

        <Card className="surface-container rounded-[2.5rem] border-none overflow-hidden relative ambient-shadow">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary/20" />

          <CardHeader className="bg-surface-high/10 py-20 px-12 border-b border-white/5 text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] -z-10" />

            <CardTitle className="text-4xl font-bold tracking-tight text-white mb-4">
              Liquidity <span className="text-primary">Provisioning</span>
            </CardTitle>
            <p className="text-on-surface-variant/60 text-lg max-w-xl mx-auto leading-relaxed font-medium">
              Configure your automated cryptographic settlement parameters on the Cyber-Native frontier.
            </p>
          </CardHeader>

          <CardContent className="p-12 md:p-20">
            <OfferForm {...offerForm} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-10 bg-surface-container-low rounded-[2rem] ghost-border space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">On-Chain Settlement</div>
              <p className="text-sm text-on-surface-variant/60 leading-relaxed font-medium">
                Your offer will be published as a persistent smart contract on the blockchain. Terms are immutable once the deal is initialized by a peer.
              </p>
           </div>
           <div className="p-10 bg-surface-container-low rounded-[2rem] ghost-border space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-tertiary">Reputation Impact</div>
              <p className="text-sm text-on-surface-variant/60 leading-relaxed font-medium">
                Successfully completed deals will boost your Protocol Trust Score, increasing your visibility in the marketplace matrix.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
