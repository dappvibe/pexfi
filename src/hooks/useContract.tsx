import deployed from '../../contracts/addresses.json'
import { abi as MarketAbi } from '../../contracts/artifacts/Market.json'
import { abi as RepTokenAbi } from '../../contracts/artifacts/RepToken.json'
import { abi as DealAbi } from '../../contracts/artifacts/Deal.json'
import { abi as OfferAbi } from '../../contracts/artifacts/Offer.json'
import { abi as OfferFactoryAbi } from '../../contracts/artifacts/OfferFactory.json'
import { abi as DealFactoryAbi } from '../../contracts/artifacts/DealFactory.json'
import { abi as ERC20Abi } from '../../contracts/artifacts/ERC20.json'
import { useChainId, useClient, useConnectorClient } from 'wagmi'
import { BaseContract, BrowserProvider, ethers, WebSocketProvider, JsonRpcSigner, JsonRpcApiProvider } from 'ethers'
import { useMemo } from 'react'
import * as Types from 'types'

import { getRpcUrl } from '../wagmi.config'

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

    const url = getRpcUrl(chainId, chain.id !== 31337)
    return new WebSocketProvider(url, network)
  }
  useMemo(() => (client ? clientToProvider(client) : undefined), [client])

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
  useMemo(() => (connector ? clientToSigner(connector) : undefined), [connector])

  const addresses = deployed[chainId]
  const provider = clientToProvider(client)

  const signed = async <T extends BaseContract>(contract: T): Promise<T> => {
    const signer = clientToSigner(connector)
    return contract.connect(signer) as T
  }

  const Market = new ethers.Contract(addresses['Market#Market'], MarketAbi, provider) as unknown as Types.Market
  const OfferFactory = new ethers.Contract(
    addresses['OfferFactory#OfferFactory'],
    OfferFactoryAbi,
    provider
  ) as unknown as Types.OfferFactory
  const DealFactory = new ethers.Contract(
    addresses['DealFactory#DealFactory'],
    DealFactoryAbi,
    provider
  ) as unknown as Types.DealFactory
  const RepToken = new ethers.Contract(
    addresses['RepToken#RepToken'],
    RepTokenAbi,
    provider
  ) as unknown as Types.RepToken
  const Deal = new ethers.Contract('0x', DealAbi, provider) as unknown as Types.Deal
  const Offer = new ethers.Contract('0x', OfferAbi, provider) as unknown as Types.Offer
  const Token = new ethers.Contract('0x', ERC20Abi, provider) as unknown as Types.ERC20

  return {
    signed,
    Market,
    OfferFactory,
    DealFactory,
    RepToken,
    Deal,
    Offer,
    Token,
  }
}
