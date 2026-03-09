import React, { useMemo } from 'react'
import { Alert } from 'antd'
import { useChainId, useChains } from 'wagmi'

export const Announcement: React.FC = () => {
  const chainId = useChainId()
  const chains = useChains()

  const testnet = useMemo(() => {
    const chain = chains.find((c) => c.id === chainId)
    return chain?.testnet || chainId === 31337
  }, [chainId, chains])

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
