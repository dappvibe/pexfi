import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function OfferSubnav({ offer }: { offer: any }) {
  if (!offer) return null

  return (
    <div className="flex items-center gap-4 py-4">
      <Link
        to={`/trade/sell/${offer.token?.symbol}/${offer.fiat}/${offer.method}`}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to marketplace
      </Link>
    </div>
  )
}
