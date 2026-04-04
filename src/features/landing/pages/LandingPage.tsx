import { useState } from 'react'
import { Helmet } from '@dr.pogodin/react-helmet'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'How do I get started?',
      answer:
        "Connect your Web3 wallet (Metamask, Rabby, or via WalletConnect), navigate to the 'Buy' section, and choose an offer that matches your preferred payment method."
    },
    {
      question: 'What payment methods are supported?',
      answer:
        'Since PEXFI is P2P, users can support any method including Revolut, Wise, SEPA, Venmo, and local bank transfers. The smart contract holds the crypto until the seller confirms receipt of fiat.'
    },
    {
      question: 'Is my money safe?',
      answer:
        'Yes. PEXFI uses audited, non-custodial smart contracts. During a trade, the crypto is locked in a transparent escrow. If a dispute arises, our decentralized mediation system steps in to verify proof of payment.'
    }
  ]
  return (
    <div className="bg-surface select-none min-h-screen">
      <Helmet>
        <title>PEXFI - The Cyber-Native Frontier</title>
        <meta
          name="description"
          content="The first truly non-custodial, no-KYC P2P marketplace. Direct smart contract escrows with your favorite payment methods."
        />
      </Helmet>

      {/* TopNavBar */}
      <header className="bg-[#131315]/80 backdrop-blur-xl text-[#D0BCFF] font-['Inter'] font-semibold tracking-tight docked full-width top-0 z-50 border-b border-[#353437]/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-between px-6 py-4 w-full sticky top-0">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black tracking-tighter text-[#D0BCFF]">
            PEXFI
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <Link className="text-[#CBC3D7] hover:text-[#D0BCFF] hover:bg-[#2A2A2C]/50 px-4 py-2 rounded-lg transition-all" to="/trade/buy">
              Buy
            </Link>
            <Link className="text-[#CBC3D7] hover:text-[#D0BCFF] hover:bg-[#2A2A2C]/50 px-4 py-2 rounded-lg transition-all" to="/trade/sell">
              Sell
            </Link>
            <a className="text-[#CBC3D7] hover:text-[#D0BCFF] hover:bg-[#2A2A2C]/50 px-4 py-2 rounded-lg transition-all" href="/docs">
              Learn
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="material-symbols-outlined text-on-surface-variant hover:bg-[#2A2A2C]/50 p-2 rounded-lg transition-all scale-95 active:scale-90"
          >
            notifications
          </button>
          <button
            className="material-symbols-outlined text-on-surface-variant hover:bg-[#2A2A2C]/50 p-2 rounded-lg transition-all scale-95 active:scale-90"
          >
            account_circle
          </button>
          <button className="primary-gradient text-on-primary-container px-5 py-2 rounded-xl font-bold transition-transform scale-95 active:scale-90">
            Connect Wallet
          </button>
        </div>
      </header>

      <main>
        {/* Alert Banner */}
        <div className="bg-surface-container-low px-6 py-3 flex justify-center items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <span className="material-symbols-outlined text-primary text-sm">
              info
            </span>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Testnet Active: Trade on Sepolia for free.
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]"></div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary-container/5 blur-[120px]"></div>
          </div>
          <div className="z-10 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-8">
              Trade Crypto for Fiat <span className="text-gradient">Onchain</span>
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              The first truly non-custodial, no-KYC P2P marketplace. Direct smart contract escrows
              with your favorite payment methods.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link
                to="/trade/buy"
                className="primary-gradient text-on-primary-container px-10 py-4 rounded-xl font-bold text-lg ambient-glow transition-transform hover:scale-[1.02] active:scale-95"
              >
                Start Trading
              </Link>
              <a
                href="/docs"
                className="bg-surface-container-highest/40 backdrop-blur-md text-on-surface px-10 py-4 rounded-xl font-bold text-lg border border-outline-variant/20 transition-transform hover:scale-[1.02] active:scale-95 inline-block"
              >
                How it works
              </a>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-24 bg-surface-container-low relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-4">
                Architected for Autonomy
              </h2>
              <p className="text-on-surface-variant font-medium">
                Removing the middleman, preserving your privacy.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="bg-surface-container rounded-xl p-8 transition-all hover:bg-surface-container-high group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">shield</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Non-Custodial</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Your keys, your crypto. We never hold your funds. All trades happen directly from
                  your wallet.
                </p>
              </div>
              {/* Feature Card 2 */}
              <div className="bg-surface-container rounded-xl p-8 transition-all hover:bg-surface-container-high group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">person_off</span>
                </div>
                <h3 className="text-xl font-bold mb-3">No-KYC</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Trade privately and securely. No identity verification required. Your reputation
                  is built on-chain.
                </p>
              </div>
              {/* Feature Card 3 */}
              <div className="bg-surface-container rounded-xl p-8 transition-all hover:bg-surface-container-high group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">lock</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Secure Escrow</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Onchain smart contracts ensure both parties fulfill their obligations
                  automatically and fairly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 bg-surface max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked</h2>
            <div className="h-1 w-12 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-surface-container-low rounded-xl overflow-hidden border border-primary/5 hover:border-primary/20 transition-all">
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container transition-colors"
                >
                  <span className="font-bold text-lg">{faq.question}</span>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180 text-primary' : 'text-on-surface-variant'}`}>
                    expand_more
                  </span>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto rounded-[2rem] bg-surface-container relative overflow-hidden p-12 md:p-24 flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 relative z-10">
              Ready to enter the frontier?
            </h2>
            <Link
              to="/trade/buy"
              className="primary-gradient text-on-primary-container px-12 py-5 rounded-xl font-black text-xl hover:scale-105 active:scale-95 transition-transform shadow-2xl relative z-10"
            >
              Enter Dashboard
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#131315] font-['Inter'] text-xs tracking-widest uppercase w-full border-t border-[#353437]/10 py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-sm font-bold text-[#D0BCFF]">PEXFI</span>
          <span className="text-[#CBC3D7] normal-case tracking-normal">
            © 2024 PEXFI. The Cyber-Native Frontier.
          </span>
        </div>
        <div className="flex gap-8 items-center">
          <a className="text-[#CBC3D7] hover:text-[#D0BCFF] transition-all underline-offset-4 hover:underline" href="#">
            Terms
          </a>
          <a className="text-[#CBC3D7] hover:text-[#D0BCFF] transition-all underline-offset-4 hover:underline" href="#">
            Privacy
          </a>
          <a className="text-[#CBC3D7] hover:text-[#D0BCFF] transition-all underline-offset-4 hover:underline" href="#">
            Discord
          </a>
          <a className="text-[#CBC3D7] hover:text-[#D0BCFF] transition-all underline-offset-4 hover:underline" href="/docs">
            Docs
          </a>
        </div>
      </footer>
    </div>
  )
}
