import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface CreateDealFormProps {
  offer: any
  form: any
  lockButton: boolean
  submitLabel: string
  submitDisabled: boolean
  onFinish: (values: any) => void
  syncTokenAmount: (fiat: string) => void
  syncFiatAmount: (token: string) => void
}

export default function CreateDealForm({
  offer,
  form,
  lockButton,
  submitLabel,
  submitDisabled,
  onFinish,
  syncTokenAmount,
  syncFiatAmount,
}: CreateDealFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFinish(form.getFieldsValue())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Label htmlFor="tokenAmount" className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2">
            Receive {offer.token?.symbol}
          </Label>
          <div className="relative group">
            <Input
              id="tokenAmount"
              placeholder="0.00"
              className="bg-surface-lowest ghost-border h-16 text-2xl font-bold pr-20 shadow-inner group-focus-within:neon-glow transition-all"
              disabled={offer.disabled}
              onChange={(e) => syncFiatAmount(e.target.value)}
              {...form.getFieldProps('tokenAmount')}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary font-bold uppercase text-[10px] tracking-widest bg-primary/10 px-3 py-1 rounded-lg">
              {offer.token?.symbol}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="fiatAmount" className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2">
            Send {offer.fiat}
          </Label>
          <div className="relative group">
            <Input
              id="fiatAmount"
              placeholder="0.00"
              className="bg-surface-lowest ghost-border h-16 text-2xl font-bold pr-20 shadow-inner group-focus-within:neon-glow transition-all"
              disabled={offer.disabled}
              onChange={(e) => syncTokenAmount(e.target.value)}
              {...form.getFieldProps('fiatAmount')}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40 font-bold uppercase text-[10px] tracking-widest">
              {offer.fiat}
            </div>
          </div>
        </div>
      </div>

      {offer.availableMethods?.length > 0 && (
        <div className="space-y-4">
          <Label htmlFor="method" className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2">
            Protocol Payment Node
          </Label>
          <Select
            defaultValue={offer.availableMethods[0].index.toString()}
            onValueChange={(val) => form.setFieldValue('method', parseInt(val))}
          >
            <SelectTrigger id="method" className="h-16 bg-surface-lowest ghost-border text-xs font-bold uppercase tracking-widest px-8 shadow-inner hover:bg-white/5 transition-all">
              <SelectValue placeholder="Protocol: Select Handshake Method" />
            </SelectTrigger>
            <SelectContent className="bg-surface-container border-white/10">
              {offer.availableMethods.map((m: any) => (
                <SelectItem key={m.index} value={m.index.toString()} className="text-[10px] font-bold uppercase tracking-widest">
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-4">
        <Label htmlFor="paymentInstructions" className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2">
          Private Protocol Metadata
        </Label>
        <textarea
          id="paymentInstructions"
          placeholder="Enter payment instructions, wallet IDs, or coordination notes (visible only to peer)"
          className="flex min-h-[160px] w-full rounded-[1.5rem] ghost-border bg-surface-lowest px-8 py-6 text-sm font-medium tracking-tight ring-offset-background placeholder:text-on-surface-variant/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ghost-border disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-inner"
          disabled={offer.disabled}
          {...form.getFieldProps('paymentInstructions')}
        />
      </div>

      <Button type="submit" variant="neon" size="lg" className="w-full h-18 text-lg font-bold tracking-[0.2em] rounded-2xl" disabled={submitDisabled || lockButton}>
        {lockButton ? 'Processing Handshake...' : submitLabel}
      </Button>
    </form>
  )
}
