import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OfferFormProps {
  offer?: any
  form: any
  tokens: Record<string, any>
  fiats: Record<string, any>
  methods: Record<string, any>
  lockSubmit: boolean
  createOffer: (values: any) => Promise<void>
  fetchRate: () => void
  previewPrice: () => void
  handleSetRate?: () => Promise<void>
  handleSetLimits?: () => Promise<void>
  handleSetTerms?: () => Promise<void>
  handleToggleDisabled?: () => Promise<void>
}

export default function OfferForm({
  offer = null,
  form,
  tokens,
  fiats,
  methods,
  lockSubmit,
  createOffer,
  fetchRate,
  previewPrice,
  handleSetRate,
  handleSetLimits,
  handleSetTerms,
  handleToggleDisabled,
}: OfferFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createOffer(form.getFieldsValue())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-16">
      {/* Step 1: Core Parameters */}
      <div className="space-y-8">
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/40 ml-1">01 • Trade Architecture</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
          <div className="space-y-4">
            <Label className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2">I want to</Label>
            <RadioGroup
              defaultValue={offer ? offer.isSell.toString() : "false"}
              className="flex h-14 items-center gap-6 bg-surface-lowest rounded-xl ghost-border p-1 px-6 shadow-inner"
              disabled={!!offer}
              onValueChange={(val) => form.setFieldValue('isSell', val === 'true')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="buy" className="border-white/10" />
                <Label htmlFor="buy" className="cursor-pointer text-xs font-bold uppercase tracking-widest text-on-surface">Buy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="sell" className="border-white/10" />
                <Label htmlFor="sell" className="cursor-pointer text-xs font-bold uppercase tracking-widest text-on-surface">Sell</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2">Protocol Token</Label>
            <Select
              defaultValue={offer ? offer.token?.symbol : undefined}
              onValueChange={(val) => {
                form.setFieldValue('token', val)
                fetchRate()
              }}
              disabled={!!offer}
            >
              <SelectTrigger className="bg-surface-lowest ghost-border h-14 rounded-xl text-xs font-bold uppercase tracking-widest px-6 shadow-inner">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-surface-container border-white/10">
                {Object.keys(tokens).map((key) => (
                  <SelectItem key={key} value={key} className="text-xs font-bold uppercase tracking-widest">{key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2">Settlement Fiat</Label>
            <Select
              defaultValue={offer ? offer.fiat : undefined}
              onValueChange={(val) => {
                form.setFieldValue('fiat', val)
                fetchRate()
              }}
              disabled={!!offer}
            >
              <SelectTrigger className="bg-surface-lowest ghost-border h-14 rounded-xl text-xs font-bold uppercase tracking-widest px-6 shadow-inner">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-surface-container border-white/10">
                {Object.keys(fiats).map((symbol) => (
                  <SelectItem key={symbol} value={symbol} className="text-xs font-bold uppercase tracking-widest">{symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2">Handshake Method</Label>
            <Select
              defaultValue={offer ? offer.method : undefined}
              onValueChange={(val) => form.setFieldValue('method', val)}
              disabled={!!offer}
            >
              <SelectTrigger className="bg-surface-lowest ghost-border h-14 rounded-xl text-xs font-bold uppercase tracking-widest px-6 shadow-inner">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-surface-container border-white/10">
                {Object.keys(methods).map((key) => (
                  <SelectItem key={key} value={key} className="text-xs font-bold uppercase tracking-widest">{key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Step 2: Economics */}
      <div className="space-y-8">
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/40 ml-1">02 • Market Economics</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          <div className="space-y-4">
            <Label className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2">Exchange Margin (%)</Label>
            <div className="flex items-center gap-6">
              <div className="relative flex-1 group">
                <Input
                  type="number"
                  step="0.01"
                  className="bg-surface-lowest ghost-border h-16 rounded-xl pr-16 text-2xl font-bold shadow-inner group-focus-within:neon-glow transition-all"
                  defaultValue={offer ? (offer.rate - 1) * 100 : undefined}
                  onChange={(e) => {
                    form.setFieldValue('rate', parseFloat(e.target.value))
                    previewPrice()
                  }}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">%</div>
              </div>
              <div className="flex-1 relative">
                 <Input
                  className="bg-surface-container-highest/20 border-none h-16 rounded-xl text-on-surface-variant/40 text-center font-bold text-lg tabular-nums"
                  placeholder="~ Price"
                  disabled
                  value={`~ ${form.getFieldValue('preview') || '0.00'} ${form.getFieldValue('fiat') || ''}`}
                />
              </div>
              {offer && handleSetRate && (
                <Button type="button" variant="outline" className="h-16 px-8 rounded-xl" onClick={handleSetRate}>Update</Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2">Protocol Trading Limits</Label>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Min Limit"
                className="bg-surface-lowest ghost-border h-16 rounded-xl text-2xl font-bold px-8 shadow-inner focus-visible:neon-glow"
                defaultValue={offer ? offer.min : undefined}
                onChange={(e) => form.setFieldValue('min', e.target.value)}
              />
              <span className="text-on-surface-variant/20 font-bold">—</span>
              <Input
                placeholder="Max Limit"
                className="bg-surface-lowest ghost-border h-16 rounded-xl text-2xl font-bold px-8 shadow-inner focus-visible:neon-glow"
                defaultValue={offer ? offer.max : undefined}
                onChange={(e) => form.setFieldValue('max', e.target.value)}
              />
              {offer && handleSetLimits && (
                <Button type="button" variant="outline" className="h-16 px-8 rounded-xl" onClick={handleSetLimits}>Update</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Terms */}
      <div className="space-y-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/40 ml-1">03 • Immutable Terms</div>
        <Label className="text-on-surface-variant/40 uppercase text-[10px] font-bold tracking-[0.3em] ml-2 hidden">Terms & Conditions</Label>
        <textarea
          rows={6}
          placeholder="Blockchain written. Keep terms concise, clear, and professional. Visible to all market participants."
          className="flex min-h-[160px] w-full rounded-[2rem] ghost-border bg-surface-lowest px-10 py-8 text-lg font-medium tracking-tight ring-offset-background placeholder:text-on-surface-variant/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ghost-border disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-inner"
          defaultValue={offer ? offer.terms : undefined}
          onChange={(e) => form.setFieldValue('terms', e.target.value)}
        />
        {offer && handleSetTerms && (
           <Button type="button" variant="outline" className="h-12 px-8 rounded-xl" onClick={handleSetTerms}>Update Terms</Button>
        )}
      </div>

      <div className="flex flex-col gap-6 pt-10">
        {offer && handleToggleDisabled && (
          <Button
            type="button"
            variant="outline"
            className="w-full h-16 border-white/5 bg-white/[0.02] hover:bg-destructive/10 hover:text-destructive transition-all rounded-2xl text-[10px] tracking-[0.3em]"
            onClick={handleToggleDisabled}
          >
            {offer.disabled ? 'ACTIVATE PROTOCOL NODE' : 'DEACTIVATE PROTOCOL NODE'}
          </Button>
        )}

        {!offer && (
          <Button type="submit" variant="neon" className="w-full h-20 text-xl font-bold tracking-[0.3em] rounded-2xl" disabled={lockSubmit}>
            {lockSubmit ? 'Deploying Liquidity Node...' : 'DEPLOY SMART CONTRACT'}
          </Button>
        )}
      </div>
    </form>
  )
}
