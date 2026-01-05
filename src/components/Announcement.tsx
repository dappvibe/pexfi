import React from 'react'
import { Alert } from 'antd'
import { useChainId, useChains } from 'wagmi'

export const Announcement: React.FC = () => {
  const chainId = useChainId()
  const chains = useChains()

  const [testnet, setTestnet] = React.useState(false)
  React.useEffect(() => {
    const chain = chains.find((chain) => chain.id === chainId)
    if (chain?.testnet || chainId == 31337) {
      setTestnet(true)
    }
  }, [chainId])

  return (
    <>
      {testnet && (
        <Alert
          style={{ marginTop: 10, marginBottom: 10 }}
          message="This is a testnet. Tokens have no value here."
          type="error"
          showIcon
        />
      )}
      <Alert
        message={
          "Welcome to Priveer's MVP! Your feedback is valuable at this stage! We plan on a design overhaul once funding allows us to expand the team."
        }
        style={{ marginTop: 10, marginBottom: 10 }}
        type={'info'}
      />
    </>
  )
}
