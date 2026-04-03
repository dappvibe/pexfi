import { generatePath, useNavigate, useParams } from 'react-router-dom'
import { useInventory } from '@/shared/web3'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OffersFilters({ setFilterAmount }: { setFilterAmount: (amount: string) => void }) {
  const navigate = useNavigate()
  const { fiats, methods } = useInventory()
  const { side = 'sell', token = 'WETH', fiat = 'USD', method = undefined } = useParams()

  const handleFiatChange = (newFiat: string) => {
    navigate(generatePath('/trade/:side/:token/:fiat/:method?', { side, token, fiat: newFiat, method }))
  }

  const handleMethodChange = (newMethod: string) => {
    const finalMethod = newMethod === 'all' ? undefined : newMethod
    navigate(generatePath('/trade/:side/:token/:fiat/:method?', { side, token, fiat, method: finalMethod }))
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* Combined Input/Select Container */}
      <div className="flex items-center bg-surface-lowest rounded-xl ghost-border focus-within:border-primary/40 focus-within:neon-glow transition-all overflow-hidden h-12 shadow-inner">
        <div className="flex items-center px-4 gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant/40"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
           <Input
             placeholder="Search amount"
             className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-32 h-full text-[10px] font-bold uppercase tracking-widest px-2"
             onChange={(e) => setFilterAmount(e.target.value)}
           />
        </div>
        <div className="h-4 w-px bg-white/5" />
        <Select defaultValue={fiat} onValueChange={handleFiatChange}>
          <SelectTrigger className="w-28 border-none bg-transparent focus:ring-0 focus:ring-offset-0 h-full text-[10px] font-bold uppercase tracking-widest px-4 hover:bg-white/5 transition-colors">
            <SelectValue placeholder="Fiat" />
          </SelectTrigger>
          <SelectContent className="bg-surface-container border-white/10">
            {Object.keys(fiats).map((symbol) => (
              <SelectItem key={symbol} value={symbol} className="text-[10px] font-bold uppercase tracking-widest">
                {symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payment Method Select */}
      <Select defaultValue={method || 'all'} onValueChange={handleMethodChange}>
        <SelectTrigger className="w-56 bg-surface-lowest ghost-border h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest px-6 shadow-inner hover:bg-white/5 transition-all">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             <SelectValue placeholder="Protocol: Payment method" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-surface-container border-white/10">
          <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">Protocol: All methods</SelectItem>
          {Object.keys(methods).map((m) => (
            <SelectItem key={m} value={m} className="text-[10px] font-bold uppercase tracking-widest">
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
