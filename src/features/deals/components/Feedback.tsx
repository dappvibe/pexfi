import { useState } from 'react'
import { useDeal } from '@/features/deals/hooks/useDeal.ts'
import { useDealFeedback } from '@/features/deals/hooks/useDealFeedback'
import { useQueryOffer } from '@/features/offers/hooks/useQueryOffer'
import { useConnection, useWriteContract } from 'wagmi'
import { dealAbi } from '@/wagmi'
import { isAddressEqual, type Address } from 'viem'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function Feedback() {
  const { deal } = useDeal()
  const { feedback } = useDealFeedback(deal?.address, deal?.taker)
  const { offer, isLoading } = useQueryOffer(deal?.offer)
  const { address: account } = useConnection()
  const { writeContractAsync, isPending } = useWriteContract()
  const { toast } = useToast()

  const [good, setGood] = useState<boolean | null>(null)
  const [comments, setComments] = useState('')

  if (!account || !offer || isLoading || !deal) return <div className="h-64 animate-pulse bg-white/5 rounded-[2rem]" />

  const isOwner = isAddressEqual(account as Address, offer.owner)
  const isTaker = isAddressEqual(account as Address, deal.taker)

  const feedbackGiven = isOwner ? feedback.forTaker?.given : isTaker ? feedback.forOwner?.given : false

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (good === null || !deal) return

    const t = toast({ title: "Submitting Feedback", description: "Waiting for wallet..." })
    try {
      await writeContractAsync({
        address: deal.address,
        abi: dealAbi,
        functionName: 'feedback',
        args: [good, comments || ''],
      })
      t.update({ id: t.id, title: "Protocol Contribution", description: "Your feedback has been bonded to the reputational NFT." })
    } catch (e: any) {
      t.update({ id: t.id, title: "Submission Failed", description: e.shortMessage || "Error submitting feedback", variant: "destructive" })
    }
  }

  if (feedbackGiven) {
    return (
      <div className="bg-green-500/5 rounded-[2.5rem] p-12 text-center ghost-border border-green-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20" />
        <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500 mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Handshake Verified</h3>
        <p className="text-on-surface-variant/60 font-medium">Thank you for contributing to the decentralized trust layer.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/40 ml-1">Protocol Contribution: Post-Settlement</div>
      <Card className="bg-surface-lowest rounded-[2rem] ghost-border p-10 ambient-shadow">
        <form onSubmit={submit} className="space-y-10">
          <div className="space-y-4">
             <Label className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2">Experience Validation</Label>
             <RadioGroup
                className="flex items-center gap-10"
                onValueChange={(val) => setGood(val === 'good')}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="good" id="good" className="border-green-500/20 text-green-500" />
                  <Label htmlFor="good" className="cursor-pointer text-green-500 font-bold uppercase tracking-widest text-xs">Protocol Positive</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="bad" id="bad" className="border-error/20 text-error" />
                  <Label htmlFor="bad" className="cursor-pointer text-error font-bold uppercase tracking-widest text-xs">Protocol Negative</Label>
                </div>
             </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2">Reputation Metadata (Optional)</Label>
            <textarea
              className="w-full bg-surface-container-high/20 ghost-border rounded-2xl p-6 text-sm font-medium tracking-tight focus:outline-none focus:neon-glow transition-all min-h-[120px] placeholder:text-on-surface-variant/20 shadow-inner"
              placeholder="How was the cryptographic exchange? Was the peer responsive?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          <Button type="submit" variant="neon" className="w-full h-16 font-bold tracking-[0.2em] rounded-xl shadow-xl" disabled={isPending || good === null}>
            {isPending ? 'Transmitting Feedback...' : 'Bond Reputation Feedback'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
