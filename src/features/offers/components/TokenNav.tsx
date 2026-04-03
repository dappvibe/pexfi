import { generatePath, Link, useParams } from 'react-router-dom'
import { useInventory } from '@/shared/web3'
import { cn } from '@/lib/utils'

export default function TokenNav() {
  const { side = 'sell', token: currentToken = 'WETH', fiat = 'USD', method = null } = useParams()
  const { tokens } = useInventory()

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-lowest rounded-xl">
      {Object.keys(tokens).map((token) => (
        <Link
          key={token}
          to={generatePath('/trade/:side/:token/:fiat/:method?', { side, token, fiat, method })}
          className={cn(
            "px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-lg",
            currentToken === token
              ? "text-primary bg-primary/10 shadow-inner"
              : "text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-white/5"
          )}
        >
          {tokens[token].symbol}
        </Link>
      ))}
    </div>
  )
}
