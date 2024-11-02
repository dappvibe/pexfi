import {Card, Divider} from "antd";
import React, {useContext} from "react";
import {DealContext} from "./Deal.jsx";
import Controls from "./Controls.jsx";
import {useAccount} from "wagmi";
import {equal} from "../../../utils";
import DealProgress from "./DealProgress";
import DealInfo from "./DealInfo";

export default function DealCard()
{
    const {deal} = useContext(DealContext);
    const {address} = useAccount();

    let title = '';
    if (equal(deal.offer.owner, address)) {
        title += deal.offer.isSell ? 'Selling' : 'Buying';
    } else if (equal(deal.taker, address)) {
        title += deal.offer.isSell ? 'Buying' : 'Selling';
    }
    title += ' ' + deal.offer.token.id;
    title += ' for ' + deal.offer.fiat;
    title += ' using ' + deal.offer.method;

    return (
    <Card title={title}
    >
        <DealProgress />
        <Divider />
        <DealInfo />
        <Divider />
        <Controls />
    </Card>
    );
}
