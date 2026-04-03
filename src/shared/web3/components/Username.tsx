import { shortenAddress } from 'thirdweb/utils'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Profile {
  dealsCompleted: number
  rating: number
}

interface UsernameProps {
  address: string
  avatar?: boolean
  profile?: Profile | null
}

export default function Username({ address, avatar = false, profile = null }: UsernameProps) {
  const trades = profile?.dealsCompleted ?? '-'
  const rating = profile?.rating ?? '??'

  const link = (
    <Link to={'/profile/' + address} className="font-medium text-primary hover:text-white transition-colors">
      {shortenAddress(address)} <span className="text-foreground/40 text-[10px] font-bold uppercase ml-1">({trades}; {rating}%)</span>
    </Link>
  )

  if (avatar) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={'https://effigy.im/a/' + address + '.svg'} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        {link}
      </div>
    )
  } else return link
}
