import React, { useMemo } from 'react'
import { useChainId, useChains } from 'wagmi'
import { Info, AlertTriangle } from 'lucide-react'

export const Announcement: React.FC = () => {
  const chainId = useChainId()
  const chains = useChains()

  const testnet = useMemo(() => {
    const chain = chains.find((c) => c.id === chainId)
    return chain?.testnet || chainId === 31337
  }, [chainId, chains])

  return (
    <div className="flex flex-col gap-4 mb-8">
      {testnet && (
        <div className="flex items-center gap-4 p-5 bg-error-container/10 border border-error/10 rounded-2xl text-error">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Protocol Alert: You are on testnet. Tokens have no value here.
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 p-5 bg-surface-container-low/40 ghost-border rounded-2xl text-on-surface-variant/60">
        <Info className="h-5 w-5 shrink-0 text-primary" />
        <div className="text-[10px] font-bold uppercase tracking-[0.2em]">
          Handshake Preview: This is a fully functional non-custodial marketplace.
          <a href="https://x.com/pexficom" target="_blank" className="ml-3 font-bold text-primary underline hover:text-white transition-all">
            Stay tuned!
          </a>
        </div>
      </div>
    </div>
  )
}
