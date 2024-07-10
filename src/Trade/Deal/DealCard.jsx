import {Card, Descriptions, Divider, Steps} from "antd";
import React, {useContext} from "react";
import Username from "@/components/Username.jsx";
import {DealContext} from "@/Trade/Deal/Deal.jsx";
import Controls from "@/Trade/Deal/Controls.jsx";

function Progress() {
    const {deal} = useContext(DealContext);

    let steps = [
        {
            title: 'Accepting',
            description: 'Counterparty confirms the deal',
            status: 'process'
        },
        {
            title: 'Funding',
            description: 'Crypto escrowed',
            status: 'wait'
        },
        {
            title: 'Paying',
            description: 'Buyer send fiat',
            status: 'wait'
        },
        {
            title: 'Releasing',
            description: 'Seller send crypto',
            status: 'wait'
        }
    ];
    if (deal.state >= 1) {
        steps[0] = {status: 'finish', title: 'Accepted'};
        steps[1] = {...steps[1], status: 'process'};
    }
    if (deal.state >= 2) {
        steps[1] = {status: 'finish', title: 'Funded'};
        steps[2] = {...steps[2], status: 'process'};
    }
    if (deal.state >= 3) {
        steps[2] = {status: 'finish', title: 'Paid'};
        steps[3] = {...steps[3], status: 'process'};
    }
    if (deal.state >= 7) {
        steps[3] = {status: 'finish', title: 'Completed'};
    }

    if (deal.state === 5) {
        steps = [{status: 'finish', 'title': 'Cancelled'}];
    }

    return (<Steps items={steps} />);
}

function Info() {
    const {deal} = useContext(DealContext);
    let key = 1;
    const items = [
        {key: key++, label: 'Price', children: <b>{(deal.fiatAmount / deal.tokenAmount).toFixed(3)}</b>},
        {key: key++, label: 'Crypto', children: deal.tokenAmount},
        {key: key++, label: 'Fiat', children: deal.fiatAmount.toFixed(2)},
        {key: key++, label: 'Taker', children: <Username address={deal.taker} /> },
        {key: key++, label: 'Offer Owner', children: <Username address={deal.offer.owner} /> },
        {key: key++, label: 'Method', children: deal.offer.method},
        {key: key++, label: 'Payment instructions', children: deal.paymentInstructions || <i>None</i>},
        {key: key++, label: 'Terms', children: deal.offer.terms || <i>No terms</i>}
    ];

    return (<Descriptions items={items} />);
}

export default function DealCard()
{
    const {deal} = useContext(DealContext);

    return (
    <Card title={
        `${deal.offer.isSell ? 'Buying' : 'Selling'}
         ${deal.tokenAmount} ${deal.offer.token} 
         for ${deal.fiatAmount.toFixed(2)} ${deal.offer.fiat} 
         using ${deal.offer.method}`}
    >
        <Progress />
        <Divider />
        <Info />
        <Divider />
        <Controls />
    </Card>
    );
}
