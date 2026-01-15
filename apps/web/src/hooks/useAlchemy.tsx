import { Alchemy, AlchemySettings, Network } from 'alchemy-sdk'
import { useEffect, useState } from 'react'

export function useAlchemy(): Alchemy | null {
  const [alchemy, setAlchemy] = useState<Alchemy | null>(null)

  useEffect(() => {
    // @ts-ignore
    const apiKey = import.meta.env.VITE_ALCHEMY_KEY
    if (apiKey) {
      const settings: AlchemySettings = {
        apiKey,
        network: Network.ARB_MAINNET,
      }
      setAlchemy(new Alchemy(settings))
    } else {
      console.error('Alchemy API key is not defined in the environment variables.')
    }
  }, [])

  return alchemy
}
