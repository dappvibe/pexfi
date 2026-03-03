import Username from '@/components/Username'
import { Descriptions } from 'antd'

export default function OfferDescription({ offer }) {
  return (
    <Descriptions
      items={[
        {
          label: 'Owner',
          children: <Username avatar address={offer.owner} />,
        },
        { label: 'Price', children: offer.price },
        { label: 'Limits', children: `${offer.min} - ${offer.max}` },
        { label: 'Terms', children: offer.terms || <i>None</i> },
      ]}
    />
  )
}
