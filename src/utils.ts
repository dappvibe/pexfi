import { isAddressEqual, type Address } from 'viem'

export const formatAddress = (addr: string): string => {
  const s = addr.slice(0, 2) + addr.slice(2)
  return `${s.substring(0, 6)}...${s.substring(38)}`
}

const currencyFormatterCache = new Map<string, Intl.NumberFormat>()

export const formatMoney = (currency: string, amount: number): string => {
  let formatter = currencyFormatterCache.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })
    currencyFormatterCache.set(currency, formatter)
  }
  return formatter.format(amount)
}

export const equal = (a: Address, b: Address): boolean => isAddressEqual(a, b)

/** Converts raw 6-decimal value from Market.getPrice() to a human-readable float */
export const normalizeMarketPrice = (raw: bigint | number): number => Number(raw) / 1_000_000
