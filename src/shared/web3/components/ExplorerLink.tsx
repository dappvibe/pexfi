import { Address } from 'viem'
import { useChains } from 'wagmi'

interface ExplorerLinkProps {
  children: React.ReactNode
  address: Address
}

export default function ExplorerLink({ children, address }: ExplorerLinkProps) {
  const chains = useChains()
  const explorer = chains[0]?.blockExplorers?.default?.url ?? 'http://localhost'

  return (
    <a href={`${explorer}/address/${address}`} target="_blank">
      {children}
    </a>
  )
}
