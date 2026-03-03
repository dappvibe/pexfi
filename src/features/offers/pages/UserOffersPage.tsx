import OffersListPage from '@/features/offers/pages/OffersListPage'
import { useAccount } from 'wagmi'

export default function UserOffersPage() {
  const { address } = useAccount()

  return <OffersListPage filter={{ owner: address }} />
}
