import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

const GET_INVENTORY = gql`
  query GetInventory {
    tokens(where: { removed: false }) {
      id
      address
      name
      symbol
      decimals
    }
    fiats(where: { removed: false }) {
      id
      symbol
    }
    methods(where: { disabled: false }) {
      id
      name
      index
    }
  }
`

export interface Token {
  id: string
  address: string
  name: string
  symbol: string
  decimals: number
}

export interface Fiat {
  id: string
  symbol: string
}

export interface Method {
  id: string
  name: string
  index: string
}

export function useInventory() {
  const { data, loading, error } = useQuery(GET_INVENTORY)

  if (loading || error || !data) {
    return {
      tokens: {} as Record<string, Token>,
      fiats: {} as Record<string, Fiat>,
      methods: {} as Record<string, Method>,
      loading,
      error,
    }
  }

  const tokens = (data.tokens || []).reduce((acc: Record<string, Token>, token: Token) => {
    acc[token.symbol] = token
    return acc
  }, {})

  const fiats = (data.fiats || []).reduce((acc: Record<string, Fiat>, fiat: Fiat) => {
    acc[fiat.symbol] = fiat
    return acc
  }, {})

  const methods = (data.methods || []).reduce((acc: Record<string, Method>, method: Method) => {
    acc[method.name] = method
    return acc
  }, {})

  return { tokens, fiats, methods, loading: false, error: undefined }
}
