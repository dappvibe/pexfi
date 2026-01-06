import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { config } from '@/wagmi.config'
import App from './App'
import '@/main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <App />
    </WagmiProvider>
  </React.StrictMode>
)
