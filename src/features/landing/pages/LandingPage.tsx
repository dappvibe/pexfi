import { Helmet } from '@dr.pogodin/react-helmet'
import Faq from '@/features/landing/components/Faq'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-24 py-12 overflow-hidden">
      <Helmet>
        <title>PEXFI - Fully Decentralized P2P Marketplace</title>
        <meta
          name="description"
          content="Atmospheric on-chain P2P trading. Reject the flat web in favor of Atmospheric Depth."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-10 max-w-6xl mx-auto px-6 relative py-12">
        {/* Atmospheric Depth Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] -z-10" />

        <div className="space-y-4">
          <h2 className="opacity-40 uppercase tracking-[0.3em] font-bold text-2xl md:text-3xl text-on-surface">The Cyber-Native</h2>
          <h1 className="text-6xl md:text-[5.5rem] font-bold tracking-[-0.04em] text-white leading-[1.05]">
            Fully Decentralized
          </h1>
          <div className="inline-block mt-4">
            <div className="px-10 py-4 rounded-[2rem] bg-surface-lowest ghost-border neon-glow relative">
               <span className="text-5xl md:text-7xl font-bold tracking-[-0.02em] text-primary block">P2P Marketplace</span>
            </div>
          </div>
          <p className="text-xl md:text-2xl text-on-surface-variant/80 max-w-3xl mx-auto leading-relaxed pt-8 font-medium">
            Trade ERC20 tokens securely and censorship-resistant — entirely on-chain. <br className="hidden md:block" />
            Reject the flat web in favor of Atmospheric Depth.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
          <Button asChild size="lg" className="min-w-[280px]">
            <Link to="/trade/sell">Enter Marketplace</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="min-w-[280px]">
            <a href="/docs">View Protocol Specs</a>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="width-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Unstoppable"
            description="The marketplace operates without a central server. Direct blockchain connectivity ensures absolute resilience."
          />
          <FeatureCard
            title="Non-custodial"
            description="No accounts, no intermediaries. Each trade is facilitated by an on-demand funded obsidian smart contract."
          />
          <FeatureCard
            title="Anonymous"
            description="Privacy by design. We handle no funds and enforce no KYC/AML. Your keys, your identity, your terms."
          />
          <FeatureCard
            title="Atmospheric Depth"
            description="Redefining UI through tonal shifts and obsidian layering. A precision instrument operating in a digital void."
          />
          <FeatureCard
            title="Tokenized Reputation"
            description="Your trading history is a persistent on-chain asset. Link, transfer, or sell your reputation NFT."
          />
          <FeatureCard
            title="Secured Escrow"
            description="Funds are locked in high-performance smart contracts. Resolution via decentralized mediators."
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="width-container py-24 max-w-4xl">
        <Faq />
      </section>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string, description: string }) {
  return (
    <Card className="bg-surface-container-low hover:bg-surface-container transition-all duration-500 border-none group relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pt-10 pb-4">
        <CardTitle className="text-lg font-bold text-white tracking-widest uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-10">
        <p className="text-on-surface-variant/80 leading-relaxed text-[1rem]">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
