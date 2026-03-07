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
          message="You are on testnet. Tokens have no value here."
          type="error"
          showIcon
        />
      )}
      <Alert
        message={
          <>This is fully functional preview of onchain noncustodial no-KYC crypto P2P marketplace. <a href="https://x.com/pexficom" target="_blank">Stay tuned!</a></>
        }
        style={{ marginTop: 10, marginBottom: 10 }}
        type={'info'}
      />
    </>
  )
}
