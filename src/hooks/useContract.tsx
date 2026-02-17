import { abi as MarketAbi } from '@artifacts/evm/protocol/Market.sol/Market.json'
import { abi as ProfileAbi } from '@artifacts/evm/protocol/Profile.sol/Profile.json'
import { abi as DealAbi } from '@artifacts/evm/protocol/Deal.sol/Deal.json'
import { abi as OfferAbi } from '@artifacts/evm/protocol/Offer.sol/Offer.json'
import { abi as OfferFactoryAbi } from '@artifacts/evm/protocol/OfferFactory.sol/OfferFactory.json'
import { abi as DealFactoryAbi } from '@artifacts/evm/protocol/DealFactory.sol/DealFactory.json'
import { abi as ERC20Abi } from '@artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json'
import { useChainId, useClient, useConnectorClient } from 'wagmi'
import { BaseContract, BrowserProvider, ethers, JsonRpcApiProvider, JsonRpcSigner, WebSocketProvider } from 'ethers'
import { useMemo } from 'react'
import * as Types from '@/types'
import { useAddress } from './useAddress'
import { mainnet, sepolia } from 'wagmi/chains'

/**
 * To allow reuse in useContract() when building ethers provider from Wagmi Client.
 * @deprecated ethers to be removed in 1.0
 */
function getRpcUrl(chainId: number): string {
  chainId = Number(chainId)
  switch (chainId) {
    case mainnet.id:
      return 'wss://eth-mainnet.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY
    case sepolia.id:
      return 'wss://eth-sepolia.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY
    default:
      return 'ws://localhost:8545'
  }
}

/**
 * @deprecated use wagmi generated hooks and useAddress()
 */
export function useContract() {
  const chainId = useChainId()
  const client = useClient({ chainId })

  function clientToProvider(client) {
    const { chain } = client
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    }

    const url = getRpcUrl(chainId)
    return new WebSocketProvider(url, network)
  }

  function clientToSigner(client: any) {
    const { account, chain, transport } = client
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    }
    let provider: JsonRpcApiProvider
    try {
      provider = new BrowserProvider(transport, network)
    } catch (error) {
      provider = clientToProvider(client)
    }
    return new JsonRpcSigner(provider, account.address)
  }
  const { data: connector } = useConnectorClient({ chainId })

  const marketAddress = useAddress('Market#Market')
  const offerFactoryAddress = useAddress('Market#OfferFactory')
  const dealFactoryAddress = useAddress('Market#DealFactory')
  const profileAddress = useAddress('Market#Profile')

  const provider = useMemo(() => (client ? clientToProvider(client) : undefined), [client, chainId])

  const signed = async <T extends BaseContract>(contract: T): Promise<T> => {
    const signer = clientToSigner(connector)
    return contract.connect(signer) as T
  }

  const Market = new ethers.Contract(marketAddress || ethers.ZeroAddress, MarketAbi, provider) as unknown as Types.Market
  const OfferFactory = new ethers.Contract(
    offerFactoryAddress || ethers.ZeroAddress,
    OfferFactoryAbi,
    provider
  ) as unknown as Types.OfferFactory
  const DealFactory = new ethers.Contract(
    dealFactoryAddress || ethers.ZeroAddress,
    DealFactoryAbi,
    provider
  ) as unknown as Types.DealFactory
  const Profile = new ethers.Contract(
    profileAddress || ethers.ZeroAddress,
    ProfileAbi,
    provider
  ) as unknown as Types.Profile
  const Deal = new ethers.Contract(ethers.ZeroAddress, DealAbi, provider) as unknown as Types.Deal
  const Offer = new ethers.Contract(ethers.ZeroAddress, OfferAbi, provider) as unknown as Types.Offer
  const Token = new ethers.Contract(ethers.ZeroAddress, ERC20Abi, provider) as unknown as Types.ERC20

  return {
    signed,
    Market,
    OfferFactory,
    DealFactory,
    Profile,
    Deal,
    Offer,
    Token,
  }
}
