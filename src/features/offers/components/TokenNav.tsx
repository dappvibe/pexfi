import { Menu } from 'antd'
import { generatePath, Link, useParams } from 'react-router-dom'
import { useInventory } from '@/shared/web3'

export default function TokenNav() {
  let { side = 'sell', token: currentToken = 'WETH', fiat = 'USD', method = null } = useParams()
  const { tokens } = useInventory()

  return (
    <div style={{
      display: 'flex',
      background: '#131315',
      padding: '4px',
      borderRadius: '12px',
      gap: '4px'
    }}>
      {Object.keys(tokens).map((symbol) => {
        const isActive = currentToken === symbol
        return (
          <Link
            key={symbol}
            to={generatePath('/trade/:side/:token/:fiat/:method?', { side, token: symbol, fiat, method: method || undefined })}
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s',
              background: isActive ? '#d0bcff' : 'transparent',
              color: isActive ? '#131315' : '#cbc3d7',
            }}
          >
            {symbol}
          </Link>
        )
      })}
    </div>
  )
}
