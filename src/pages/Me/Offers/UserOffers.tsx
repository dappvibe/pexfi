import Offers from '@/pages/Trade/Offers/Offers'
import { useAccount } from 'wagmi'

export default function UserOffers() {
  const { address } = useAccount()

  const filter = {
    owner: address,
  }

  return <Offers filter={filter} />
}
