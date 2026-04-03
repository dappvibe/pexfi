import { Username } from '@/shared/web3'
import { Button } from '@/components/ui/button'
import { useProfilePage } from '@/features/profile/hooks/useProfilePage'
import { Helmet } from '@dr.pogodin/react-helmet'
import { useConnection } from 'wagmi'
import { useActiveAccount } from 'thirdweb/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const { isConnected, isConnecting, isReconnecting, address: connectedAddress } = useConnection()
  const activeAccount = useActiveAccount()
  const { address, tokenId, profile, stats, isOwnProfile, create, rating, loading } = useProfilePage()

  const reallyConnected = isConnected || !!connectedAddress || !!activeAccount

  if (isOwnProfile && (isConnecting || isReconnecting)) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-primary animate-pulse font-bold uppercase tracking-[0.4em] text-[10px]">
      <div className="flex gap-3">
         <div className="w-2 h-2 rounded-full bg-primary" />
         <div className="w-2 h-2 rounded-full bg-primary opacity-60" />
         <div className="w-2 h-2 rounded-full bg-primary opacity-30" />
      </div>
      Verifying Wallet Connection
    </div>
  )

  if (isOwnProfile && !reallyConnected) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center space-y-10 px-6">
        <Helmet>
          <title>My Profile - PEXFI</title>
        </Helmet>
        <div className="h-32 w-32 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto text-primary ghost-border neon-glow">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
        </div>
        <div className="space-y-4">
           <h2 className="text-4xl font-bold text-white tracking-tight">Connect your <span className="text-primary">Identity</span></h2>
           <p className="text-on-surface-variant/60 text-lg font-medium leading-relaxed">Please connect your cryptographic wallet to view and manage your trading protocol profile.</p>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-primary animate-pulse font-bold uppercase tracking-[0.4em] text-[10px]">
      <div className="flex gap-3">
         <div className="w-2 h-2 rounded-full bg-primary" />
         <div className="w-2 h-2 rounded-full bg-primary opacity-60" />
         <div className="w-2 h-2 rounded-full bg-primary opacity-30" />
      </div>
      Accessing Reputational Node
    </div>
  )

  if (tokenId && stats) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-6 space-y-16 pb-32">
        <Helmet>
          <title>Profile #{tokenId.toString()} - PEXFI</title>
        </Helmet>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative">
           {/* Atmospheric Background Glow */}
           <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 -translate-y-1/2" />

           <div className="relative group">
              <Avatar className="h-48 w-48 border-none p-1 rounded-[3rem] bg-surface-lowest ghost-border ambient-shadow overflow-hidden">
                 <AvatarImage src={'https://effigy.im/a/' + address + '.svg'} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
                 <AvatarFallback className="text-5xl font-bold text-primary bg-primary/10">U</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-tertiary flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,184,105,0.4)]">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
           </div>

           <div className="flex-1 text-center md:text-left space-y-4 pt-4">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                 <span className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase">Protocol Reputation Node #{tokenId.toString()}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-none">
                <Username address={address} profile={profile} />
              </h1>
              <p className="text-on-surface-variant/80 max-w-2xl text-xl leading-[1.6] pt-4 font-medium italic">
                "{stats.info || (isOwnProfile ? 'No profile bio yet. Your trading reputation is built on chain and synchronized across nodes.' : 'No bio provided.')}"
              </p>
              {isOwnProfile && (
                <div className="pt-6">
                   <Button variant="outline" size="sm" className="h-12 rounded-xl px-8 border-white/5 bg-white/[0.02] text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-primary/10 hover:text-primary transition-all">
                     Edit Profile Metadata
                   </Button>
                </div>
              )}
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard label="Trust Score Index" value={rating(stats.upvotes, stats.downvotes)} subtext="Calculated via Protocol Feedback" />
          <StatCard label="Deals Completed" value={stats.dealsCompleted} subtext="Total Validated Handshakes" />
          <StatCard label="Disputes Lost" value={stats.disputesLost} subtext="Protocol Violation Record" />
          <StatCard label="Node Registered" value={stats.createdAt.toLocaleDateString()} subtext="First Settlement Activity" />
        </div>

        {/* Support Section/Protocol Info */}
        <div className="p-12 bg-surface-container-low rounded-[3rem] ghost-border flex flex-col md:flex-row items-center gap-10">
           <div className="h-20 w-20 bg-surface-lowest rounded-[1.5rem] flex items-center justify-center text-primary ghost-border shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
           </div>
           <div className="space-y-2">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Reputation Portability</h3>
              <p className="text-on-surface-variant/60 font-medium leading-relaxed">
                Your PEXFI reputation is an ERC721 token. It is non-custodial, censorship-resistant, and represents your historical performance within the protocol ecosystem. It can be linked, transferred, or sold as a sovereign identity asset.
              </p>
           </div>
        </div>
      </div>
    )
  }

  if (!isOwnProfile) {
    return (
       <div className="max-w-xl mx-auto py-32 text-center space-y-10 px-6">
        <div className="h-32 w-32 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-on-surface-variant/20 ghost-border">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="21" y2="12"/><line x1="21" y1="8" x2="17" y2="12"/></svg>
        </div>
        <div className="space-y-4">
           <h2 className="text-4xl font-bold text-white tracking-tight">Node Not Found</h2>
           <p className="text-on-surface-variant/60 text-lg font-medium leading-relaxed">This wallet address does not have a registered reputational NFT on the PEXFI protocol.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-32 px-6 text-center space-y-12 pb-48">
      <Helmet>
        <title>Setup Profile - PEXFI</title>
      </Helmet>

      <Card className="surface-container rounded-[3rem] border-none ambient-shadow overflow-hidden p-16 md:p-24 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary/20" />
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />

        <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-primary mb-10 ghost-border neon-glow">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>

        <div className="space-y-6">
           <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Establish On-Chain <span className="text-primary">Reputation</span></h2>
           <p className="text-on-surface-variant/80 text-xl font-medium leading-relaxed max-w-2xl mx-auto italic">
             "Minting a reputation node is required to publish liquidity offers and build sovereign trust in the decentralized marketplace."
           </p>
        </div>

        <div className="pt-16">
           <Button variant="neon" size="lg" className="w-full h-20 text-xl font-bold tracking-[0.3em] rounded-2xl" onClick={create}>
             Mint Reputation NFT
           </Button>
           <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/30">Standard Protocol Gas Fees Apply</p>
        </div>
      </Card>
    </div>
  )
}

function StatCard({ label, value, subtext }: { label: string, value: string | number, subtext: string }) {
  return (
    <div className="bg-surface-container-low p-10 rounded-[2.5rem] ambient-shadow flex flex-col gap-6 relative overflow-hidden group hover:bg-surface-container transition-all duration-500 border-none">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="flex flex-col gap-1">
         <div className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.4em] ml-1">{label}</div>
         <div className="text-[9px] font-bold text-primary/40 uppercase tracking-[0.2em] ml-1">{subtext}</div>
      </div>
      <div className="text-5xl font-bold text-white tracking-tighter leading-none tabular-nums group-hover:text-primary transition-colors">{value}</div>
    </div>
  )
}
