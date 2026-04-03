import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function Faq() {
  const faq = [
    {
      key: '4',
      label: 'How to trade Bitcoin?',
      children: <p className="text-on-surface-variant/80 leading-relaxed py-4">Bitcoin must be bridged first. The platform supports ERC20 tokens only.</p>,
    },
    {
      key: '1',
      label: 'Do you need a license?',
      children: (
        <p className="text-on-surface-variant/80 leading-relaxed py-4">
          This website is a tool to publish smart contracts to open blockchains. Then published contracts are listed in
          catalogue. The website does not touch crypto or fiat money in any way. It does not provide any financial
          services.
        </p>
      ),
    },
    {
      key: '2',
      label: 'Who are mediators?',
      children: <p className="text-on-surface-variant/80 leading-relaxed py-4">Mediators are arbitrators who can resolve disputes between traders. They are members of the DAO.</p>,
    },
    {
      key: '3',
      label: 'Are there any fees?',
      children: (
        <div className="flex flex-col gap-2 text-on-surface-variant/80 leading-relaxed py-4">
          <p>
            Offer makers pay <b className="text-primary">1%</b> on crypto amount. Takers pay no fees.
          </p>
          <p>Fees can be paid with tokens to get 50% discount.</p>
        </div>
      ),
    },
    {
      key: '5',
      label: 'Can I trade Monero?',
      children: <p className="text-on-surface-variant/80 leading-relaxed py-4">Yes. Coming soon.</p>,
    },
    {
      key: '6',
      label: 'Where are token prices come from?',
      children: <p className="text-on-surface-variant/80 leading-relaxed py-4">Market prices of crypto are fetched from Uniswap at real-time.</p>,
    }
  ]

  return (
    <div className="flex flex-col gap-10">
      <h2 className="text-3xl font-bold tracking-tight text-white text-left uppercase tracking-widest">F.A.Q.</h2>
      <Accordion type="single" collapsible className="w-full">
        {faq.map((item) => (
          <AccordionItem key={item.key} value={item.key} className="border-white/5 py-2">
            <AccordionTrigger className="text-xl font-semibold hover:text-primary transition-all text-left py-6">
              {item.label}
            </AccordionTrigger>
            <AccordionContent>
              {item.children}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
