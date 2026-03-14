import { Address } from 'viem'
import type { Token, Fiat, Method } from '@/shared/web3'

export interface OfferFormData {
  isSell: boolean
  token: string
  fiat: string
  method: string
  rate: number
  min: number
  max: number
  terms: string
}

export interface OfferParams {
  isSell: boolean
  token: Address
  fiat: `0x${string}`
  methods: bigint
  rate: number
  limits: {
    min: number
    max: number
  }
  terms: string
}

export interface CreateOfferResult {
  offerAddress: Address
  transactionHash: `0x${string}`
}

export interface RateParams {
  token: Address
  fiat: `0x${string}`
}

export interface UseOfferFormReturn {
  form: any
  tokens: Record<string, Token>
  fiats: Record<string, Fiat>
  methods: Record<string, Method>
  inventoryLoading: boolean
  lockSubmit: boolean
  createOffer: (values: OfferFormData) => Promise<void>
  fetchRate: () => void
  previewPrice: () => void
  handleSetRate?: () => Promise<void>
  handleSetLimits?: () => Promise<void>
  handleSetTerms?: () => Promise<void>
  handleToggleDisabled?: () => Promise<void>
}

export interface UseCreateOfferFormReturn extends Omit<UseOfferFormReturn, 'handleSetRate' | 'handleSetLimits' | 'handleSetTerms' | 'handleToggleDisabled'> {
  // Create-specific returns
}

export interface UseEditOfferFormReturn extends Omit<UseOfferFormReturn, 'createOffer'> {
  // Edit-specific returns
  offer: any
  handleSetRate: () => Promise<void>
  handleSetLimits: () => Promise<void>
  handleSetTerms: () => Promise<void>
  handleToggleDisabled: () => Promise<void>
}
